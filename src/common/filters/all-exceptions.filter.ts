// src/common/filters/all-exceptions.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { GqlArgumentsHost } from '@nestjs/graphql';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);
  catch(exception: unknown, host: ArgumentsHost) {
    const gqlHost = GqlArgumentsHost.create(host);
    const context = gqlHost.getContext();

    // Log the error for internal tracking
    this.logger.error('Unhandled Exception:', exception);

    // Determine the appropriate error response
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    // Create a standardized error response
    return {
      message: this.getErrorMessage(exception),
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: context.req?.url || 'Unknown',
    };
  }

  private getErrorMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      return exception.message;
    }

    if (exception instanceof Error) {
      return exception.message;
    }

    return 'Internal Server Error';
  }
}
