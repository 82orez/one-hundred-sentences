// prisma/seed.ts 또는 scripts/seed-unit-subjects.ts 파일에 작성할 수 있습니다.
import { PrismaClient, Contents } from "@prisma/client";

export async function seedUnitSubjects() {
  const prisma = new PrismaClient();

  try {
    console.log("UnitSubject 데이터 입력을 시작합니다...");

    const unitSubjects = [
      { contents: "tour100", unitNumber: 1, subjectKo: "비행기에서 승무원과 대화하기" },
      { contents: "tour100", unitNumber: 2, subjectKo: "환승 공항에서 시내로 나가는 방법 묻기" },
      { contents: "tour100", unitNumber: 3, subjectKo: "공항 보안 검색대에서" },
      { contents: "tour100", unitNumber: 4, subjectKo: "공항에서 호텔로 가는 택시 안에서" },
      { contents: "tour100", unitNumber: 5, subjectKo: "마트에서" },
      { contents: "tour100", unitNumber: 6, subjectKo: "커피숍에서 주문하기" },
      { contents: "tour100", unitNumber: 7, subjectKo: "시내에서 길 묻기" },
      { contents: "tour100", unitNumber: 8, subjectKo: "호텔 체크인" },
      { contents: "tour100", unitNumber: 9, subjectKo: "호텔에서 물과 타올 요청하기" },
      { contents: "tour100", unitNumber: 10, subjectKo: "호텔 조식 식당에서" },
      { contents: "tour100", unitNumber: 11, subjectKo: "쇼핑몰에서 옷 사기" },
      { contents: "tour100", unitNumber: 12, subjectKo: "아이스크림 가게에서" },
      { contents: "tour100", unitNumber: 13, subjectKo: "기념품 추천받기" },
      { contents: "tour100", unitNumber: 14, subjectKo: "도서관에서 책 빌리기" },
      { contents: "tour100", unitNumber: 15, subjectKo: "해변에서 사진 부탁하기" },
      { contents: "tour100", unitNumber: 16, subjectKo: "박물관에서" },
      { contents: "tour100", unitNumber: 17, subjectKo: "이탈리안 레스토랑에서 추천받기" },
      { contents: "tour100", unitNumber: 18, subjectKo: "산책길에서 강아지 주인과 얘기하기" },
      { contents: "tour100", unitNumber: 19, subjectKo: "버스에서 버스 카드 충전하기" },
      { contents: "tour100", unitNumber: 20, subjectKo: "공항 셀프 체크인" },
    ];

    // 모든 데이터 입력을 병렬로 처리
    const createPromises = unitSubjects.map(async (subject) => {
      const existingSubject = await prisma.unitSubject.findFirst({
        where: {
          contents: subject.contents as any,
          unitNumber: subject.unitNumber,
        },
      });

      if (!existingSubject) {
        return prisma.unitSubject.create({
          data: subject as any,
        });
      } else {
        console.log(`이미 존재하는 단원입니다: contents=${subject.contents}, unitNumber=${subject.unitNumber}`);
        return null;
      }
    });

    await Promise.all(createPromises);
    console.log("UnitSubject 데이터 입력이 완료되었습니다!");
  } catch (error) {
    console.error("UnitSubject 데이터 입력 중 오류가 발생했습니다:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  await seedUnitSubjects();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    console.log("시드 작업이 완료되었습니다.");
  });
