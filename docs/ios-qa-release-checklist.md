# iOS QA and Release Readiness Checklist

## Purpose & Logic

This checklist covers the device-only work required after the static bundle and Capacitor shell build successfully. Repository checks can prove that the bundle, native project, icons, permissions, and scripts are wired correctly; simulator/device testing is still required for WKWebView lifecycle behavior, offline recovery, and App Store submission settings.

## Automated repository checks

Run these before opening Xcode:

```bash
pnpm run lint
pnpm run ios:build
pnpm run ios:readiness
```

Expected result:

- `lint` exits with no errors.
- `ios:build` regenerates native assets, builds the static bundle, and syncs Capacitor iOS.
- `ios:readiness` passes repository checks. It may warn if full Xcode is not selected; that warning must be resolved before archive/submission.

## Xcode setup checks

- Open the workspace with `pnpm run ios:open`.
- Select the intended Apple development team.
- Confirm bundle identifier: `com.fivaz.fittracker`.
- Confirm app display name: `Fit Tracker`.
- Confirm version/build values for the target release.
- Confirm full Xcode is selected:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

## Runtime environment checks

For static/mobile runtime, set `API_BASE_URL` before building (auth client URLs inherit it). Optional overrides: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_AUTH_BASE_URL`.

The API origin must point at Nest (default `http://localhost:3001` in local dev). Production values must use HTTPS and be reachable from the simulator/device.

## Simulator smoke tests

- Launch cold from the home screen.
- Register with email/password.
- Sign in with email/password.
- Optional profile image picker opens and returns to the registration flow.
- Navigate all bottom tabs: Home, Programs, Exercises, Progress, Settings.
- Create, edit, reorder, and delete an exercise.
- Create, edit, reorder, and delete a program.
- Assign/reorder exercises inside a program.
- Start a workout, edit sets, finish workout, and verify Progress route.
- Update body metrics in Settings.
- Sign out and verify the app returns to Login.

## Offline and sync recovery tests

- Sign in while online, then disable network.
- Create/edit/delete exercises while offline.
- Create/edit/reorder programs while offline.
- **Log sets on an already-started workout while offline** (edit reps/weight, background/foreground, kill and relaunch — the active workout and its sets are cached locally and resume correctly).
- Kill and relaunch the app while still offline; confirm local data is present.
- Starting a **brand-new** workout requires connectivity — the server assigns the workout id, so `Start Workout` while offline shows an error toast rather than silently failing (see `apps/web/lib/offline/data-adapters.ts`). This is a known limitation, not yet supported.
- Re-enable network; confirm queued changes sync.
- Background the app during offline edits, foreground after reconnect, and confirm sync retries.
- Toggle network repeatedly during a save operation; confirm the UI remains usable and data is not duplicated.

## WKWebView lifecycle checks

- Cold launch from terminated state.
- Background and foreground while on each main tab.
- Background and foreground during an active workout.
- Lock and unlock the device during an active workout.
- Resume after the app has been suspended for several minutes.
- Confirm queued writes retry on foreground/resume.

## Device checks

- Repeat the simulator smoke tests on a physical iPhone.
- Verify safe-area layout around notch/home indicator.
- Verify keyboard behavior on login/register/settings forms.
- Verify profile image picker permission prompts and copy.
- Verify app icon and splash screen are branded from `public/favicon.svg`.

## App Store readiness checks

- Confirm privacy disclosures for account data, workout data, body metrics, diagnostics, and optional profile image. The in-app Privacy Policy page (`/privacy`) and `ios/App/App/PrivacyInfo.xcprivacy` (checked by `pnpm run ios:readiness`) cover this; fill out the App Store Connect "App Privacy" questionnaire to match.
- Confirm in-app account deletion (Settings → Delete Account) works and is linked from the Privacy Policy page, per Guideline 5.1.1(v).
- Confirm no social auth is presented in iOS v1 if it is deferred.
- Push notifications are deferred to v2 — no `PushNotifications` permission prompt or entitlement should appear in v1.
- Export compliance is pre-declared via `ITSAppUsesNonExemptEncryption = false` in `Info.plist` (the app only uses standard HTTPS/TLS) — App Store Connect should not prompt for it per upload.
- Confirm screenshots are captured for required device classes.
- Confirm TestFlight build installs and launches.
- Confirm rollback plan: previous backend remains compatible with the shipped static bundle.
