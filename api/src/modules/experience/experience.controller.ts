import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { experience } from '../../data/portfolio.data';

@ApiTags('experience')
@Controller('experience')
export class ExperienceController {
  @Get()
  @ApiOperation({ summary: 'Full work history, newest first' })
  findAll() {
    return experience;
  }

  @Get(':id')
  @ApiOperation({ summary: 'A single role by its id' })
  @ApiParam({ name: 'id', example: 'loginet' })
  @ApiNotFoundResponse({ description: 'No role with that id.' })
  findOne(@Param('id') id: string) {
    const item = experience.find((e) => e.id === id);
    if (!item) throw new NotFoundException(`No experience entry with id "${id}"`);
    return item;
  }
}
