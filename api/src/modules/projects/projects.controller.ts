import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { projects } from '../../data/portfolio.data';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
  @Get()
  @ApiOperation({ summary: 'Every personal project' })
  findAll() {
    return projects;
  }

  @Get(':id')
  @ApiOperation({ summary: 'A single project by its id' })
  @ApiParam({ name: 'id', example: 'tetris' })
  @ApiNotFoundResponse({ description: 'No project with that id.' })
  findOne(@Param('id') id: string) {
    const item = projects.find((p) => p.id === id);
    if (!item) throw new NotFoundException(`No project with id "${id}"`);
    return item;
  }
}
