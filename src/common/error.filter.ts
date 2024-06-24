  import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
  } from '@nestjs/common';
  import { ZodError } from 'zod';

  @Catch(ZodError, HttpException)
  export class ErrorFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
      const response = host.switchToHttp().getResponse();

      if (exception instanceof HttpException) {
        response.status(exception.getStatus()).json({
          errors: exception.getResponse()
        });
      } else if (exception instanceof ZodError) {
        const validationErrors = exception.errors.map(error => ({
          path: error.path.join('.'),
          message: error.message,
        }));

        response.status(422).json({
          errors: {
            message: 'Validation error',
            statusCode: 422
          },
          validationErrors: validationErrors, // Include validation errors in response
        });
      } else {
        response.status(500).json({
          errors: {
            message: exception.message,
            statusCode: 500
          },
        });
      }
    }
  }
