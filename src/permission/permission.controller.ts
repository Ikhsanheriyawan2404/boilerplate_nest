import { Controller, Get, HttpCode, Param, ParseIntPipe } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { WebResponse } from 'src/model/web.model';
import { PermissionResponse } from './model/permission.model';
import { Public } from 'src/auth/decorators/public.decorator';

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  @HttpCode(200)
  async getAll(): Promise<WebResponse<PermissionResponse[]>> {
    const result = await this.permissionService.getAll();
    return {
      message: "Berhasil, list data permissions",
      data: result,
    };
  }

  @Public()
  @Get(":roleId")
  @HttpCode(200)
  async getPermissionByRole(
    @Param('roleId', ParseIntPipe) roleId: number,
  ): Promise<WebResponse<any>> {
    const result = await this.permissionService.getPermissionsByRoleId(roleId);
    return {
      message: "Berhasil, list data permissions",
      data: result,
    };
  }
}
