import { prisma } from '../config/db.js';

export async function generateMembershipId(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `RC-${year}-`;

  const lastUser = await prisma.user.findFirst({
    where: { membershipId: { startsWith: prefix } },
    orderBy: { membershipId: 'desc' },
    select: { membershipId: true },
  });

  let nextNum = 1;
  if (lastUser?.membershipId) {
    const lastNum = parseInt(lastUser.membershipId.split('-').pop()!, 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${String(nextNum).padStart(4, '0')}`;
}
