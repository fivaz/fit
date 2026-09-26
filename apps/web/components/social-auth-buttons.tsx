"use client";

import React, { ComponentType, useState } from "react";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { AppleIcon } from "@/components/icons/apple-icon";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Button } from "@/components/ui/button";
import { Field, FieldSeparator } from "@/components/ui/field";
import { ROUTES } from "@/lib/consts";
import { logError } from "@/lib/logger";
import {
	getAvailableSocialProviders,
	signInWithSocialForMobile,
	type SocialProvider,
} from "@/lib/mobile/auth";
import { isNativeSocialCancellation } from "@/lib/mobile/native-social-login";
import { cn } from "@/lib/utils";

const PROVIDER_LABELS: Record<
	SocialProvider,
	{ label: string; Icon: ComponentType<{ className?: string }> }
> = {
	apple: { label: "Apple", Icon: AppleIcon },
	google: { label: "Google", Icon: GoogleIcon },
};

// Tailwind only emits classes it can see literally, so the column count can't be interpolated.
const PROVIDER_GRID_COLUMNS: Record<number, string> = {
	1: "",
	2: "sm:grid-cols-2",
};

type SocialAuthButtonsProps = {
	/** Copy for the separator, e.g. "Or continue with". */
	separatorLabel: string;
	/** Disables the buttons while the surrounding form is submitting. */
	disabled?: boolean;
};

export function SocialAuthButtons({ separatorLabel, disabled = false }: SocialAuthButtonsProps) {
	const [pendingProvider, setPendingProvider] = useState<SocialProvider | null>(null);
	const router = useRouter();
	const providers = getAvailableSocialProviders();

	const handleSocialLogin = async (provider: SocialProvider) => {
		setPendingProvider(provider);
		try {
			const signedInNatively = await signInWithSocialForMobile({
				provider,
				handlers: { onError: (message) => toast.error(message) },
			});
			if (signedInNatively) {
				toast.success("Welcome!");
				router.push(ROUTES.HOME);
			}
		} catch (error) {
			if (!isNativeSocialCancellation(error)) {
				logError(error, "SocialAuthButtons#handleSocialLogin");
				toast.error(`${PROVIDER_LABELS[provider].label} sign-in failed.`);
			}
		} finally {
			setPendingProvider(null);
		}
	};

	return (
		<>
			<FieldSeparator>{separatorLabel}</FieldSeparator>

			<Field className={cn("grid gap-4", PROVIDER_GRID_COLUMNS[providers.length])}>
				{providers.map((provider) => {
					const { label, Icon } = PROVIDER_LABELS[provider];
					return (
						<Button
							key={provider}
							variant="outline"
							type="button"
							aria-label={`Continue with ${label}`}
							disabled={disabled || pendingProvider !== null}
							onClick={() => handleSocialLogin(provider)}
						>
							{pendingProvider === provider ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<>
									<Icon className="size-5" />
									{label}
								</>
							)}
						</Button>
					);
				})}
			</Field>
		</>
	);
}
