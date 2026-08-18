import {
	ArgumentsHost,
	Catch,
	ExceptionFilter,
	HttpException,
	UnauthorizedException,
} from "@nestjs/common";
import type { Response } from "express";

import { ApiError } from "@/api-error";
import { logError } from "@/logger";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const response = host.switchToHttp().getResponse<Response>();

		if (exception instanceof ApiError) {
			return response.status(exception.status).json({ error: exception.message });
		}

		if (exception instanceof UnauthorizedException) {
			return response.status(401).json({ error: "Unauthorized" });
		}

		if (exception instanceof HttpException) {
			const status = exception.getStatus();
			const body = exception.getResponse();
			const message =
				typeof body === "string"
					? body
					: Array.isArray((body as { message?: unknown }).message)
						? (body as { message: string[] }).message[0]
						: ((body as { message?: string }).message ?? exception.message);
			return response.status(status).json({ error: message });
		}

		logError(exception, "unhandled");
		return response.status(500).json({ error: "Internal server error" });
	}
}
