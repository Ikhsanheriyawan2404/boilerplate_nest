import { z, ZodType } from 'zod';

export class UserValidation {
  static readonly REGISTER: ZodType = z.object({
    name: z.string()
      .min(1, { message: "Nama harus diisi" })
      .max(255, { message: "Nama tidak boleh lebih dari 255 karakter" }),
    email: z.string()
      .min(1, { message: "Email harus diisi" })
      .max(255, { message: "Email tidak boleh lebih dari 255 karakter" })
      .email({ message: "Format email tidak valid" }),
    password: z.string()
      .min(1, "Password harus diisi")
      .max(255, "Password tidak boleh lebih dari 255 karakter"),
    password_confirmation: z.string()
      .min(1, { message: "Konfirmasi password harus diisi" })
      .max(255, { message: "Konfirmasi password tidak boleh lebih dari 255 karakter" }),
    roles: z.array(z.number()).min(1, { message: "Roles harus berisi minimal satu item" })
  }).refine(data => data.password === data.password_confirmation, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["password_confirmation"],
  });

  static readonly CREATE: ZodType = z.object({
    name: z.string()
      .min(1, { message: "Nama harus diisi" })
      .max(255, { message: "Nama tidak boleh lebih dari 255 karakter" }),
    email: z.string()
      .min(1, { message: "Email harus diisi" })
      .max(255, { message: "Email tidak boleh lebih dari 255 karakter" })
      .email({ message: "Format email tidak valid" }),
    password: z.string()
      .min(1, "Password harus diisi")
      .max(255, "Password tidak boleh lebih dari 255 karakter"),
    password_confirmation: z.string()
      .min(1, { message: "Konfirmasi password harus diisi" })
      .max(255, { message: "Konfirmasi password tidak boleh lebih dari 255 karakter" }),
    position: z.string()
      .min(1, { message: "Posisi harus diisi" })
      .max(255, { message: "Posisi tidak boleh lebih dari 255 karakter" }),
  }).refine(data => data.password === data.password_confirmation, {
    message: "Password dan konfirmasi password tidak cocok",
    path: ["password_confirmation"],
  });

  static readonly LOGIN: ZodType = z.object({
    email: z.string().min(1).max(255),
    password: z.string().min(1).max(255),
  });

  static readonly UPDATE: ZodType = z.object({
    id: z.number().positive(),
    name: z.string()
      .min(1, { message: "Nama harus diisi" })
      .max(255, { message: "Nama tidak boleh lebih dari 255 karakter" }),
    email: z.string()
      .min(1, { message: "Email harus diisi" })
      .max(255, { message: "Email tidak boleh lebih dari 255 karakter" })
      .email({ message: "Format email tidak valid" }),
    password: z.string()
      .max(255, "Password tidak boleh lebih dari 255 karakter")
      .optional(),
    password_confirmation: z.string()
      .max(255, { message: "Konfirmasi password tidak boleh lebih dari 255 karakter" })
      .optional(),
    roles: z.array(z.number()).min(1, { message: "Roles harus berisi minimal satu item" })
  });
}
