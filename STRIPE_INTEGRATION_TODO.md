# Stripe Checkout integration: remaining steps

Scenario A: the app already created Checkout Sessions, so only the parameters of that call were updated.

## Values to Replace

No placeholder values remain. These `sample_only` parameters already use real values and were left as they were:

**File:** [apps/api/src/billing/billing.service.ts](apps/api/src/billing/billing.service.ts)

| Field                    | Current value                                      | Note                                                                                          |
| ------------------------ | -------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| mode                     | `payment`                                          | One-time credit pack, not a subscription.                                                     |
| line_items[].price       | `STRIPE_CREDIT_PACK_PRICE_ID` (env)                | Sandbox price in `params.dev.json` / `params.staging.json`, live price in `params.prod.json`. |
| success_url / cancel_url | `${WEB_APP_URL}/settings?checkout=success\|cancel` | `WEB_APP_URL` defaults to `http://localhost:3000`, set per environment in Bicep.              |

## Configured Parameters

**File:** [apps/api/src/billing/billing.service.ts](apps/api/src/billing/billing.service.ts)

| Parameter                  | Value                                                                                                                |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ui_mode                    | `hosted_page` (Stripe SDK 22.6.2 is above 21.0.0)                                                                    |
| billing_address_collection | `auto`                                                                                                               |
| phone_number_collection    | `{ enabled: false }`                                                                                                 |
| allow_promotion_codes      | `false`                                                                                                              |
| submit_type                | `auto`                                                                                                               |
| integration_identifier     | `hosted_web_0001`                                                                                                    |
| origin_context             | `web`                                                                                                                |
| branding_settings          | dark header `#09090b`, orange `#ff6900`, Inter, rounded, name "Fit-Tracker" (values from `apps/web/app/globals.css`) |

### Deviations from the Checkout Studio field intents

- **`automatic_tax` was omitted (Studio asked for `enabled: false`).** Stripe rejects `false` while Managed Payments is on: "automatic_tax[enabled] must be true when Managed Payments is enabled. Omit this parameter". Managed Payments calculates and remits tax itself. To send `false`, Managed Payments would have to be disabled for the request, which changes who is responsible for VAT; not done.
- **`payment_method_collection` was not sent.** It applies only to `mode: "subscription"`.
- **`client_reference_id` and `metadata: { userId }` were kept**, although they aren't in the Studio list. The webhook reads `metadata.userId` to credit the purchaser, so removing them would break crediting.
- **Styling is limited by Managed Payments.** Only the header colour and business name are applied; the payment form, the Link logo and the green Pay button are Stripe-controlled. Upload an icon/logo in Dashboard → Settings → Branding (Checkout) for the header badge. Full control (orange button) would require disabling Managed Payments, which changes VAT responsibility.
- The Stripe client keeps `apiVersion: "2026-08-26.dahlia"` in [stripe-client.ts](apps/api/src/billing/stripe-client.ts). It is the exact literal the installed SDK requires, not a guess, and that file was outside this change.

## Setup and next steps

- Env vars (see `.env.example`): `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_CREDIT_PACK_PRICE_ID`, `WEB_APP_URL`. Deployed environments get the secrets from Key Vault (synced by the "Sync Secrets to Key Vault" workflow from GitHub Environment secrets).
- Flow: paywall dialog → `POST /api/billing/checkout` → Stripe hosted Checkout → `/settings?checkout=success`. The account is credited by the `checkout.session.completed` webhook (`POST /api/billing/webhook`), not by the redirect.
- Local webhook testing: `stripe listen --events checkout.session.completed --forward-to localhost:3001/api/billing/webhook`, with `STRIPE_WEBHOOK_SECRET` set to the `whsec_...` it prints.
- Test cards (test mode only): `4242 4242 4242 4242` succeeds; `4000 0000 0000 9995` is declined for insufficient funds. Any future expiry, any CVC.
- Products need a tax code for Managed Payments (`txcd_10105001` is set on the credit pack product in both sandbox and live).
- Before going live in production: live `STRIPE_SECRET_KEY`, a live-mode webhook endpoint with its own signing secret, and the live price in `params.prod.json` (already set).

Resources: https://support.stripe.com and https://docs.stripe.com/mcp
