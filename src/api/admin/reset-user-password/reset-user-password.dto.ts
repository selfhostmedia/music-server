/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import {
  BadRequestResponse,
  NotFoundResponse,
  SuccessResponse,
} from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsString, Length } from 'class-validator';

export class AdminResetUserPasswordQueryDto {
  /**
   * The ID of the account whose password is to be reset.
   */
  @IsInt({ message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  declare accountId: number;
}

export class AdminResetUserPasswordBodyDto {
  @IsString({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR })
  declare newPassword: string;
}

export class AdminResetUserPasswordResponseDto extends SuccessResponse {}

export class AdminResetUserPasswordNotFoundResponseDto extends NotFoundResponse {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
    enumName: 'AdminResetUserPasswordNotFoundErrorMessage',
    default: ErrorCodes.ACCOUNT_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class AdminResetUserPasswordBadRequestResponseDto extends BadRequestResponse {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [
      ErrorCodes.INVALID_PASSWORD_ERROR,
      ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR,
    ],
    enumName: 'AdminResetUserPasswordBadRequestErrorMessage',
    default: ErrorCodes.INVALID_PASSWORD_ERROR,
  })
  declare message: ErrorCodes[];
}
