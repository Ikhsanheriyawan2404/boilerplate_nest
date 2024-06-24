import { Injectable, NotFoundException } from '@nestjs/common';
import { permissions } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { PermissionResponse } from './model/permission.model';
import { NotFoundError } from 'rxjs';

@Injectable()
export class PermissionService {
  constructor(private prismaService: PrismaService) {}

  async getAll(): Promise<PermissionResponse[]> {
    const permissions = await this.prismaService.permissions.findMany({
      select: {
        id: true,
        name: true
      }
    })
    return permissions.map(permission => this.toPermissionResponse(permission));
  }

  private toPermissionResponse(permission: {id: bigint, name: string}): PermissionResponse {
    return {
      id: permission.id.toString(),
      name: permission.name,
    };
  }

  async getPermissionsByRoleId(roleId: number): Promise<any> {
    const rolePermissions = await this.prismaService.roles.findUnique({
      where: { id: roleId },
      include: {
        role_has_permissions: true, // Asumsi bahwa ada relasi `permissions` di dalam model `role`
      },
    });

    if (!rolePermissions) {
      throw new NotFoundException(`Role with id ${roleId} not found`);
    }
    const permissionIds = rolePermissions.role_has_permissions.map((tai) => tai.permission_id);
    const permissions = await this.prismaService.permissions.findMany({
      where: {
        id: {
          in: permissionIds,
        },
      },
    })

    return permissions.map(permission => {
      return {
        id: permission.id.toString(),
        name: permission.name
      }
    });
  }

  async getUserPermissions(roles: { id: number, name: string }[]): Promise<string[]> {
    const permissions = new Set<string>();

    for (const role of roles) {
      const rolePermissions = await this.getPermissionsByRoleId(role.id);
      rolePermissions.forEach(permission => permissions.add(permission.name));
    }

    return Array.from(permissions);
  }
}
