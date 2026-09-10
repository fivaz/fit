import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { fromNodeHeaders } from "better-auth/node";
import type { Request } from "express";

import { auth } from "@/auth/auth";

export type AuthedRequest = Request & { userId: string };

@Injectable()
export class AuthGuard implements CanActivate {
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest<AuthedRequest>();
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(request.headers),
		});

		if (!session?.user.id) {
			throw new UnauthorizedException("Unauthorized");
		}

		request.userId = session.user.id;
		return true;
	}
}
