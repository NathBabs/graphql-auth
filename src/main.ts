import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { validationConfig } from './common/config/validation.config';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { Request, Response, NextFunction } from 'express';

// Handle favicon requests
interface FaviconRequestHandler {
  (req: Request, res: Response, next: NextFunction): void;
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const handleFaviconRequest: FaviconRequestHandler = (req, res, next) => {
    if (req.originalUrl === '/favicon.ico') {
      res.status(204).end();
    } else {
      next();
    }
  };

  app.use(handleFaviconRequest);

  // Apply global validation pipe
  app.useGlobalPipes(validationConfig);

  // Apply global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
