import { createParamDecorator, ExecutionContext } from "@nestjs/common";

import type { AuthedRequest } from "@/auth/auth.guard";

export const UserId = createParamDecorator((_data: unknown, ctx: ExecutionContext): string => {
	return ctx.switchToHttp().getRequest<AuthedRequest>().userId;
});
