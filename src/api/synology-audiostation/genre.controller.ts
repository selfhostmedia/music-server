import { AccountEntity } from 'src/database/entities';
import {
  ApiExtraModels,
  ApiHeader,
  ApiOkResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Logger,
  Post,
} from '@nestjs/common';
import {
  SynologyDefaultGenreResponseDto,
  SynologyGenreBodyDto,
  SynologyGenreResponseDto,
} from './dtos';
import { SynologyGenreService } from './genre.service';
import { SynologyMethodEnum } from './enums';
import { User } from '../user.decorator';

@Controller()
@ApiTags('Synology AudioStation APIs')
export class SynologyGenreController {
  private readonly logger: Logger = new Logger(SynologyGenreController.name);

  constructor(private readonly genreService: SynologyGenreService) {}

  @Post('/webapi/AudioStation/genre.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'cookie',
    description:
      'The session ID and device ID tokens for the authenticated user',
    required: true,
  })
  @ApiOkResponse({
    description:
      'Returns a list of genres found in the music library, or a hard-coded list of default genres',
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(SynologyGenreResponseDto),
        },
        {
          $ref: getSchemaPath(SynologyDefaultGenreResponseDto),
        },
      ],
    },
  })
  @ApiExtraModels(SynologyGenreResponseDto, SynologyDefaultGenreResponseDto)
  async postGenreCgi(
    @User() user: AccountEntity,
    @Body() body: SynologyGenreBodyDto,
  ): Promise<SynologyGenreResponseDto | SynologyDefaultGenreResponseDto> {
    // Route #1:  the default genres presented in the "recommended genre" section of the app
    if (body.method === SynologyMethodEnum.LIST_DEFAULT_GENRE) {
      const data = await this.genreService.listDefaultGenres(user.id);
      return {
        data,
        success: true,
      };
    }
    // Route #2: the genres present in the music catalog
    const data = await this.genreService.listGenres(
      user.id,
      body.offset || 0,
      body.limit || 100000,
    );
    return {
      data,
      success: true,
    };
  }
}
