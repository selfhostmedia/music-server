/* eslint-disable max-classes-per-file */
import { IsBoolean } from 'class-validator';
import { SuccessResponse } from 'src/api/response.dto';

export class AdminSetIndexerStatusBodyDto {
  /**
   * Whether the scanner should be enabled or disabled
   */
  @IsBoolean()
  declare enabled: boolean;
}

export class AdminSetIndexerStatusResponseDto extends SuccessResponse {}
