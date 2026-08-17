// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponse, SuccessResponse } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsString, Length, ValidateIf } from 'class-validator';
import { UserRole } from 'src/constants/enums/user-role.enum';

export class AdminCreateAccountBodyDto {
  /**
   * The username for signing in
   */
  @IsString()
  @Length(1, 255, { message: ErrorCodes.INVALID_USERNAME_LENGTH_ERROR })
  declare username: string;

  /**
   * The plain-text password the user will enter to sign in.  It will be hashed and securely-stored in the database.
   */
  @IsString({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR })
  @ValidateIf((value) => value.password?.length, {
    message: ErrorCodes.INVALID_PASSWORD_ERROR,
  })
  declare password: string;

  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    isArray: true,
  })
  declare roles: UserRole[];
}

export class AdminCreateAccountResponseDto extends SuccessResponse {}

export class AdminCreateAccountBadRequestResponseDto extends BadRequestResponse {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [
      ErrorCodes.INVALID_USER_ROLE_ERROR,
      ErrorCodes.INVALID_USERNAME_ERROR,
      ErrorCodes.INVALID_USERNAME_LENGTH_ERROR,
      ErrorCodes.INVALID_USERNAME_NOT_UNIQUE_ERROR,
      ErrorCodes.INVALID_PASSWORD_ERROR,
      ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR,
    ],
    enumName: 'AdminCreateAccountBadRequestErrorMessage',
  })
  declare message: ErrorCodes[];
}
