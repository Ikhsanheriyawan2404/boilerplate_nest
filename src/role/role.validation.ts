import { z, ZodType } from 'zod';

export class RoleValidation {
  static readonly CREATE: ZodType = z.object({
    name: z.string()
      .min(1)
      .max(255),
      permissions: z.array(z.number()).min(1)
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().positive(),
    name: z.string()
      .min(1)
      .max(255),
    permissions: z.array(z.number()).min(1)
  });
}
