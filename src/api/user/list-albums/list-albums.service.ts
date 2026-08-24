import { Injectable } from '@nestjs/common';
import { LibraryService } from 'src/library/library.service';
import { UserListAlbumsQueryDto } from './list-albums.dto';

@Injectable()
export class UserListAlbumsService {
  constructor(private readonly libraryService: LibraryService) {}

  async listAlbums(accountId: number, query: UserListAlbumsQueryDto) {
    const filter = {
      filter: query.filter,
      artist: query.artist,
      composer: query.composer,
      genre: query.genre,
      year: query.year,
      minRating: query.minRating,
      maxRating: query.maxRating,
      addedBefore: query.addedBefore,
      addedAfter: query.addedAfter,
    };
    const albums = await this.libraryService.listAlbums(
      accountId,
      filter,
      query.offset || 0,
      query.limit || 100_000,
      query.sortField,
      query.sortDirection,
    );
    return {
      albums: albums.items,
      total: albums.total,
    };
  }
}
