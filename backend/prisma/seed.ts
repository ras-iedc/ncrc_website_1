import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!email || !password) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set');
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('Admin already exists, skipping seed.');
    return;
  }

  // Create admin in Supabase Auth
  const { data: authData, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name: 'Admin' },
  });

  if (error) {
    throw new Error(`Supabase auth error: ${error.message}`);
  }

  await prisma.user.create({
    data: {
      name: 'Admin',
      email,
      supabaseId: authData.user.id,
      role: 'ADMIN',
      status: 'APPROVED',
      emailVerified: true,
      membershipId: `RC-${new Date().getFullYear()}-0001`,
    },
  });

  console.log(`Admin user created: ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
