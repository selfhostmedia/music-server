# Music Server

This software indexes music files in one or more folders and provides an API for accessing them.

The goal of this server is to be a multi-client backend that allows existing music smartphone apps to be used without a proprietary NAS, cloud service, and as a lightweight alternative to video-streaming software like JellyFin. Each person using the server can exercise their own preference for which smartphone app they want to use.

This software is not "vibe-coded" but has been built in conjunction with GitHub Copilot's code completion functionality.

## Synology compatibility

The API has been designed to be compatible with the Synology Audio Station API so it can be used as a drop-in replacement for Synology's DS Audio apps for Android and iOS:

- iOS: https://apps.apple.com/us/app/ds-audio/id321495303
- Android: https://play.google.com/store/apps/details?id=com.synology.DSaudio&hl=en-US
- Android: https://www.synology.com/en-us/support/download

The Synology API endpoints are fully compatible except for the concept of "shared" and "personal" libraries. On a Synology NAS these refer to a shared volume and the personal music folder within each user's home folder. This server does not have the concept of shared and personal libraries but each user can add the same root folders to access the same music collection.

Some functionality is only available in their AudioStation web interface such as creating playlists. The APIs for this exist but are not used by their smartphone apps.

RSA certificates required for encrypting credentials are stored in the `certs` folder and should be overwritten with your own. The docker image will automatically overwrite these for you.

```bash
$ cd certs
$ openssl genrsa -out private.pem 4096
$ openssl rsa -in private.pem -pubout -out public.pem
```

## Managing your metadata

This software does not modify your music files in any way. It reads the metadata from your music files and stores it in a database for faster access. The quality of your library's presentation is going to depend on this information being structured, organized and correct. [MusicBrainz Picard](https://picard.musicbrainz.org/) can help you with that.

## Managing users and root folders

Currently there is no user interface for managing users and root folders. You can open the SQLite database file and add them directly to the database. You will need to bcrypt-encrypt your password which can be done [here](https://www.w3schools.com/tools/tool_bcrypt.php).

# Configuration and setup

## Default account

The default account is `admin` with password `admin`. You can change the default account by setting the `DEFAULT_USERNAME` and `DEFAULT_PASSWORD` environment variables in your environment settings.

The default library path is set with `DEFAULT_ROOT_PATH` environment variable which allows a comma-delimited string of multiple paths to be specified. You can make the music folder read-only to ensure your collection cannot be modified.

## Running the server

Run it directly:

- Install NodeJS 20 or later
- Install dependencies with `npm install`
- Build the server with `npm run build`
- Start the server with `npm run start:prod`

Run it through Docker:

```bash
$ docker build -t music-server .
$ docker run \
    -p 3000:3000 \
    -v /path/to/music:/music:ro \
    -v /path/to/data:/data \
    -e DEFAULT_USERNAME=admin \
    -e DEFAULT_PASSWORD=admin \
    -e SYNOLOGY_AUDIOSTATION_ENABLED=true \
    -e SWAGGER_ENABLED=true \
    music-server
```

## Technical details

NodeJS with NestJS framework is used for the server, and Sequelize ORM is used for database access. The database is SQLite, which is stored in a file in the server's data folder.

Test suites are run with Jest using an in-memory SQLite database and a test library containing a small number of music files that are empty except for their metadata.

Swagger can be enabled for API documentation and can be accessed at `/swagger` when the server is running. The OpenAPI specification is available as JSON (`/swagger.json`) and YAML (`/swagger.yaml`).
