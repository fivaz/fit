import { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { APP_NAME, ROUTES } from "@/lib/consts";

export const metadata: Metadata = {
	title: "Privacy Policy",
};

const LAST_UPDATED = "September 11, 2026";
const SUPPORT_EMAIL = "contact@sfivaz.com";

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="space-y-2">
			<h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
			<div className="space-y-3 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
				{children}
			</div>
		</section>
	);
}

export default function PrivacyPolicyPage() {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="mx-auto w-full max-w-2xl px-6 py-12">
				<div className="mb-8 flex flex-col items-center gap-2 text-center">
					<div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md">
						<Logo className="size-6" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">Privacy Policy</h1>
					<p className="text-xs text-gray-500 dark:text-gray-400">Last updated: {LAST_UPDATED}</p>
				</div>

				<div className="space-y-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
					<Section title="Overview">
						<p>
							{APP_NAME} (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) is a workout tracking
							application. This policy explains what information we collect when you use the app,
							how we use it, and the choices you have — including how to delete your account and
							data.
						</p>
					</Section>

					<Section title="Information We Collect">
						<p>We collect the information you provide directly to us:</p>
						<ul className="list-disc space-y-1 pl-5">
							<li>
								<span className="font-medium text-gray-900 dark:text-white">Account data:</span>{" "}
								name, email address, password (stored as a salted hash, never in plain text), and an
								optional profile image.
							</li>
							<li>
								<span className="font-medium text-gray-900 dark:text-white">Workout data:</span> the
								programs, exercises, workout sessions, sets, reps, and weights you log.
							</li>
							<li>
								<span className="font-medium text-gray-900 dark:text-white">Body metrics:</span>{" "}
								weight, body fat percentage, muscle mass, and visceral fat level that you choose to
								record.
							</li>
							<li>
								<span className="font-medium text-gray-900 dark:text-white">Device settings:</span>{" "}
								your device time zone, used to display dates and schedule workouts correctly.
							</li>
							<li>
								<span className="font-medium text-gray-900 dark:text-white">Diagnostic data:</span>{" "}
								crash reports and error logs, collected automatically to help us fix bugs.
							</li>
						</ul>
						<p>
							If you choose to sign in with Google or GitHub (where available), we receive the name,
							email address, and profile image associated with that account.
						</p>
					</Section>

					<Section title="How We Use Your Information">
						<p>We use your information solely to operate {APP_NAME}:</p>
						<ul className="list-disc space-y-1 pl-5">
							<li>To create and secure your account, and to authenticate you when you sign in.</li>
							<li>To store and display your programs, workouts, and body metrics back to you.</li>
							<li>To diagnose and fix crashes and errors.</li>
						</ul>
						<p>We do not sell your data, and we do not use it for advertising.</p>
					</Section>

					<Section title="Data Storage &amp; Security">
						<p>
							Your data is stored in a managed cloud database and served by our API over encrypted
							(HTTPS) connections. Access to your data is scoped to your account, and we take
							reasonable technical measures to protect it from unauthorized access.
						</p>
					</Section>

					<Section title="Third-Party Services">
						<p>We rely on a small number of third-party services to run {APP_NAME}:</p>
						<ul className="list-disc space-y-1 pl-5">
							<li>Cloud hosting and database providers, to store and serve your data.</li>
							<li>Sentry, for crash and error reporting.</li>
							<li>
								Google and GitHub, only if you choose to sign in using one of those providers.
							</li>
						</ul>
						<p>These providers process data only as needed to deliver the service.</p>
					</Section>

					<Section title="Your Rights &amp; Account Deletion">
						<p>
							You can permanently delete your account, and all data associated with it — programs,
							exercises, workouts, and body metrics — at any time from{" "}
							<span className="font-medium text-gray-900 dark:text-white">
								Settings → Delete Account
							</span>{" "}
							inside the app. This action is immediate and cannot be undone.
						</p>
						<p>
							You can also contact us at the address below to request a copy of your data or ask us
							to delete it on your behalf.
						</p>
					</Section>

					<Section title="Children's Privacy">
						<p>
							{APP_NAME} is not directed to children under 13, and we do not knowingly collect
							personal information from children under 13.
						</p>
					</Section>

					<Section title="Changes to This Policy">
						<p>
							We may update this policy from time to time. Material changes will be reflected by
							updating the &quot;Last updated&quot; date above.
						</p>
					</Section>

					<Section title="Contact Us">
						<p>
							Questions about this policy or your data? Email us at{" "}
							<a href={`mailto:${SUPPORT_EMAIL}`} className="underline underline-offset-4">
								{SUPPORT_EMAIL}
							</a>
							.
						</p>
					</Section>
				</div>

				<div className="mt-6 text-center">
					<Link
						href={ROUTES.LOGIN}
						className="text-sm text-gray-500 underline underline-offset-4 dark:text-gray-400"
					>
						Back to sign in
					</Link>
				</div>
			</div>
		</div>
	);
}
