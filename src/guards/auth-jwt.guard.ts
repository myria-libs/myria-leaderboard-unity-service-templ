import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';

@Injectable()
export class AuthJwtGuard extends AuthGuard('jwt') implements CanActivate {
  private readonly logger = new Logger(AuthJwtGuard.name);

  constructor(private jwtService: JwtService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('JWT access token are required');
    }
    try {
      const payload = await this.jwtService.verify(token);
      request.user = payload;

      this.logger.log('Decoded JWT token ', JSON.stringify(payload));
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (ex: any) {
      if (ex?.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Access token has expired');
      }
      this.logger.log('Error => ', JSON.stringify(ex));
      throw new UnauthorizedException('Access token is invalid');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
