/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger/dist/decorators/api-property.decorator';
import { IsInt, IsString } from 'class-validator';
import { SuccessResponse } from 'src/api/response.dto';
import { UserRole } from 'src/constants/enums';

export class AdminAccountDto {
  @IsInt()
  declare id: number;

  @IsString()
  declare username: string;

  @ApiProperty({
    enum: UserRole,
    enumName: 'UserRole',
    isArray: true,
  })
  declare roles: UserRole[];
}

export class AdminListAccountsResponseDto extends SuccessResponse {
  @ApiProperty({ type: AdminAccountDto, isArray: true })
  declare accounts: AdminAccountDto[];
}
