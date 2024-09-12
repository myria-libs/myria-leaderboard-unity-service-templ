import {
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Injectable,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CommonResponseDto } from '../common/dto/common-response.dto';

@Injectable()
export class CommonResponseInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<CommonResponseDto> {
    return next.handle().pipe(
      map((data) => ({
        ...data
      })),
    );
  }
}
