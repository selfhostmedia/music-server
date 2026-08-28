import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListComposersWithTracksQueryDto } from './list-composers-with-tracks.dto';

@Injectable()
export class UserListComposersWithTracksService {
  constructor(private readonly libraryService: LibraryService) {}

  async listComposersWithTracks(accountId: number, query: UserListComposersWithTracksQueryDto) {
    const composers = await this.libraryService.listComposersWithTracks(
      accountId,
      query,
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    return {
      composers: composers.items,
      offset: query.offset || 0,
      total: composers.total,
    };
  }
}
