import { AuthPublicShell } from "@/components/auth/auth-public-shell";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
	return (
		<AuthPublicShell>
			<div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
				<div className="w-full max-w-sm">
					<RegisterForm />
				</div>
			</div>
		</AuthPublicShell>
	);
}
