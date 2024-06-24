import { PermissionResponse } from "src/permission/model/permission.model";

export class RoleResponse {
  id: string;
  name: string;
  permissions?: PermissionResponse
}
  
export class CreateRoleRequest {
  name: string;
  permissions: number[];
}

export class UpdateRoleRequest {
  id: string;
  name: string;
  permissions: number[];
}
  