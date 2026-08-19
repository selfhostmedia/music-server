import { AdminRegenerateMasterSessionKeyController } from './regenerate-master-session-key.controller';
import { AdminRegenerateMasterSessionKeyService } from './regenerate-master-session-key.service';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { SystemConfigurationEntity } from 'src/database/entities';

@Module({
  imports: [SequelizeModule.forFeature([SystemConfigurationEntity])],
  controllers: [AdminRegenerateMasterSessionKeyController],
  providers: [AdminRegenerateMasterSessionKeyService],
})
export class AdminRegenerateMasterSessionKeyModule {}
