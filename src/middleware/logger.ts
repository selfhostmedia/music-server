import { Logger, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class AppLoggerMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(request: Request, response: Response, next: NextFunction): void {
    response.on('close', () => {
      this.logger.log(
        `${request.method} ${request.url} ${request.path} ${response.statusCode}`,
      );
    });
    next();
  }
}
