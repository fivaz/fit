import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { AuthPublicShell } from "@/components/auth/auth-public-shell";
import { RegisterForm } from "@/components/register-form";

export default function RegisterPage() {
	return (
		<AuthPublicShell>
			<AuthPageLayout>
				<RegisterForm />
			</AuthPageLayout>
		</AuthPublicShell>
	);
}
