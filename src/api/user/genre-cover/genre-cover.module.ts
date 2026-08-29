import { AlbumEntity } from 'src/database/entities';
import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserGenreCoverController } from './genre-cover.controller';
import { UserGenreCoverService } from './genre-cover.service';

@Module({
  imports: [SequelizeModule.forFeature([AlbumEntity])],
  controllers: [UserGenreCoverController],
  providers: [UserGenreCoverService],
})
export class UserGenreCoverModule {}
