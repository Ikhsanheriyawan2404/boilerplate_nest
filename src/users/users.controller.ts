import { Controller, Get, Post, Body, Param, Put, Delete, HttpCode, ParseIntPipe, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserRequest, UpdateUserRequest, UserResponse, UserSimpleResponse } from 'src/model/user.model';
import { WebResponse } from 'src/model/web.model';
import { PermissionsGuard } from 'src/permission/permission.guard';
import { Permissions } from 'src/permission/permission.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @UseGuards(PermissionsGuard)
  @Permissions('view_user')
  @Get()
  @HttpCode(200)
  async getAll(): Promise<WebResponse<UserSimpleResponse[]>> {
    const result = await this.userService.getAll();
    return {
      message: "Berhasil, list data users",
      data: result,
    };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('view_user')
  @Get("trashed")
  @HttpCode(200)
  async getAllTrash(): Promise<WebResponse<UserSimpleResponse[]>> {
    const result = await this.userService.getAllTrash();
    return {
      message: "Berhasil, list data users trash",
      data: result,
    };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('create_user')
  @Post()
  @HttpCode(201)
  async createUser(@Body() request: CreateUserRequest): Promise<WebResponse<any>> {
    const result = await this.userService.createUser(request);
    return {
      message: "Berhasil tambah data user",
      data: result,
    };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('view_user')
  @Get('/:id')
  @HttpCode(200)
  async get(
    @Param('id', ParseIntPipe) userId: number,
  ): Promise<WebResponse<UserResponse>> {
    const result = await this.userService.get(userId);
    return {
      message: "Berhasil, detail data user",
      data: result,
    };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('edit_user')
  @Put('/:id')
  @HttpCode(200)
  async update(
    @Param('id', ParseIntPipe) userId: number,
    @Body() request: UpdateUserRequest,
  ): Promise<WebResponse<UserResponse>> {
    request.id = userId;
    console.log({request})
    const result = await this.userService.update(request);
    return {
      message: "Berhasil update data user",
      data: result,
    };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('delete_user')
  @Delete('/:id')
  @HttpCode(200)
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<null>> {
    await this.userService.remove(id);
    return {
      message: "Berhasil hapus data user",
      data: null,
    };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('edit_user')
  @Put('/:id/restore')
  @HttpCode(200)
  async restore(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<null>> {
    await this.userService.restore(id);
    return {
      message: "Berhasil pulihkan data user",
      data: null,
    };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('delete_user')
  @Delete('/:id/force')
  @HttpCode(200)
  async destroy(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WebResponse<null>> {
    await this.userService.hardDelete(id);
    return {
      message: "Berhasil hapus data user permanen",
      data: null,
    };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('edit_user')
  @Post('/bulk-restore')
  @HttpCode(200)
  async bulkRestore(
    @Body('ids') ids: number[],
  ): Promise<WebResponse<null>> {
    await this.userService.bulkRestore(ids);
    return {
      message: "Berhasil pulihkan data user",
      data: null,
    };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('delete_user')
  @Post('/bulk-remove')
  @HttpCode(200)
  async bulkRemove(
    @Body('ids') ids: number[],
  ): Promise<WebResponse<null>> {
    await this.userService.bulkRemove(ids);
    return {
      message: "Berhasil hapus data user",
      data: null,
    };
  }

  @UseGuards(PermissionsGuard)
  @Permissions('delete_user')
  @Post('/bulk-force')
  @HttpCode(200)
  async bulkDestroy(
    @Body('ids') ids: number[],
  ): Promise<WebResponse<null>> {
    await this.userService.bulkHardDelete(ids);
    return {
      message: "Berhasil hapus data user permanen",
      data: null,
    };
  }
}
