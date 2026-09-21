import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { profile, stats, expertise } from '../../data/portfolio.data';

@ApiTags('profile')
@Controller('profile')
export class ProfileController {
  @Get()
  @ApiOperation({ summary: 'Core identity: name, headline, summary, links' })
  @ApiOkResponse({ description: 'The profile object.' })
  getProfile() {
    return profile;
  }

  @Get('stats')
  @ApiOperation({ summary: 'Headline numbers used by the animated counters' })
  getStats() {
    return stats;
  }

  @Get('expertise')
  @ApiOperation({ summary: 'Flat list of expertise areas and their technologies' })
  getExpertise() {
    return expertise;
  }
}
