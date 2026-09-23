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
