/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsString } from 'class-validator';
import { LibraryAlbumWithTracksDto } from './library.album.dto';

export class LibraryArtistDto {
  /**
   * The date the artist was added to the library
   */
  @IsDate()
  declare createdAt: Date;

  /**
   * The internally-generated unique ID of the artist
   */
  @IsInt()
  declare id: number;

  /**
   * The name of the artist.
   */
  @IsString()
  declare name: string;
}

export class LibraryArtistWithTracksDto extends LibraryArtistDto {
  /**
   * The list of albums including tracks for the artist
   */
  @ApiProperty({
    type: LibraryAlbumWithTracksDto,
    isArray: true,
  })
  declare albums: LibraryAlbumWithTracksDto[];
}
