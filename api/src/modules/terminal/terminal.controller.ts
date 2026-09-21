import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ExecDto } from './dto/exec.dto';
import { TerminalService } from './terminal.service';

@ApiTags('terminal')
@Controller('terminal')
export class TerminalController {
  constructor(private readonly terminal: TerminalService) {}

  @Post('exec')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Run a shell command against the portfolio',
    description:
      'The interactive terminal on the site posts here for every command. ' +
      'Returns styled output lines plus an optional client-side action ' +
      '(clear, open, theme, matrix, scroll, exit).',
  })
  @ApiOkResponse({ description: 'Command output.' })
  exec(@Body() dto: ExecDto) {
    return this.terminal.exec(dto.command);
  }

  @Get('complete')
  @ApiOperation({ summary: 'Tab-completion candidates for a partial command' })
  @ApiQuery({ name: 'q', required: false, example: 'pro' })
  complete(@Query('q') q = '') {
    return this.terminal.complete(q);
  }

  @Get('commands')
  @ApiOperation({ summary: 'The command manifest (name, summary, usage, group)' })
  commands() {
    return this.terminal.manifest();
  }

  @Get('banner')
  @ApiOperation({ summary: 'The ASCII welcome banner shown on first load' })
  banner() {
    return this.terminal.banner();
  }
}
