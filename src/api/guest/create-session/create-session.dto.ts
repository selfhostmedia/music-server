// eslint-disable-next-line max-classes-per-file
import { ApiProperty } from '@nestjs/swagger';
import { BadRequestResponse, SuccessResponse } from 'src/api/response.dto';
import { ErrorCodes } from 'src/constants/error-codes';
import {
  IsEmail,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

export class GuestCreateSessionBodyDto {
  /**
   * The email address for the account
   */
  @IsEmail(undefined, { message: ErrorCodes.INVALID_EMAIL_ERROR })
  email!: string;

  /**
   * The password for the account
   */
  @IsString({ message: ErrorCodes.INVALID_PASSWORD_ERROR })
  password!: string;

  /**
   * The number of days until the session expires
   */
  @IsNumber(undefined, { message: ErrorCodes.INVALID_EXPIRES_AT_ERROR })
  @Min(0, { message: ErrorCodes.INVALID_EXPIRES_AT_RANGE_ERROR })
  @Max(365, { message: ErrorCodes.INVALID_EXPIRES_AT_RANGE_ERROR })
  @ValidateIf((value) => value.expiresDays?.length)
  expiresDays!: number;
}

export class GuestCreateSessionResponseDto extends SuccessResponse {
  /**
   * The JWT session token that can be attached to requests to authenticate against the API
   */
  @IsString()
  jwtToken!: string;
}

export class GuestCreateSessionBadResponseDto extends BadRequestResponse {
  /**
   * The error message(s) that occurred during the validation of the request data or additional requirements
   * applied during the execution of the request
   */
  @ApiProperty({
    type: 'string',
    isArray: true,
    enum: [ErrorCodes.INVALID_EMAIL_ERROR, ErrorCodes.INVALID_PASSWORD_ERROR],
  })
  declare message: ErrorCodes[];
}
