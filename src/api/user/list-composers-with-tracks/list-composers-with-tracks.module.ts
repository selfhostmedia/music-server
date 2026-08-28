import { LibraryModule } from 'src/library/library.module';
import { Module } from '@nestjs/common';
import { UserListComposersWithTracksController } from './list-composers-with-tracks.controller';
import { UserListComposersWithTracksService } from './list-composers-with-tracks.service';

@Module({
  imports: [LibraryModule],
  controllers: [UserListComposersWithTracksController],
  providers: [UserListComposersWithTracksService],
})
export class UserListComposersWithTracksModule {}
