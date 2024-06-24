import { BadRequestException, HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import { ValidationService } from 'src/common/validation.service';
import { CreateUserRequest, UpdateUserRequest, UserResponse, UserSimpleResponse } from 'src/model/user.model';
import { UserValidation } from './users.validation';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    private validationService: ValidationService,
    private prismaService: PrismaService
  ) {}

  getAll(): Promise<UserSimpleResponse[]> {
    return this.prismaService.users.findMany({
      where: {
        deleted_at: null
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })
  }

  getAllTrash(): Promise<UserSimpleResponse[]> {
    return this.prismaService.users.findMany({
      where: {
        deleted_at: {
          not: null
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })
  }


  async findOneByEmail(email: string): Promise<any> {
    const userWithRoles = await this.prismaService.$transaction(async (prisma) => {

      const user = await prisma.users.findUnique({
        where: {
          email,
          deleted_at: null
        },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
        }
      });

      if (!user) {
        throw new BadRequestException('User not registered');
      }

      const userRoleIds = await prisma.model_has_roles.findMany({
        where: {
          model_id: user.id,
        },
        select: {
          role_id: true,
        },
      });

      const roleIds = userRoleIds.map((userRole) => userRole.role_id);

      const rolesData = await prisma.roles.findMany({
        where: {
          id: {
            in: roleIds,
          },
        },
      });

      const roles = rolesData.map(role => {
        return {
          id: role.id.toString(),
          name: role.name
        }
      });

      return { user, roles }
    })


    return {
      id: userWithRoles.user.id,
      name: userWithRoles.user.name,
      email: userWithRoles.user.email,
      password: userWithRoles.user.password,
      roles: userWithRoles.roles,
    };
  }

  async findById(id: number): Promise<any> {
    const userWithRoles = await this.prismaService.$transaction(async (prisma) => {

      const user = await prisma.users.findUnique({
        where: {
          id,
          deleted_at: null
        },
        select: {
          id: true,
          name: true,
          email: true,
        }
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const userRoleIds = await prisma.model_has_roles.findMany({
        where: {
          model_id: user.id,
        },
        select: {
          role_id: true,
        },
      });

      const roleIds = userRoleIds.map((userRole) => userRole.role_id);

      const rolesData = await prisma.roles.findMany({
        where: {
          id: {
            in: roleIds,
          },
        },
      });

      const roles = rolesData.map(role => {
        return {
          id: role.id.toString(),
          name: role.name
        }
      });

      return { user, roles }
    })

    return {
      id: userWithRoles.user.id,
      name: userWithRoles.user.name,
      email: userWithRoles.user.email,
      roles: userWithRoles.roles,
    };
  }

  async createUser(request: CreateUserRequest): Promise<any> {
    // this.logger.debug(`Register new user ${JSON.stringify(request)}`);
    const registerRequest: CreateUserRequest =
      this.validationService.validate(UserValidation.REGISTER, request);

    const existingUser = await this.prismaService.users.findFirst({
      where: {
        email: registerRequest.email,
      },
    });

    if (existingUser) {
      throw new BadRequestException('User dengan email tersebut sudah ada');
    }

    registerRequest.password = await bcrypt.hash(registerRequest.password, 10);

    const userWithRoles = await this.prismaService.$transaction(async (prisma) => {
      const user = await prisma.users.create({
        data: {
          name: registerRequest.name,
          email: registerRequest.email,
          password: registerRequest.password,
        },
        select: {
          id: true,
          name: true,
          email: true,
          password: false
        },
      });

      let roles = []

      await Promise.all(registerRequest.roles.map(async (roleId) => {
        const role = await prisma.roles.findFirst({
          where: {
            id: Number(roleId)
          }
        });

        await prisma.model_has_roles.create({
          data: {
            role_id: Number(roleId),
            model_id: user.id,
            model_type: 'App\\Models\\User',
          }
        });

        roles.push(role);
      }));

      const newRoles = roles.map(role => {
        return {
          id: role.id.toString,
          name: role.name,
        }
      });
      return { user, newRoles };
    });

    return userWithRoles;
  }

  async checkDataMustExist(
    userId: number,
  ): Promise<UserSimpleResponse> {
    const user = await this.prismaService.users.findFirst({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user
  }

  async get(userId: number): Promise<UserResponse> {
    const user = await this.findById(userId);
    return this.response(user);
  }

  async update(
    request: UpdateUserRequest,
  ): Promise<UserResponse> {
    const updateRequest = this.validationService.validate(
      UserValidation.UPDATE,
      request,
    );

    // Validate unique email
    const existingUser = await this.prismaService.users.findFirst({
      where: {
        email: updateRequest.email,
      },
    });

    let user = await this.findById(
      updateRequest.id,
    );

    if (existingUser && existingUser.id !== updateRequest.id) {
      throw new BadRequestException('User dengan email tersebut sudah ada');
    }

    const updateData :any = {
      name: updateRequest.name,
      email: updateRequest.email,
    };

    if (updateRequest.password) {
      updateData.password = await bcrypt.hash(updateRequest.password, 10);
    }

    return await this.prismaService.$transaction(async (prisma) => {
      // Update user
      user = await prisma.users.update({
        where: {
          id: user.id,
        },
        data: updateData,
      });

      // Hapus role lama
      await prisma.model_has_roles.deleteMany({
        where: {
          model_id: user.id,
        },
      });
      // Tambahkan role baru
      const roleData = updateRequest.roles.map((roleId: number) => ({
        model_id: user.id,
        model_type: 'App\\Models\\User',
        role_id: roleId,
      }));

      await prisma.model_has_roles.createMany({
        data: roleData,
      });

      return this.response(user);
    })
  }

  async remove(id: number): Promise<UserResponse> {
    await this.checkDataMustExist(id);

    const user = await this.prismaService.users.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    return this.response(user);
  }

  async restore(id: number): Promise<UserResponse> {
    await this.checkDataMustExist(id);

    const user = await this.prismaService.users.update({
      where: { id },
      data: { deleted_at: null },
    });

    return this.response(user);
  }

  async hardDelete(id: number): Promise<void> {
    const user = await this.prismaService.users.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await this.prismaService.users.delete({ where: { id } });
  }

  async bulkRestore(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.checkDataMustExist(id);
    }
    await this.prismaService.users.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: { deleted_at: null },
    });
  }

  async bulkRemove(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.checkDataMustExist(id);
    }

    await this.prismaService.users.updateMany({
      where: {
        id: {
          in: ids
        }
      },
      data: { deleted_at: new Date() },
    });
  }

  async bulkHardDelete(ids: number[]): Promise<void> {
    for (const id of ids) {
      await this.checkDataMustExist(id);
    }
    await this.prismaService.users.deleteMany({ where: { id: { in: ids }} });
  }

  private response(user: any): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      roles: user.roles
    };
  }
}
