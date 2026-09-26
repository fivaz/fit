"use client";

import { useState } from "react";

import { Loader2Icon, SparklesIcon } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useBillingStatus } from "@/hooks/billing/use-billing-status";
import { createCheckoutSession } from "@/lib/billing/api";
import { isNativeMobileRuntime } from "@/lib/mobile/runtime";

type PaywallDialogProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
};

export function PaywallDialog({ open, onOpenChange }: PaywallDialogProps) {
	const { status } = useBillingStatus();
	const [isRedirecting, setIsRedirecting] = useState(false);

	const handleBuyCredits = async () => {
		setIsRedirecting(true);
		try {
			const { url } = await createCheckoutSession();
			window.location.href = url;
		} catch (err) {
			const message = err instanceof Error ? err.message : "Failed to start checkout.";
			toast.error(message);
			setIsRedirecting(false);
		}
	};

	const pack = status?.pack;

	// Apple requires In-App Purchase for credits, which the iOS app doesn't have yet. Its rules also
	// forbid pointing users to another way to pay (the website), so the message only states that
	// buying isn't available here. Credits bought elsewhere still work in the app.
	if (isNativeMobileRuntime()) {
		const credits = status?.credits;
		return (
			<Dialog open={open} onOpenChange={onOpenChange}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<SparklesIcon className="text-primary size-5" aria-hidden />
							{credits === 0 ? "Out of credits" : "AI credits"}
						</DialogTitle>
						<DialogDescription>
							Buying credits isn&apos;t available in the iOS app yet.
							{credits === undefined
								? null
								: ` You have ${credits} ${credits === 1 ? "credit" : "credits"} left.`}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button type="button" className="w-full" onClick={() => onOpenChange(false)}>
							OK
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<SparklesIcon className="text-primary size-5" aria-hidden />
						Out of credits
					</DialogTitle>
					<DialogDescription>
						You&apos;ve used all of your free AI program generations. Buy more credits to keep
						generating programs.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						type="button"
						className="w-full"
						disabled={!pack || isRedirecting}
						onClick={handleBuyCredits}
						aria-label={pack ? `Buy ${pack.displayName} for ${pack.displayPrice}` : "Buy credits"}
					>
						{isRedirecting ? (
							<>
								<Loader2Icon className="size-4 animate-spin" aria-hidden />
								Redirecting...
							</>
						) : pack ? (
							`Buy ${pack.displayName} — ${pack.displayPrice}`
						) : (
							"Buy Credits"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
