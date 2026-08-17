/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import {
  BadRequestResponse,
  NotFoundResponse,
  SuccessResponse,
} from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt } from 'class-validator';

export class AdminDeleteAccountQueryDto {
  /**
   * The ID of the account to be deleted.
   */
  @IsInt({ message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  declare accountId: number;
}

export class AdminDeleteAccountResponseDto extends SuccessResponse {}

export class AdminDeleteAccountNotFoundResponseDto extends NotFoundResponse {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [
      ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
      ErrorCodes.ACCOUNT_NOT_FOUND_ERROR,
    ],
    enumName: 'AdminDeleteAccountNotFoundErrorMessage',
    default: ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
  })
  declare message: ErrorCodes[];
}

export class AdminDeleteAccountBadRequestResponseDto extends BadRequestResponse {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [
      ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
      ErrorCodes.INVALID_ACCOUNT_ERROR,
      ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR,
    ],
    enumName: 'AdminDeleteAccountBadRequestErrorMessage',
    default: ErrorCodes.INVALID_ACCOUNT_ID_ERROR,
  })
  declare message: ErrorCodes[];
}
