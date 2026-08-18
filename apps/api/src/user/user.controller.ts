import { Body, Controller, Patch, UseGuards } from "@nestjs/common";

import { ApiError } from "@/api-error";
import { AuthGuard } from "@/auth/auth.guard";
import { UserId } from "@/auth/user-id.decorator";
import { updateTimezone } from "@/user/user.service";

@Controller("user")
@UseGuards(AuthGuard)
export class UserController {
	@Patch("timezone")
	async timezone(@UserId() userId: string, @Body() body: { timezone?: string }) {
		if (!body.timezone) {
			throw new ApiError("timezone is required", 400);
		}
		return updateTimezone(body.timezone, userId);
	}
}
