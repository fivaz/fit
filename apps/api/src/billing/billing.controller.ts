import { Controller, Get, Post, UseGuards } from "@nestjs/common";

import { AuthGuard } from "@/auth/auth.guard";
import { UserId } from "@/auth/user-id.decorator";
import { createCheckoutSession, getCreditBalance } from "@/billing/billing.service";

@Controller("billing")
@UseGuards(AuthGuard)
export class BillingController {
	@Get("status")
	status(@UserId() userId: string) {
		return getCreditBalance(userId);
	}

	@Post("checkout")
	checkout(@UserId() userId: string) {
		return createCheckoutSession(userId);
	}
}
