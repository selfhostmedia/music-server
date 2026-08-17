/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import {
  BadRequestResponse,
  NotFoundResponse,
  SuccessResponse,
} from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsEnum, IsInt } from 'class-validator';
import { UserRole } from 'src/constants/enums';

export class AdminUpdateUserRolesQueryDto {
  /**
   * The ID of the account whose roles are changing.
   */
  @IsInt({ message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  declare accountId: number;
}

export class AdminUpdateUserRolesBodyDto {
  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    isArray: true,
  })
  @IsEnum(UserRole, {
    each: true,
    message: ErrorCodes.INVALID_USER_ROLE_ERROR,
  })
  declare roles: UserRole[];
}

export class AdminUpdateUserRolesResponseDto extends SuccessResponse {}

export class AdminUpdateUserRolesNotFoundResponseDto extends NotFoundResponse {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [ErrorCodes.ACCOUNT_NOT_FOUND_ERROR],
    enumName: 'AdminUpdateUserRolesNotFoundErrorMessage',
    default: ErrorCodes.ACCOUNT_NOT_FOUND_ERROR,
  })
  declare message: ErrorCodes[];
}

export class AdminUpdateUserRolesBadRequestResponseDto extends BadRequestResponse {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [
      ErrorCodes.INVALID_USER_ROLE_ERROR,
      ErrorCodes.ACCOUNT_ONLY_ADMIN_ERROR,
    ],
    enumName: 'AdminUpdateUserRolesBadRequestErrorMessage',
    default: ErrorCodes.INVALID_USER_ROLE_ERROR,
  })
  declare message: ErrorCodes[];
}
