import {
  type CanActivate,
  // type ExecutionContext,
  Injectable,
} from '@nestjs/common';
// import { Reflector } from '@nestjs/core';
// import _ from 'lodash';

// import { type RoleType } from '../constants';
// import { type UserEntity } from '../modules/user/user.entity';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate() // context: ExecutionContext,
  : boolean | Promise<boolean> | Observable<boolean> {
    throw new Error('Method not implemented.');
  }
  // constructor(private readonly reflector: Reflector) {}

  // canActivate(context: ExecutionContext): boolean {
  //   const roles = this.reflector.get<RoleType[]>('roles', context.getHandler());

  //   if (_.isEmpty(roles)) {
  //     return true;
  //   }

  //   const request = context.switchToHttp().getRequest();
  //   const user = <UserEntity>request.user;

  //   return roles.includes(user.role);
  // }
}
