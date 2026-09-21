import { Module } from '@nestjs/common';
import { EducationController } from './education.controller';

@Module({ controllers: [EducationController] })
export class EducationModule {}
