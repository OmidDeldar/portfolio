import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { education } from '../../data/portfolio.data';

@ApiTags('education')
@Controller('education')
export class EducationController {
  @Get()
  @ApiOperation({ summary: 'Degrees, grades and honours' })
  findAll() {
    return education;
  }
}
