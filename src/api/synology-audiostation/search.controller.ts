import { AccountEntity } from 'src/database/entities';
import { ApiHeader, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import {
  SynologySearchBodyDto,
  SynologySearchResponseDto,
} from './dtos/search.cgi.dto';
import { SynologySearchService } from './search.service';
import { User } from '../user.decorator';

@Controller()
@ApiTags('Synology AudioStation APIs')
export class SynologySearchController {
  private readonly logger: Logger = new Logger(SynologySearchController.name);

  constructor(private readonly searchService: SynologySearchService) {}

  @Post('/webapi/AudioStation/search.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'cookie',
    description:
      'The session ID and device ID tokens for the authenticated user',
    required: true,
  })
  @ApiOkResponse({
    description:
      'Returns a list of artists, albums and songs matching a search query',
    type: SynologySearchResponseDto,
  })
  async postSearchCgi(
    @User() user: AccountEntity,
    @Body() body: SynologySearchBodyDto,
  ): Promise<SynologySearchResponseDto> {
    const data = await this.searchService.listSearchResults(
      user.id,
      body.keyword,
    );
    return {
      data,
      success: true,
    };
  }
}
