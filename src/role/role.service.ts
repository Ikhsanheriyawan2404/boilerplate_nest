import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { CreateRoleRequest, RoleResponse, UpdateRoleRequest } from './model/role.model';
import { RoleValidation } from './role.validation';
import { PermissionResponse } from 'src/permission/model/permission.model';

@Injectable()
export class RoleService {
  constructor(
    private prismaService: PrismaService,
    private validationService: ValidationService
  ) {}

  async getAll(): Promise<RoleResponse[]> {
    const roles = await this.prismaService.roles.findMany({
      select: {
        id: true,
        name: true
      }
    })
    return roles.map(role => this.toResponse(role));
  }

  async create(request: CreateRoleRequest): Promise<any> {
    const createRequest: CreateRoleRequest =
      this.validationService.validate(RoleValidation.CREATE, request);

    const roleWithPermissions = await this.prismaService.$transaction(async (prisma) => {
      const role = await prisma.roles.create({
        data: {
          name: createRequest.name,
          guard_name: 'web'
        },
      });

      let permissions = []

      await Promise.all(createRequest.permissions.map(async (permissionId) => {
        const permission = await prisma.permissions.findFirst({
          where: {
            id: Number(permissionId)
          }
        });

        await prisma.role_has_permissions.create({
          data: {
            role_id: role.id,
            permission_id: Number(permissionId),
          }
        });

        permissions.push(permission);
      }));

      const newRole = {
        id: role.id.toString(),
        name: role.name,
      }

      const newPermissions = permissions.map(permission => {
        return {
          id: permission.id.toString(),
          name: permission.name,
        }
      });
      return { newRole, newPermissions };
    });

    return roleWithPermissions
  }

  private toResponse(role: any): RoleResponse {
    return {
      id: role.id.toString(),
      name: role.name,
      permissions: role.permissions
    };
  }

  private async checkroleMustExists(
    roleId: number,
  ): Promise<any> {
    const roleWithPermissions = await this.prismaService.$transaction(async (prisma) => {
      const role = await prisma.roles.findFirst({
        where: {
          id: roleId,
        },
      });

      if (!role) {
        throw new NotFoundException('Role is not found');
      }

      const rolePermissionsIds = await prisma.role_has_permissions.findMany({
        where: {
          role_id: role.id,
        },
        select: {
          permission_id: true,
        },
      });

      const permissionIds = rolePermissionsIds.map((rolePermissions) => rolePermissions.permission_id);

      const permissions = await prisma.permissions.findMany({
        where: {
          id: {
            in: permissionIds,
          },
        },
      });

      const newPermissions = permissions.map(permission => {
        return {
          id: permission.id.toString(),
          name: permission.name
        }
      });

      return { role, newPermissions };
    })

    return {
      id: roleWithPermissions.role.id,
      name: roleWithPermissions.role.name,
      permissions: roleWithPermissions.newPermissions,
    };
  }

  async get(roleId: number): Promise<RoleResponse> {
    const role = await this.checkroleMustExists(roleId);
    return this.toResponse(role);
  }

  async update(
    request: UpdateRoleRequest,
  ): Promise<RoleResponse> {
    const updateRequest = this.validationService.validate(
      RoleValidation.UPDATE,
      request,
    );
    let role = await this.checkroleMustExists(
      updateRequest.id,
    );

    return await this.prismaService.$transaction(async (prisma) => {

      role = await this.prismaService.roles.update({
        where: {
          id: role.id,
        },
        data: {
          name: updateRequest.name
        },
      });

      // Hapus role lama
      await prisma.role_has_permissions.deleteMany({
        where: {
          role_id: role.id,
        },
      });
      // Tambahkan role baru
      const permissionData = updateRequest.permissions.map((permissionId: number) => ({
        role_id: role.id,
        permission_id: permissionId,
      }));

      await prisma.role_has_permissions.createMany({
        data: permissionData,
      });

      return this.toResponse(role);

    })
  }

  async remove(id: number): Promise<RoleResponse> {
    await this.checkroleMustExists(id);

    const role = await this.prismaService.roles.delete({
      where: {
        id,
      },
    });

    return this.toResponse(role);
  }
}
