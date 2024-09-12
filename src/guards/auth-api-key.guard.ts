import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

export class AuthApiKeyGuard implements CanActivate {
  constructor() {}

  canActivate(context: ExecutionContext): boolean {
    const [request] = context.getArgs();
    const xApiKey = request.headers['x-api-key'];

    if (!xApiKey) {
      throw new UnauthorizedException('x-api-key Not found');
    }

    if (xApiKey !== 'x-api-key') {
      throw new UnauthorizedException('x-api-key is not correct');
    }

    return true;
  }
}
