/* eslint-disable max-classes-per-file */
import { IsBoolean, IsInt } from 'class-validator';
import { Transform } from 'class-transformer';

export class SynologyPaginationDto {
  /**
   * Defines the number of results to return.  If no value is specified a default of 100,000
   * is used to practically-ensure all results are returned.  This is a change from Synology's
   * API which defaults to 100, but Synology's mobile clients will specify their limit.
   */
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  declare limit: number;

  /**
   * Defines the pagination offset for the results.  If no value is specified a default of 0 is
   * used to start at the beginning of a result set.
   */
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  declare offset: number;
}

export class SynologySuccessResponseDto {
  /**
   * Boolean flag for the request ending successfully.  There are scenarios where Synology could
   * return false instead but this server will return an HTTP error response.
   */
  @IsBoolean()
  declare success: boolean;
}

export class SynologyPaginationResponseDto {
  /**
   * Defines the pagination offset for the results.  If no value is specified a default of 0 is
   * used to start at the beginning of a result set.
   */
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  declare offset: number;

  /**
   * The total number of results available for the request.  This is used to determine if there are
   * more results available for the request and if additional requests are needed to retrieve them.
   */
  @Transform(({ value }) => Number.parseInt(value, 10))
  @IsInt()
  declare total: number;
}
