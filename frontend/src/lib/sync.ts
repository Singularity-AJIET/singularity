export class NtpClient {
  private _offset = 0;
  private _rtt = 0;
  private _synced = false;
  private _baselineServerTime = 0;
  private _baselinePerfNow = 0;
  private _listeners: Set<() => void> = new Set();
  private _syncingPromise: Promise<void> | null = null;

  constructor() {
    // Auto-sync as early as possible in browser environment
    if (typeof window !== "undefined") {
      this.sync().catch(() => {});
      // Re-sync on tab refocus to eliminate any sleep/wake drift
      window.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") {
          this.sync().catch(() => {});
        }
      });
      // Periodic background re-sync every 5 minutes
      setInterval(() => {
        this.sync().catch(() => {});
      }, 5 * 60 * 1000);
    }
  }

  public onSync(fn: () => void): () => void {
    this._listeners.add(fn);
    if (this._synced) {
      try {
        fn();
      } catch {}
    }
    return () => this._listeners.delete(fn);
  }

  private _notifyListeners() {
    this._listeners.forEach((fn) => {
      try {
        fn();
      } catch {}
    });
  }

  /**
   * Run NTP-style synchronization.
   * Calls the Next.js server route /api/time via relative URL first,
   * guaranteeing that it hits the same origin without CORS or external port issues.
   */
  public async sync(samples = 2): Promise<void> {
    if (this._syncingPromise) {
      return this._syncingPromise;
    }
    this._syncingPromise = this._runSync(samples).finally(() => {
      this._syncingPromise = null;
    });
    return this._syncingPromise;
  }

  private async _runSync(samples: number): Promise<void> {
    let bestRtt = Infinity;
    let bestServerTime = 0;
    let bestPerfNow = 0;

    // 1. Next.js server-side endpoint /api/time
    for (let i = 0; i < samples; i++) {
      try {
        const t0 = performance.now();
        const res = await fetch("/api/time", {
          method: "GET",
          cache: "no-store",
          headers: { Accept: "application/json" },
        });

        if (!res.ok) continue;

        const data = await res.json();
        const t3 = performance.now();
        const rtt = t3 - t0;

        const serverTimeAtT3 = Number(data.serverTime) + rtt / 2;

        if (rtt < bestRtt && !isNaN(serverTimeAtT3)) {
          bestRtt = rtt;
          bestServerTime = serverTimeAtT3;
          bestPerfNow = t3;
        }
      } catch {
        // Continue to fallback
      }
    }

    // 2. Fallback: Try reading HTTP Date header from current origin (RFC 7231 server timestamp)
    if (bestRtt === Infinity) {
      try {
        const t0 = performance.now();
        const res = await fetch("/", { method: "HEAD", cache: "no-store" });
        const dateHeader = res.headers.get("date");
        if (dateHeader) {
          const t3 = performance.now();
          const rtt = t3 - t0;
          const serverEpoch = new Date(dateHeader).getTime();
          if (!isNaN(serverEpoch)) {
            bestRtt = rtt;
            bestServerTime = serverEpoch + rtt / 2;
            bestPerfNow = t3;
          }
        }
      } catch {}
    }

    // 3. Fallback: WorldTimeAPI (public atomic clock API)
    if (bestRtt === Infinity) {
      try {
        const t0 = performance.now();
        const res = await fetch("https://worldtimeapi.org/api/timezone/Asia/Kolkata", {
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          const t3 = performance.now();
          const rtt = t3 - t0;
          const serverEpoch = Number(data.unixtime) * 1000;
          if (!isNaN(serverEpoch)) {
            bestRtt = rtt;
            bestServerTime = serverEpoch + rtt / 2;
            bestPerfNow = t3;
          }
        }
      } catch {}
    }

    if (bestRtt !== Infinity && bestServerTime > 0) {
      this._baselineServerTime = bestServerTime;
      this._baselinePerfNow = bestPerfNow;
      this._rtt = bestRtt;
      this._offset = bestServerTime - Date.now();
      this._synced = true;
      this._notifyListeners();
    }
  }

  public get offset(): number {
    return this._offset;
  }

  public get isSynced(): boolean {
    return this._synced;
  }

  /**
   * Returns current synchronized server time in epoch milliseconds.
   * Once synced, it uses performance.now() (monotonic clock),
   * making it completely immune to user changing their local device clock,
   * local timezone, or experiencing device clock skew.
   */
  public getServerTime(): number {
    if (this._synced && typeof performance !== "undefined") {
      const elapsed = performance.now() - this._baselinePerfNow;
      return this._baselineServerTime + elapsed;
    }
    return Date.now() + this._offset;
  }
}

export const ntpClient = new NtpClient();
