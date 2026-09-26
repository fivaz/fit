import { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import { Logo } from "@/components/logo";
import { WebOnly, WebOrApp } from "@/components/platform/web-only";
import { APP_NAME, ROUTES } from "@/lib/consts";

export const metadata: Metadata = {
	title: "Terms & Refund Policy",
};

const LAST_UPDATED = "September 23, 2026";
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

export default function TermsPage() {
	return (
		<div className="min-h-screen bg-gray-50 dark:bg-gray-900">
			<div className="mx-auto w-full max-w-2xl px-6 py-12">
				<div className="mb-8 flex flex-col items-center gap-2 text-center">
					<div className="bg-primary text-primary-foreground flex size-10 items-center justify-center rounded-md">
						<Logo className="size-6" />
					</div>
					<h1 className="text-2xl font-bold text-gray-900 dark:text-white">
						<WebOrApp web="Terms & Refund Policy" app="Terms" />
					</h1>
					<p className="text-xs text-gray-500 dark:text-gray-400">Last updated: {LAST_UPDATED}</p>
				</div>

				<div className="space-y-8 rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-800">
					<Section title="The Service">
						<p>
							{APP_NAME} is a workout tracking app. You can track workouts, programs, and body
							metrics for free. AI program generation is powered by credits: every account starts
							with 10 free credits, and each program generation request uses 1 credit.
						</p>
					</Section>

					{/* Credits are bought on the website only; the iOS app must not describe paying elsewhere. */}
					<WebOnly>
						<Section title="Buying Credits">
							<p>
								Additional credits are sold as a one-time credit pack (currently 100 credits for CHF
								2.00) through our payment provider, Stripe. Purchases are one-time payments, not
								subscriptions, and are never renewed automatically. Credits are added to your
								account after payment is confirmed and do not expire.
							</p>
							<p>
								We never see or store your card details; payments are processed by Stripe. Credits
								have no cash value and cannot be transferred or exchanged for money.
							</p>
						</Section>

						<Section title="Refunds">
							<p>
								If you have not used any credits from a pack, you can request a full refund within
								14 days of purchase. Credits that have already been used to generate programs are
								not refundable, since the generation has already been delivered. If a generation
								fails, the credit is returned to your balance automatically.
							</p>
							<p>
								To request a refund, email us at the address below with the email address of your
								account. Approved refunds are returned to the original payment method.
							</p>
						</Section>
					</WebOnly>

					<Section title="Acceptable Use">
						<p>
							Do not misuse the service, attempt to bypass credit limits, or use it to generate
							harmful content. We may suspend accounts that do. AI-generated programs are general
							suggestions, not medical advice; consult a professional before starting a new training
							program.
						</p>
					</Section>

					<Section title="Changes">
						<p>
							We may update these terms from time to time. Material changes will be reflected by
							updating the &quot;Last updated&quot; date above.
						</p>
					</Section>

					<Section title="Contact Us">
						<p>
							<WebOrApp
								web="Questions about these terms or a purchase?"
								app="Questions about these terms?"
							/>{" "}
							Email us at{" "}
							<a href={`mailto:${SUPPORT_EMAIL}`} className="underline underline-offset-4">
								{SUPPORT_EMAIL}
							</a>
							.
						</p>
					</Section>
				</div>

				<div className="mt-6 flex justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
					<Link href={ROUTES.PRIVACY} className="underline underline-offset-4">
						Privacy Policy
					</Link>
					<Link href={ROUTES.LOGIN} className="underline underline-offset-4">
						Back to sign in
					</Link>
				</div>
			</div>
		</div>
	);
}
