/**
 * Thin client for the NestJS API.
 *
 * Every call is resilient by design: if the API is unreachable (not deployed
 * yet, cold-starting on a free tier, or you opened dist/index.html directly),
 * the caller falls back to the bundled copy of the same data. The site is
 * always fully functional; the API just makes it *live*.
 */

import type { ExecResult } from './terminal.engine';
import { execute } from './terminal.engine';

const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

/** Resolve an API path against the configured base (or the current origin). */
const url = (path: string) => `${BASE}/api${path}`;

/** How long we wait before deciding the API isn't there. */
const TIMEOUT_MS = 6000;

export type ApiStatus = 'connecting' | 'online' | 'offline';

let status: ApiStatus = 'connecting';
const listeners = new Set<(s: ApiStatus) => void>();

function setStatus(next: ApiStatus) {
  if (status === next) return;
  status = next;
  listeners.forEach((fn) => fn(next));
}

export function getApiStatus(): ApiStatus {
  return status;
}

export function onApiStatus(fn: (s: ApiStatus) => void): () => void {
  listeners.add(fn);
  fn(status);
  return () => listeners.delete(fn);
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url(path), {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    setStatus('online');
    return (await res.json()) as T;
  } catch (error) {
    setStatus('offline');
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch from the API, falling back to bundled data on any failure.
 * Returns the fallback immediately if we already know the API is offline.
 */
export async function fetchOr<T>(path: string, fallback: T): Promise<T> {
  if (status === 'offline') return fallback;
  try {
    return await request<T>(path);
  } catch {
    return fallback;
  }
}

/** Ping the API once on load so the status light is accurate. */
export async function probe(): Promise<boolean> {
  try {
    await request<{ status: string }>('/health');
    return true;
  } catch {
    return false;
  }
}

/** Register this page view. Fire-and-forget — failures are irrelevant. */
export async function registerVisit(): Promise<void> {
  try {
    await request('/stats/visit', { method: 'POST' });
  } catch {
    /* the counter is a nice-to-have, never a blocker */
  }
}

export interface StatsSnapshot {
  visits: number;
  unique: number;
  uptimeSeconds: number;
  popularCommands: { command: string; runs: number }[];
}

export async function fetchStats(): Promise<StatsSnapshot | null> {
  try {
    return await request<StatsSnapshot>('/stats');
  } catch {
    return null;
  }
}

/**
 * Run a terminal command.
 *
 * Tries the server first so the terminal is a genuine round-trip to NestJS,
 * and transparently falls back to the identical engine running in the browser.
 */
export async function execCommand(command: string): Promise<ExecResult> {
  if (status !== 'offline') {
    try {
      const result = await request<ExecResult>('/terminal/exec', {
        method: 'POST',
        body: JSON.stringify({ command }),
      });
      return { ...result, offline: false };
    } catch {
      /* fall through to the local engine */
    }
  }
  return { ...execute(command), offline: true };
}
