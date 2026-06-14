/**
 * Screen Wake Lock — keeps the device awake while the ison is sounding, so a
 * chanter's phone doesn't dim or sleep mid-service. Degrades silently where the
 * API is unsupported, and re-acquires the lock when the tab returns to view.
 */

type WakeLockSentinelLike = { release: () => Promise<void> };

let sentinel: WakeLockSentinelLike | null = null;
let wanted = false;

async function acquire(): Promise<void> {
  const nav = navigator as Navigator & {
    wakeLock?: { request: (type: "screen") => Promise<WakeLockSentinelLike> };
  };
  if (!nav.wakeLock || sentinel) return;
  try {
    sentinel = await nav.wakeLock.request("screen");
  } catch {
    /* user agent may reject (e.g. low battery) — ignore */
  }
}

export async function requestWakeLock(): Promise<void> {
  wanted = true;
  await acquire();
}

export async function releaseWakeLock(): Promise<void> {
  wanted = false;
  if (sentinel) {
    try {
      await sentinel.release();
    } catch {
      /* ignore */
    }
    sentinel = null;
  }
}

document.addEventListener("visibilitychange", () => {
  if (wanted && document.visibilityState === "visible") {
    sentinel = null; // a hidden tab drops the lock; re-acquire on return
    void acquire();
  }
});
