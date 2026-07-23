# Follow-along checklist

Tick these off in order. Replace every `<PLACEHOLDER>` with your own value.
Full explanations + gotchas are in the [README](./README.md).

## Fill in your values first
- `<YOUR_DOMAIN>` = e.g. `app.yourdomain.com`
- `<YOUR_LOCAL_PORT>` = the port your app serves on locally, e.g. `8770`
- `<YOUR_PACKAGE_ID>` = reverse-domain, **permanent**, e.g. `com.yourbrand.yourapp`
- `<YOUR_APP_NAME>` = e.g. `My Cool App`

## 1 · Make it a PWA
- [ ] Copy `templates/manifest.webmanifest` → your app root; fill in name/colors.
- [ ] Copy `templates/sw.js` → your app **root**; edit `CACHE` + `SHELL` list.
- [ ] Copy `templates/pwa.js` → your app root; add `<script src="/pwa.js"></script>` to your page.
- [ ] Link the manifest in `<head>`: `<link rel="manifest" href="/manifest.webmanifest">`.
- [ ] Generate icons: `icon-192.png`, `icon-512.png`, `icon-maskable.png`.
- [ ] Confirm all of the above are served at the root path (no 404s!).

## 2 · Give it a stable public HTTPS home (free)
- [ ] Buy `<YOUR_DOMAIN>`'s root domain (Cloudflare Registrar is easy).
- [ ] Cloudflare → Zero Trust → Networks → Tunnels → **Create tunnel (Cloudflared)**.
- [ ] Install the connector **as a service**: `cloudflared service install <TOKEN>`.
- [ ] Add public hostname: `<YOUR_DOMAIN>` → HTTP → `localhost:<YOUR_LOCAL_PORT>`.
- [ ] Open `https://<YOUR_DOMAIN>` and confirm the app loads.
- [ ] Verify **over HTTPS**, DevTools → Application → Service Worker shows "activated."

## 3 · Validate
- [ ] Run `https://<YOUR_DOMAIN>` through [PWABuilder](https://www.pwabuilder.com/).
- [ ] Clear all **red** items (usually: a 404'd `sw.js` or missing icon sizes).

## 4 · Microsoft Store (do first — free)
- [ ] Register (free, individual): `developer.microsoft.com/microsoft-store/register`.
- [ ] New product → **MSIX or PWA app** → reserve `<YOUR_APP_NAME>`.
- [ ] Product Identity → copy the 3 identity values.
- [ ] PWABuilder → Package For Stores → **Windows** → paste identity values → Download.
- [ ] Upload the **`.msixbundle`** (not the sideload `.msix`).
- [ ] Pricing (Free) · Properties (category + privacy URL) · Age ratings · Listing (desc + ≥1 screenshot).
- [ ] Submission Options → justify **`runFullTrust`** (standard for PWAs) → **Submit**.

## 5 · Google Play
- [ ] Play Console account ($25, **Personal**).
- [ ] PWABuilder → Package For Stores → **Android** → set `<YOUR_PACKAGE_ID>` (permanent!) → new signing key.
- [ ] **BACK UP** the keystore + both passwords (non-recoverable).
- [ ] Fill `templates/assetlinks.json` and host it at `https://<YOUR_DOMAIN>/.well-known/assetlinks.json`.
- [ ] Verify a **physical Android phone** (any borrowed one, once) + phone number + identity.
- [ ] Upload the `.aab` to a **Closed testing** track.
- [ ] ⚠️ After upload: Play Console → App integrity → App signing → copy Google's **App-signing SHA-256** → put it in `assetlinks.json`.
- [ ] Recruit ~12–20 testers, run the 14-day closed test → promote to Production.

## 6 · iOS (needs a Mac)
- [ ] PWABuilder → Package For Stores → **iOS** → download the Xcode project.
- [ ] On a Mac: open in Xcode, build, submit via an Apple Developer account ($99/yr).
- [ ] (Meanwhile iPhone users can already install via Safari → Share → Add to Home Screen.)

## Don't-skip reminders
- [ ] Privacy policy hosted at a public URL (stores check the link resolves).
- [ ] Public view loads with **no login** (store users are strangers).
- [ ] `assetlinks.json` + privacy page reachable **without** any key.
- [ ] Keep the app **informational**, add disclaimers if it touches money/markets.
