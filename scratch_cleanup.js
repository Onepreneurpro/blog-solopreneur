const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const deleted = await prisma.productCategory.deleteMany({
    where: { slug: 'ressources' }
  });
  console.log(`Deleted ${deleted.count} category entries with slug 'ressources'.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
