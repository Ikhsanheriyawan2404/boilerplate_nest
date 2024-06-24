import { Controller, Get, Post, Body, Param, Delete, HttpCode, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { WebResponse } from 'src/model/web.model';
import { RoleService } from './role.service';
import { CreateRoleRequest, RoleResponse, UpdateRoleRequest } from './model/role.model';
import { PermissionsGuard } from 'src/permission/permission.guard';
import { Permissions } from 'src/permission/permission.decorator';

@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @UseGuards(PermissionsGuard)
  @Permissions('view_role')
  @Get()
  @HttpCode(200)
  async getAll(): Promise<WebResponse<RoleResponse[]>> {
    const result = await this.roleService.getAll();
    return {
      message: "Berhasil, list data roles",
      data: result,
    };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('create_role')
  @Post()
  @HttpCode(201)
  async create(
    @Body() request: CreateRoleRequest,
  ): Promise<WebResponse<any>> {
    const result = await this.roleService.create(request);
    return {
      message: "Berhasil tambah data role",
      data: result,
    };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('view_role')
  @Get('/:id')
  @HttpCode(200)
  async get(
    @Param('id', ParseIntPipe) roleId: number,
  ): Promise<WebResponse<RoleResponse>> {
    const result = await this.roleService.get(roleId);
    return {
      message: "Berhasil, detail data role",
      data: result,
    };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('edit_role')
  @Put('/:id')
  @HttpCode(200)
  async update(
    @Param('id', ParseIntPipe) levelId: string,
    @Body() request: UpdateRoleRequest,
  ): Promise<WebResponse<RoleResponse>> {
    request.id = levelId;
    const result = await this.roleService.update(request);
    return {
      message: "Berhasil update data role",
      data: result,
    };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('delete_role')
  @Delete('/:id')
  @HttpCode(200)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<null>> {
    await this.roleService.remove(id);
    return {
      message: "Berhasil hapus data role",
      data: null,
    };
  }
}
