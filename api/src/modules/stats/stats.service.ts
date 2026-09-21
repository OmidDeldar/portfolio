import { Injectable } from '@nestjs/common';

/**
 * In-memory visitor counter. Resets when the process restarts — which is
 * exactly what you want for a portfolio and keeps the API dependency-free.
 * Swap this class for a TypeORM repository if you ever want it persisted.
 */
@Injectable()
export class StatsService {
  private readonly bootedAt = new Date();
  private visits = 0;
  private readonly seen = new Set<string>();

  registerVisit(fingerprint: string): { visits: number; unique: number; returning: boolean } {
    const returning = this.seen.has(fingerprint);
    this.visits += 1;
    this.seen.add(fingerprint);
    return { visits: this.visits, unique: this.seen.size, returning };
  }

  snapshot() {
    const uptimeSeconds = Math.floor((Date.now() - this.bootedAt.getTime()) / 1000);
    return {
      visits: this.visits,
      unique: this.seen.size,
      bootedAt: this.bootedAt.toISOString(),
      uptimeSeconds,
    };
  }
}
