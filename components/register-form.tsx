"use client";

import { ChangeEvent, ComponentProps, FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { GithubIcon } from "@/components/icons/github-icon";
import { GoogleIcon } from "@/components/icons/google-icon";
import { Logo } from "@/components/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { signIn, signUp } from "@/lib/auth-client";
import { APP_NAME, ROUTES } from "@/lib/consts";
import { cn } from "@/lib/utils";

export function RegisterForm({ className, ...props }: ComponentProps<"div">) {
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [passwordConfirmation, setPasswordConfirmation] = useState("");
	const [image, setImage] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(null);
	const router = useRouter();
	const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			setImage(file);
			const reader = new FileReader();
			reader.onloadend = () => setImagePreview(reader.result as string);
			reader.readAsDataURL(file);
		}
	};

	const handleSocialLogin = async (provider: "google" | "github") => {
		setSocialLoading(provider);
		try {
			await signIn.social({
				provider,
				callbackURL: ROUTES.HOME,
			});
		} catch (error) {
			console.log(error);
			toast.error(`${provider} sign up failed.`);
			setSocialLoading(null);
		}
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		if (password !== passwordConfirmation) {
			toast.error("Passwords do not match");
			return;
		}

		setLoading(true);
		try {
			await signUp.email({
				email,
				password,
				timezone,
				name: `${firstName.trim()} ${lastName.trim()}`,
				image: image ? await convertImageToBase64(image) : undefined,
				callbackURL: ROUTES.HOME,
				fetchOptions: {
					onResponse: () => setLoading(false),
					onError: (ctx) => {
						toast.error(ctx.error.message);
					},
					onSuccess: () => {
						toast.success("Account created successfully!");
						router.push(ROUTES.HOME);
					},
				},
			});
		} catch (error) {
			console.log(error);
			toast.error("Something went wrong. Please try again.");
			setLoading(false);
		}
	};

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			<form onSubmit={handleSubmit}>
				<FieldGroup>
					<div className="flex flex-col items-center gap-2 text-center">
						<Link href="/public" className="flex flex-col items-center gap-2 font-medium">
							<div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md">
								<Logo className="size-8" />
							</div>
							<span className="sr-only">{APP_NAME}</span>
						</Link>
						<h1 className="text-xl font-bold">Create an account</h1>
						<FieldDescription>
							Already have an account?{" "}
							<Link href={ROUTES.LOGIN} className="underline underline-offset-4">
								Sign in
							</Link>
						</FieldDescription>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<Field>
							<FieldLabel htmlFor="first-name">First name</FieldLabel>
							<Input
								id="first-name"
								placeholder="Max"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
								required
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="last-name">Last name</FieldLabel>
							<Input
								id="last-name"
								placeholder="Robinson"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
								required
							/>
						</Field>
					</div>

					<Field>
						<FieldLabel htmlFor="email">Email</FieldLabel>
						<Input
							id="email"
							type="email"
							placeholder="m@example.com"
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							required
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor="password">Password</FieldLabel>
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
						/>
					</Field>

					<Field>
						<FieldLabel htmlFor="password-confirmation">Confirm Password</FieldLabel>
						<Input
							id="password-confirmation"
							type="password"
							placeholder="••••••••"
							value={passwordConfirmation}
							onChange={(e) => setPasswordConfirmation(e.target.value)}
							required
						/>
					</Field>

					<Field>
						<FieldLabel>Profile Image (optional)</FieldLabel>
						<div className="flex items-center gap-4">
							<Avatar className="size-16">
								<AvatarImage src={imagePreview || undefined} />
								<AvatarFallback>
									{firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : "?"}
								</AvatarFallback>
							</Avatar>
							<div className="flex flex-1 items-center gap-2">
								<Input
									id="image"
									type="file"
									accept="image/*"
									onChange={handleImageChange}
									className="flex-1"
								/>
								{imagePreview && (
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => {
											setImage(null);
											setImagePreview(null);
										}}
									>
										<X className="size-4" />
									</Button>
								)}
							</div>
						</div>
					</Field>

					<Button type="submit" className="w-full" disabled={loading || !!socialLoading}>
						{loading ? <Loader2 className="size-4 animate-spin" /> : "Create an account"}
					</Button>

					<FieldSeparator>Or sign up with</FieldSeparator>

					<Field className="grid gap-4 sm:grid-cols-2">
						<Button
							variant="outline"
							type="button"
							disabled={loading || !!socialLoading}
							onClick={() => handleSocialLogin("github")}
						>
							{socialLoading === "github" ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<>
									<GithubIcon className="size-5" /> GitHub
								</>
							)}
						</Button>
						<Button
							variant="outline"
							type="button"
							disabled={loading || !!socialLoading}
							onClick={() => handleSocialLogin("google")}
						>
							{socialLoading === "google" ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<>
									<GoogleIcon className="size-5" /> Google
								</>
							)}
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</div>
	);
}

async function convertImageToBase64(file: File): Promise<string> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onloadend = () => resolve(reader.result as string);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});
}
