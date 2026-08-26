/* eslint-disable max-classes-per-file */
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsString } from 'class-validator';

export class LibraryAlbumDto {
  /**
   * The artist for the album, which is all the album artists in a comma-delimited list
   */
  @IsString({ each: true })
  declare albumArtists: string[];

  @IsString({ each: true })
  declare albumComposers: string[];

  @IsString({ each: true })
  declare albumGenres: string[];

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageLightVibrant?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageDarkVibrant?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageMuted?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageVibrant?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageDarkMuted?: string;

  /**
   * A color detected in the cover art image
   */
  @IsString()
  declare coverImageLightMuted?: string;

  /**
   * The date the album was added to the library
   */
  @IsDate()
  declare createdAt: Date;

  /**
   * The display name of the artist, which is used for sorting and display consistency when albums
   * have a different artist name than the album artist name.  For example, a compilation album may have
   * multiple artists but the album artist is "Various Artists" and the display artist is "Various".
   */
  @IsString({ each: true })
  declare displayArtist: string[];

  /**
   * The name or title of the album, this would usually come from an official source such as MusicBrainz
   * or Discogs.
   */
  @IsString()
  declare displayName: string;

  /**
   * The internally-generated unique ID of the album
   */
  @IsInt()
  declare id: number;

  /**
   * The aggregate rating for the album, which is a value between 0 and 5 inclusive applied to tracks.
   */
  @IsInt({ each: true })
  declare rating: number;

  /**
   * The name of the album used for sorting and display consistency, eg "Greatest Hits" but the display
   * name is "Greatest Hits (Remastered)".
   */
  @IsString()
  declare sortName: string;

  /**
   * The year the album was released.
   */
  @IsInt()
  declare year: number;
}

export class LibraryTrackDto {
  /**
   * The internally-generated unique ID of the track
   */
  @IsInt()
  declare id: number;

  /**
   * The list of artists for the track, if it is a comma-delimited string then it will be parsed into
   * an array each containing one name.  This data is very inconsistently-formatted even in official-ish
   * sources like MusicBrainz so it may end up with multiple artists in a single string.
   */
  @IsString({ each: true })
  declare artists: string[];

  /**
   * The list of composers for the track, if it is a comma-delimited string then it will be parsed into
   * an array each containing one name.  This data is very inconsistently-formatted even in official-ish
   * sources like MusicBrainz so it may end up with multiple composers in a single string.
   */
  @IsString({ each: true })
  declare composers: string[];

  /**
   * The disc number of the track on the album or disc if there are multiple discs.  If this field is not
   * specified it is assumed to be a single-disc album.
   */
  declare discNumber: number;

  /**
   * The duration of the track in seconds.
   */
  @IsInt()
  declare duration: number;

  /**
   * The internally-generated unique ID of the file associated with the track
   */
  @IsInt()
  declare fileId: number;

  /**
   * The list of genres for the track, if it is a comma-delimited string then it will be parsed into
   * an array each containing one name.
   */
  @IsString({ each: true })
  declare genres: string[];

  /**
   * The track number of the track on the album or disc if there are multiple discs.
   */
  @IsInt()
  declare trackNumber: number;

  /**
   * The rating of the track which is a value between 0 and 5 inclusive applied to the track.
   */
  @IsInt()
  declare rating: number;

  /**
   * The title of the track, which is usually the name of the song or piece of music.
   */
  @IsString()
  declare title: string;

  /**
   * The year of release of the track, often the same as the album except in "greatest hits"
   * and compilations.
   */
  @IsInt()
  declare year: number;
}

export class LibraryAlbumWithTracksDto extends LibraryAlbumDto {
  /**
   * The list of tracks for the album
   */
  @ApiProperty({
    type: LibraryTrackDto,
    isArray: true,
  })
  declare tracks: LibraryTrackDto[];
}
