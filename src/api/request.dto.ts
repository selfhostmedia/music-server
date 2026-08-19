import { ApiProperty } from '@nestjs/swagger';
import { ErrorCodes } from 'src/constants/error-codes';
import { IsNumber, IsOptional, Max, Min, ValidateIf } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationQueryDto {
  /*
   * The number of results to return from the query
   */
  @ApiProperty({ required: false, default: 0 })
  @Transform(({ value }) => parseInt(value, 10) || 0)
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: ErrorCodes.INVALID_LIMIT_ERROR })
  @Min(1, { message: ErrorCodes.INVALID_LIMIT_ERROR })
  @Max(100, { message: ErrorCodes.INVALID_LIMIT_ERROR })
  @IsOptional()
  @ValidateIf((value) => value > 0)
  limit?: number = 0;

  /*
   * The starting point of results returned for pagination within the total set of results
   */
  @IsNumber({ allowNaN: false, allowInfinity: false }, { message: ErrorCodes.INVALID_OFFSET_ERROR })
  @Transform(({ value }) => parseInt(value, 10) || 0)
  @ApiProperty({ required: false, default: 0 })
  @Min(0, { message: ErrorCodes.INVALID_OFFSET_ERROR })
  @IsOptional()
  @ValidateIf((value) => value > 0)
  offset?: number = 0;
}
