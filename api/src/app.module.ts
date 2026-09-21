import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { EducationModule } from './modules/education/education.module';
import { ExperienceModule } from './modules/experience/experience.module';
import { HealthModule } from './modules/health/health.module';
import { ProfileModule } from './modules/profile/profile.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { SkillsModule } from './modules/skills/skills.module';
import { StatsModule } from './modules/stats/stats.module';
import { TerminalModule } from './modules/terminal/terminal.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // The terminal is a public write endpoint, so everything is rate limited:
    // 60 requests per minute per IP is generous for a human typist.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    ProfileModule,
    ExperienceModule,
    ProjectsModule,
    SkillsModule,
    EducationModule,
    TerminalModule,
    StatsModule,
    HealthModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
