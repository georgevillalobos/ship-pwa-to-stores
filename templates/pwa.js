/* PWA bootstrap — load this on your page: <script src="/pwa.js"></script>
 * ─────────────────────────────────────────────────────────────────────────
 * Keep it OUT of your app bundle so you never rebuild to tweak install/SW
 * behaviour. It only appends UI to <body>, never touches your app's DOM.
 *   - registers /sw.js
 *   - Android/desktop: shows an "Install" chip (beforeinstallprompt)
 *   - iOS: shows a one-time "Add to Home Screen" hint (iOS has no install API)
 *   - exposes window.PWA.subscribePush(vapidPublicKey) for later server push
 * Usually nothing to customize. Optional tweaks are marked TODO.
 * ───────────────────────────────────────────────────────────────────────── */
(function () {
  "use strict";
  var PWA = (window.PWA = window.PWA || {});
  var swReg = null;

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/sw.js")
        .then(function (reg) { swReg = reg; PWA.registration = reg; })
        .catch(function () {});
    });
  }

  function isiOS() {
    return /iphone|ipad|ipod/i.test(navigator.userAgent)
      || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  }
  function isStandalone() {
    return window.matchMedia("(display-mode: standalone)").matches
      || window.navigator.standalone === true;
  }
  function seen(k) { try { return localStorage.getItem(k) === "1"; } catch (e) { return false; } }
  function mark(k) { try { localStorage.setItem(k, "1"); } catch (e) {} }

  // Android / desktop install chip
  var deferred = null;
  window.addEventListener("beforeinstallprompt", function (e) { e.preventDefault(); deferred = e; showChip(); });
  window.addEventListener("appinstalled", function () { deferred = null; var c = document.getElementById("pwa-install"); if (c) c.remove(); });

  function showChip() {
    if (isStandalone() || document.getElementById("pwa-install")) return;
    var b = document.createElement("button");
    b.id = "pwa-install";
    b.textContent = "⤓ Install app";                    // TODO: your label
    b.style.cssText = "position:fixed;right:14px;bottom:20px;z-index:30;background:#1a2340;color:#fff;border:1px solid #4667ff;border-radius:12px;padding:10px 14px;font:600 13px sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.4);cursor:pointer";
    b.addEventListener("click", function () {
      if (!deferred) return;
      deferred.prompt();
      deferred.userChoice.finally(function () { deferred = null; b.remove(); });
    });
    document.body.appendChild(b);
  }

  // iOS "Add to Home Screen" hint (once)
  window.addEventListener("load", function () {
    setTimeout(function () {
      if (!isiOS() || isStandalone() || seen("pwa_ios_hint")) return;
      var bar = document.createElement("div");
      bar.style.cssText = "position:fixed;left:10px;right:10px;bottom:20px;z-index:30;background:#12161d;color:#cdd4e0;border:1px solid #2a3140;border-radius:12px;padding:11px 12px;font:13px sans-serif;box-shadow:0 6px 20px rgba(0,0,0,.45);display:flex;gap:10px;align-items:center";
      var m = document.createElement("span"); m.style.flex = "1";
      m.innerHTML = "Install: tap <b>Share</b> then <b>Add to Home Screen</b>.";
      var x = document.createElement("button"); x.textContent = "✕";
      x.style.cssText = "background:none;border:none;color:#8a94a6;font-size:15px;cursor:pointer";
      x.addEventListener("click", function () { bar.remove(); mark("pwa_ios_hint"); });
      bar.appendChild(m); bar.appendChild(x); document.body.appendChild(bar);
    }, 2500);
  });

  // Web Push subscribe helper — call once your server exposes a VAPID public
  // key + a POST endpoint to store subscriptions.
  function urlB64ToUint8Array(b64) {
    var pad = "=".repeat((4 - (b64.length % 4)) % 4);
    var s = (b64 + pad).replace(/-/g, "+").replace(/_/g, "/");
    var raw = atob(s), out = new Uint8Array(raw.length);
    for (var i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
    return out;
  }
  PWA.subscribePush = function (vapidPublicKey) {
    if (!swReg || !("PushManager" in window)) return Promise.reject(new Error("push unsupported / SW not ready"));
    return Notification.requestPermission().then(function (p) {
      if (p !== "granted") throw new Error("permission denied");
      return swReg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlB64ToUint8Array(vapidPublicKey) });
    }).then(function (sub) {
      return fetch("/api/push/subscribe", {         // TODO: your endpoint
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(sub),
      }).then(function () { return sub; });
    });
  };
})();
