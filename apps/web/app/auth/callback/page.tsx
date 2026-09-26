import { AuthPageLayout } from "@/components/auth/auth-page-layout";
import { SocialAuthCallback } from "@/components/auth/social-auth-callback";

export default function SocialAuthCallbackPage() {
	return (
		<AuthPageLayout>
			<SocialAuthCallback />
		</AuthPageLayout>
	);
}
