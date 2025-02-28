import { prisma } from "@/lib/prisma";
import { sentences } from "@/lib/sentences";

async function main() {
  console.log("Seeding data...");

  await prisma.sentence.createMany({
    data: sentences,
    skipDuplicates: true, // 중복 데이터가 있을 경우 스킵
  });

  console.log("Seeding completed!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
