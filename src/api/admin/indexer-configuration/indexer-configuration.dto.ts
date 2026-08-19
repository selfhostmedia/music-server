/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsInt, IsString } from 'class-validator';
import { SuccessResponseDto } from 'src/api/response.dto';

export class AdminIndexerConfigurationDto {
  @IsInt()
  declare id: number;

  @IsBoolean()
  declare isEnabled: boolean;

  @IsDate()
  declare createdAt: Date;

  @IsInt()
  declare createdByAccountId: number;

  @IsString()
  declare createdByUsername: string;
}

export class AdminIndexerConfigurationResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: AdminIndexerConfigurationDto,
  })
  declare configuration: AdminIndexerConfigurationDto;
}
