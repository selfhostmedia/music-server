// eslint-disable-next-line max-classes-per-file
import { ApiProperty, IntersectionType } from '@nestjs/swagger';
import { BadRequestResponse, SuccessResponse } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsInt, IsString, Length, Min, ValidateIf } from 'class-validator';

export class GuestCreateAccountBodyDto {
  /**
   * The username for signing in
   */
  @IsString()
  @Length(1, 255, { message: ErrorCodes.INVALID_USERNAME_LENGTH_ERROR })
  username!: string;

  /**
   * The plain-text password the user will enter to sign in
   */
  @IsString({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  @Length(8, 255, { message: ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR })
  @ValidateIf((value) => value.password?.length, {
    message: ErrorCodes.INVALID_PASSWORD_ERROR,
  })
  password!: string;
}

export class GuestCreateAccountDataDto {
  /**
   * The ID of the newly-registered account
   */
  @IsInt()
  @Min(1, { message: ErrorCodes.INVALID_ACCOUNT_ID_ERROR })
  accountId!: number;

  /**
   * The JWT session token that can be attached to requests to authenticate against the API
   */
  @IsString()
  jwtToken!: string;
}

export class GuestCreateAccountResponseDto extends IntersectionType(
  SuccessResponse,
  GuestCreateAccountDataDto,
) {}

export class GuestCreateAccountBadResponseDto extends BadRequestResponse {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    type: 'string',
    isArray: true,
    enum: [
      ErrorCodes.INVALID_USERNAME_ERROR,
      ErrorCodes.INVALID_USERNAME_LENGTH_ERROR,
      ErrorCodes.INVALID_USERNAME_NOT_UNIQUE_ERROR,
      ErrorCodes.INVALID_PASSWORD_ERROR,
      ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR,
    ],
  })
  declare message: ErrorCodes[];
}
