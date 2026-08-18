import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { AuthPublicShell } from "@/components/auth/auth-public-shell";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
	return (
		<AuthPublicShell>
			<AuthPageLayout>
				<LoginForm />
			</AuthPageLayout>
		</AuthPublicShell>
	);
}
