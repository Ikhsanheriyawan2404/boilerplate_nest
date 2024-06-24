import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { UsersService } from 'src/users/users.service';

@Module({
  controllers: [PermissionController],
  exports: [PermissionService],
  providers: [PermissionService],
})
export class PermissionModule {}
