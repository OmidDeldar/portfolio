import { Module } from '@nestjs/common';
import { TerminalModule } from '../terminal/terminal.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [TerminalModule],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
