import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Global } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from './permission.service';

@Global()
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>('permission', context.getHandler());

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    const userPermissions = await this.permissionService.getUserPermissions(user.roles);

    if (userPermissions.includes(requiredPermission)) {
      return true;
    } else {
      throw new ForbiddenException('You do not have permission to access this resource');
    }
  }
}
