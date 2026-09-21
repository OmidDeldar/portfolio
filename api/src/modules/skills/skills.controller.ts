import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { skills } from '../../data/portfolio.data';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  @Get()
  @ApiOperation({ summary: 'Skill groups with proficiency levels' })
  findAll() {
    return skills;
  }
}
