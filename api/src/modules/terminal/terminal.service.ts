import { Injectable, Logger } from '@nestjs/common';
import {
  ExecResult,
  allCommandNames,
  commandNames,
  complete,
  execute,
  registry,
  welcomeBanner,
} from './terminal.engine';

@Injectable()
export class TerminalService {
  private readonly logger = new Logger(TerminalService.name);
  private readonly counts = new Map<string, number>();

  exec(input: string): ExecResult {
    const result = execute(input);
    // Only tally commands that actually exist, so typos don't show up in
    // the "most popular" list on /api/stats.
    if (result.command && allCommandNames.includes(result.command)) {
      this.counts.set(result.command, (this.counts.get(result.command) ?? 0) + 1);
      this.logger.debug(`exec "${input}" -> ${result.lines.length} lines in ${result.tookMs}ms`);
    }
    return result;
  }

  complete(partial: string) {
    return complete(partial);
  }

  banner() {
    return welcomeBanner();
  }

  manifest() {
    return registry
      .filter((c) => !c.hidden)
      .map(({ name, summary, usage, group }) => ({ name, summary, usage, group }));
  }

  names() {
    return { visible: commandNames, all: allCommandNames };
  }

  /** Which commands visitors actually run — surfaced on /api/stats. */
  popular(limit = 5) {
    return [...this.counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([command, runs]) => ({ command, runs }));
  }
}
