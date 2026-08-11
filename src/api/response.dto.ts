/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsBoolean, IsNumber, IsString } from 'class-validator';

/**
 * The response data structure for requests that complete successfully unless they return
 * binary, files, etc.
 */
export class SuccessResponse {
  /**
   * The success being "true" indicates that the request completed.
   */
  @ApiProperty({
    type: 'boolean',
    format: 'constant',
    default: true,
  })
  @IsBoolean()
  readonly success = true;
}

/**
 * The response data of a paginated query
 */
export class PaginatedResponseDataDto {
  /*
   * The number of results to return from the query.
   */
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: ErrorCodes.INVALID_LIMIT_ERROR },
  )
  limit: number = 0;

  /*
   * The starting point of results returned for pagination within the total set of results.
   */
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: ErrorCodes.INVALID_OFFSET_ERROR },
  )
  offset: number = 0;

  /*
   * The total number of results
   */
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: ErrorCodes.INVALID_TOTAL_RESULTS_ERROR },
  )
  total: number = 0;
}

/**
 * The response data structure for requests that fail.
 */
export class FailedResponse {
  /**
   * General description of the error class
   */
  @ApiProperty()
  @IsString()
  error!: string;

  /**
   * The success being "false" indicates that the request failed to complete.
   */
  @ApiProperty({
    type: 'boolean',
    format: 'constant',
    default: false,
  })
  @IsBoolean()
  readonly success = false;
}

/**
 * The response data structure for requests that fail unexpectedly with an internal server error.
 */
export class InternalServerErrorResponse extends FailedResponse {
  /**
   * An internal error occurred that isn't handled by the API and doesn't have a more specific error
   * message defined.
   */
  @ApiProperty({
    type: 'string',
    format: 'constant',
    enum: ErrorCodes,
    enumName: 'FailedResponseErrorCodes',
    default: ErrorCodes.INTERNAL_SERVER_ERROR,
  })
  readonly message = [ErrorCodes.INTERNAL_SERVER_ERROR];
}

/**
 * The response data structure for requests that fail with a validation or other supported error message.
 */
export class BadRequestResponse extends FailedResponse {
  /**
   * A bad request occurred due to validation or other issues with the submitted data.
   */
  @ApiProperty({
    type: 'string',
    format: 'constant',
    enum: ErrorCodes,
    enumName: 'BadRequestResponseErrorCodes',
    default: ErrorCodes.BAD_REQUEST_ERROR,
  })
  readonly message = [ErrorCodes.BAD_REQUEST_ERROR];
}

/**
 * The response data structure for requests that fail with a validation or other supported error message.
 */
export class NotFoundResponse extends FailedResponse {
  /**
   * A not found error occurred due to the requested resource not being found.
   */
  @ApiProperty({
    type: 'string',
    format: 'constant',
    enum: ErrorCodes,
    enumName: 'NotFoundResponseErrorCodes',
    default: ErrorCodes.NOT_FOUND_ERROR,
  })
  readonly message = [ErrorCodes.NOT_FOUND_ERROR];
}
