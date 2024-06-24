import { Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function clearDatabase() {
  await prisma.model_has_permissions.deleteMany({});
  await prisma.model_has_roles.deleteMany({});
  await prisma.role_has_permissions.deleteMany({});
  await prisma.permissions.deleteMany({});
  await prisma.roles.deleteMany({});
  await prisma.users.deleteMany({});
}

async function resetSequences() {
  const resetQueries: Prisma.Sql[] = [
    // Prisma.sql`ALTER SEQUENCE model_has_permissions_id_seq RESTART WITH 1`,
    // Prisma.sql`ALTER SEQUENCE model_has_roles_id_seq RESTART WITH 1`,
    // Prisma.sql`ALTER SEQUENCE role_has_permissions_id_seq RESTART WITH 1`,
    Prisma.sql`ALTER SEQUENCE permissions_id_seq RESTART WITH 1`,
    Prisma.sql`ALTER SEQUENCE roles_id_seq RESTART WITH 1`,
    Prisma.sql`ALTER SEQUENCE users_id_seq RESTART WITH 1`,
  ];

  for (const query of resetQueries) {
    await prisma.$executeRaw(query);
  }
}

async function main() {

  await clearDatabase();
  await resetSequences();

  // Buat data permissions
  const permissions = [
    { name: 'create_user', guard_name: 'api' },
    { name: 'view_user', guard_name: 'api' },
    { name: 'edit_user', guard_name: 'api' },
    { name: 'delete_user', guard_name: 'api' },

    { name: 'create_role', guard_name: 'api' },
    { name: 'view_role', guard_name: 'api' },
    { name: 'edit_role', guard_name: 'api' },
    { name: 'delete_role', guard_name: 'api' },
  ]

  await prisma.permissions.createMany({
    data: permissions
  });

  // Buat data roles
  const roles = [
    { name: 'Superadmin', guard_name: 'api' },
    { name: 'Admin', guard_name: 'api' },
    { name: 'User', guard_name: 'api' },
  ]

  await prisma.roles.createMany({
    data: roles
  });

  // Buat data users
  const passwordHash = await bcrypt.hash('admin', 10)

  const users = [
    { name: 'Superadmin', email: 'superadmin@gmail.com', password: passwordHash },
    { name: 'Admin', email: 'admin@gmail.com', password: passwordHash },
    { name: 'User', email: 'user@gmail.com', password: passwordHash },
  ]

  await prisma.users.createMany({
    data: users
  });
  
  const superadminUserID = users.findIndex(user => user.name === 'Superadmin') + 1
  const adminUserID = users.findIndex(user => user.name === 'Admin') + 1
  const userUserID = users.findIndex(user => user.name === 'User') + 1
  
  const superadminRoleID = roles.findIndex(role => role.name === 'Superadmin') + 1
  const adminRoleID = roles.findIndex(role => role.name === 'Admin') + 1
  const userRoleID = roles.findIndex(role => role.name === 'User') + 1

  await prisma.role_has_permissions.createMany({
    data: permissions.map((_, index) => ({
      role_id: superadminRoleID,
      permission_id: index + 1,
    })),
  });

  await prisma.role_has_permissions.createMany({
    data: permissions.map((permission, index) => {
      if (['delete_role', 'delete_user'].includes(permission.name)) {
        return null;
      }
    
      return {
        role_id: roles.findIndex(role => role.name === 'Admin') + 1,
        permission_id: index + 1,
      };
    }).filter(Boolean)
  });

  await prisma.role_has_permissions.createMany({
    data: permissions.map((permission, index) => {
      if (!['view_user', 'view_role'].includes(permission.name)) {
        return null;
      }
    
      return {
        role_id: roles.findIndex(role => role.name === 'User') + 1,
        permission_id: index + 1,
      };
    }).filter(Boolean)
  });

  await prisma.model_has_roles.createMany({
    data: [
      { role_id: superadminRoleID, model_id: superadminUserID, model_type: 'App\\Models\\User' },
      { role_id: adminRoleID, model_id: adminUserID, model_type: 'App\\Models\\User' },
      { role_id: userRoleID, model_id: userUserID, model_type: 'App\\Models\\User' },
    ],
  });

  // Tampilkan pesan sukses
  console.log('Database seeding completed');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
