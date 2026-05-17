import { AuthPublicShell } from "@/components/auth/auth-public-shell";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
	return (
		<AuthPublicShell>
			<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
				<div className="w-full max-w-sm">
					<LoginForm />
				</div>
			</div>
		</AuthPublicShell>
	);
}
