/* eslint-disable max-classes-per-file */
import { AccountEntity } from 'src/database/entities';
import {
  ApiBody,
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
  SynologyFolderBodyDto,
  SynologyFolderDto,
  SynologyFolderResponseDto,
  SynologyRootFolderBodyDto,
} from './dtos/folder.cgi.dto';
import { SynologyFolderService } from './folder.service';
import { SynologySongDto } from './dtos';
import { User } from '../user.decorator';
import { plainToInstance } from 'class-transformer';

@Controller()
@ApiTags('Synology AudioStation APIs')
export class SynologyFolderController {
  private readonly logger: Logger = new Logger(SynologyFolderController.name);

  constructor(private readonly folderService: SynologyFolderService) {}

  @Post('/webapi/AudioStation/folder.cgi')
  @HttpCode(HttpStatus.OK)
  @ApiHeader({
    name: 'cookie',
    description:
      'The session ID and device ID tokens for the authenticated user',
    required: true,
  })
  @ApiOkResponse({
    description:
      'Returns a list of folders starting from the root paths and then traversing down their folder trees',
    type: SynologyFolderResponseDto,
  })
  @ApiExtraModels(
    SynologyRootFolderBodyDto,
    SynologyFolderBodyDto,
    SynologyFolderDto,
    SynologySongDto,
  )
  @ApiBody({
    schema: {
      oneOf: [
        {
          $ref: getSchemaPath(SynologyRootFolderBodyDto),
        },
        {
          $ref: getSchemaPath(SynologyFolderBodyDto),
        },
      ],
    },
  })
  async postFolderCgi(
    @User() user: AccountEntity,
    @Body() variousBodies: SynologyRootFolderBodyDto | SynologyFolderBodyDto,
  ): Promise<SynologyFolderResponseDto> {
    if ('id' in variousBodies) {
      const body = plainToInstance(SynologyFolderBodyDto, variousBodies);
      const data = await this.folderService.listFolders(
        user.id,
        body.id,
        body.offset,
        body.limit,
      );
      return {
        data,
        success: true,
      };
    }
    const body = plainToInstance(SynologyRootFolderBodyDto, variousBodies);
    const data = await this.folderService.listRootFolders(
      user.id,
      body.offset,
      body.limit,
    );
    return {
      data,
      success: true,
    };
  }
}
