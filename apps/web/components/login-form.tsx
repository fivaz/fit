"use client";

import React, { ComponentProps, FormEvent, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/logo";
import { SocialAuthButtons } from "@/components/social-auth-buttons";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	scrollFieldIntoView,
	scrollPrimaryActionIntoView,
} from "@/hooks/use-software-keyboard-scroll";
import { APP_NAME, ROUTES } from "@/lib/consts";
import { signInWithEmailForMobile } from "@/lib/mobile/auth";
import { cn } from "@/lib/utils";

export function LoginForm({ className, ...props }: ComponentProps<"div">) {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [rememberMe, setRememberMe] = useState(true);
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const submitRef = useRef<HTMLButtonElement>(null);

	const handleFieldFocus = (element: HTMLElement) => {
		scrollFieldIntoView(element);
	};

	const handlePasswordFocus = (element: HTMLElement) => {
		handleFieldFocus(element);
		if (submitRef.current) {
			scrollPrimaryActionIntoView(submitRef.current);
		}
	};

	const handleLogin = async (e: FormEvent) => {
		e.preventDefault();
		setLoading(true);
		try {
			await signInWithEmailForMobile({
				email,
				password,
				rememberMe,
				handlers: {
					onResponse: () => setLoading(false),
					onError: (message) => {
						toast.error(message);
					},
					onSuccess: () => {
						toast.success("Welcome back!");
						router.push(ROUTES.HOME);
					},
				},
			});
		} catch (error) {
			console.error(error);
			toast.error("An unexpected error occurred.");
			setLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<form onSubmit={handleLogin}>
				<FieldGroup>
					<div className="flex flex-col items-center gap-2 text-center">
						<div className="flex flex-col items-center gap-2 font-medium">
							<div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md">
								<Logo className="size-8 text-white" />
							</div>
							<span className="sr-only">{APP_NAME}</span>
						</div>
						<h1 className="text-xl font-bold">Welcome back</h1>
						<FieldDescription>
							Don&apos;t have an account?{" "}
							<Link href={ROUTES.REGISTER} className="underline underline-offset-4">
								Sign up
							</Link>
						</FieldDescription>
					</div>

					<Field>
						<FieldLabel htmlFor="email">Email</FieldLabel>
						<Input
							id="email"
							type="email"
							placeholder="m@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							onFocus={(e) => handleFieldFocus(e.currentTarget)}
							required
						/>
					</Field>

					<Field>
						<div className="flex items-center justify-between">
							<FieldLabel htmlFor="password">Password</FieldLabel>
							<Link href="#" className="text-muted-foreground text-xs hover:underline">
								Forgot password?
							</Link>
						</div>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							onFocus={(e) => handlePasswordFocus(e.currentTarget)}
							required
						/>
					</Field>

					<div className="flex items-center space-x-2">
						<Checkbox
							id="remember"
							checked={rememberMe}
							onCheckedChange={(checked) => setRememberMe(!!checked)}
						/>
						<label htmlFor="remember" className="cursor-pointer text-sm leading-none font-medium">
							Remember me
						</label>
					</div>

					<Field>
						<Button ref={submitRef} type="submit" className="w-full" disabled={loading}>
							{loading ? <Loader2 className="size-4 animate-spin" /> : "Login"}
						</Button>
					</Field>

					<SocialAuthButtons separatorLabel="Or continue with" disabled={loading} />
				</FieldGroup>
			</form>
		</div>
	);
}
