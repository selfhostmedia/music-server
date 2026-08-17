// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponse, SuccessResponse } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import {
  IsNumber,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class GuestCreateSessionBodyDto {
  /**
   * The username for the account
   */
  @IsString({ message: ErrorCodes.INVALID_USERNAME_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_USERNAME_LENGTH_ERROR })
  declare username: string;

  /**
   * The password for the account
   */
  @IsString({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  @Length(1, 255, { message: ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR })
  declare password: string;

  /**
   * The number of days until the session expires
   */
  @IsNumber(undefined, { message: ErrorCodes.INVALID_EXPIRES_AT_ERROR })
  @Min(0, { message: ErrorCodes.INVALID_EXPIRES_AT_RANGE_ERROR })
  @Max(3650, { message: ErrorCodes.INVALID_EXPIRES_AT_RANGE_ERROR })
  @ValidateIf((value) => value.expiresDays !== undefined)
  declare expiresDays?: number;
}

export class GuestCreateSessionResponseDto extends SuccessResponse {
  /**
   * The JWT session token that can be attached to requests to authenticate against the API
   */
  @IsString()
  jwtToken!: string;
}

export class GuestCreateSessionBadRequestResponseDto extends BadRequestResponse {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    isArray: true,
    enum: [
      ErrorCodes.INVALID_USERNAME_ERROR,
      ErrorCodes.INVALID_USERNAME_LENGTH_ERROR,
      ErrorCodes.INVALID_PASSWORD_ERROR,
      ErrorCodes.INVALID_PASSWORD_LENGTH_ERROR,
    ],
    enumName: 'GuestCreateSessionBadRequestErrorMessage',
  })
  declare message: ErrorCodes[];
}
