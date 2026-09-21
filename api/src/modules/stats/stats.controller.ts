import { Controller, Get, Headers, Ip, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { createHash } from 'node:crypto';
import { TerminalService } from '../terminal/terminal.service';
import { StatsService } from './stats.service';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(
    private readonly stats: StatsService,
    private readonly terminal: TerminalService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Visitor counts, uptime and most-run terminal commands' })
  snapshot() {
    return {
      ...this.stats.snapshot(),
      popularCommands: this.terminal.popular(),
    };
  }

  @Post('visit')
  @ApiOperation({
    summary: 'Register a page view',
    description:
      'The IP and user agent are hashed into an opaque fingerprint so unique ' +
      'visitors can be counted without storing anything identifying.',
  })
  visit(@Ip() ip: string, @Headers('user-agent') userAgent = '') {
    const fingerprint = createHash('sha256')
      .update(`${ip}|${userAgent}`)
      .digest('hex')
      .slice(0, 16);
    return this.stats.registerVisit(fingerprint);
  }
}
