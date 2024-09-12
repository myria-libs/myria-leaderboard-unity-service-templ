import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { CommonErrorResponseDto } from './../common/dto/common-err-response.dto';

@Catch()
export class CommonErrorInterceptor implements ExceptionFilter {
  /* eslint-disable @typescript-eslint/no-explicit-any */
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse: CommonErrorResponseDto = {
      status: 'error',
      message: exception.message || 'Internal Server Error',
      error: exception.name || 'InternalServerError',
      details: exception.details || null,
    };

    response.status(status).json(errorResponse);
  }
}
