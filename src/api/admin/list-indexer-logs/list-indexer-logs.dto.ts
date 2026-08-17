/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import {
  BadRequestResponse,
  NotFoundResponse,
  SuccessResponse,
} from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsDate, IsInt, IsOptional, IsString, Length } from 'class-validator';

export class AdminLogEntryDto {
  @IsInt()
  declare accountId: number;

  @IsDate()
  declare date: Date;

  @IsString()
  declare username: string;

  @IsInt()
  declare rootPathId: number;

  @IsString()
  declare rootPath: string;

  @IsString()
  declare message: string;
}

export class AdminListIndexerLogsQueryDto {
  @IsInt({ message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  @IsOptional()
  accountId?: number;

  @IsInt({ message: ErrorCodes.INVALID_ROOT_PATH_ID_ERROR })
  @IsOptional()
  rootPathId?: number;

  @IsString()
  @Length(1, 50, { message: ErrorCodes.INVALID_SEARCH_LENGTH_ERROR })
  @IsOptional()
  search?: string;
}

export class AdminListIndexerLogsResponseDto extends SuccessResponse {
  @ApiProperty({
    type: AdminLogEntryDto,
    isArray: true,
  })
  declare logs: AdminLogEntryDto[];
}

export class AdminListIndexerLogsNotFoundResponseDto extends NotFoundResponse {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [
      ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
      ErrorCodes.INVALID_ROOT_PATH_ID_ERROR,
    ],
    enumName: 'AdminListIndexerLogsNotFoundErrorMessage',
    default: ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
  })
  declare message: ErrorCodes[];
}

export class AdminListIndexerLogsBadRequestResponseDto extends BadRequestResponse {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [
      ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
      ErrorCodes.INVALID_ROOT_PATH_ID_ERROR,
      ErrorCodes.INVALID_SEARCH_LENGTH_ERROR,
    ],
    enumName: 'AdminListIndexerLogsBadRequestErrorMessage',
    default: ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
  })
  declare message: ErrorCodes[];
}
