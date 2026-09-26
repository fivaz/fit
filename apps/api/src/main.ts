import "./load-env.js";
import "reflect-metadata";

import { NestFactory } from "@nestjs/core";
import * as Sentry from "@sentry/node";
import { toNodeHandler } from "better-auth/node";
import express, { type NextFunction, type Request, type Response } from "express";

import { AppModule } from "@/app.module";
import { auth } from "@/auth/auth";
import { STRIPE_WEBHOOK_PATH } from "@/billing/billing-webhook.controller";
import { corsOriginDelegate } from "@/cors";
import { ApiExceptionFilter } from "@/exception.filter";
import { warmUpDatabase } from "@/prisma/warm-up";

const PORT = Number(process.env.API_PORT ?? "3001");

async function bootstrap() {
	if (process.env.NODE_ENV === "production") {
		Sentry.init({
			dsn: "https://53346ababcca5c37041d2b5cd7cfaae3@o4508857555550208.ingest.de.sentry.io/4510635945492560",
			tracesSampleRate: 1,
			sendDefaultPii: true,
		});
	}

	// Not awaited: the database resumes while Nest sets up, instead of during the first request.
	void warmUpDatabase();

	const app = await NestFactory.create(AppModule, { bodyParser: false });
	const expressApp = app.getHttpAdapter().getInstance();

	// CORS must run before Better Auth. toNodeHandler intercepts `/api/auth/*`
	// (including OPTIONS) and does not emit CORS headers, so a later enableCors
	// never sees the preflight and the browser never sends sign-in/sign-up POST.
	app.enableCors({
		origin: corsOriginDelegate,
		credentials: true,
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],
		allowedHeaders: [
			"Content-Type",
			"Authorization",
			"Cookie",
			"X-Requested-With",
			"Accept",
			"Origin",
			"Cache-Control",
			"Pragma",
		],
		exposedHeaders: ["set-auth-token", "Set-Auth-Token"],
	});

	// Stripe signature verification needs the raw, unparsed body, so it must be routed to
	// express.raw() instead of express.json() before any body-parsing middleware runs.
	const handleAuth = toNodeHandler(auth);
	expressApp.use((req: Request, res: Response, next: NextFunction) => {
		const path = req.url.split("?")[0];
		if (path.startsWith("/api/auth")) {
			return handleAuth(req, res);
		}
		if (path === STRIPE_WEBHOOK_PATH) {
			return express.raw({ type: "application/json" })(req, res, next);
		}
		return express.json()(req, res, next);
	});

	app.setGlobalPrefix("api");
	app.useGlobalFilters(new ApiExceptionFilter());

	await app.listen(PORT);
	console.log(`Fit API listening on http://localhost:${PORT}`);
}

void bootstrap();
