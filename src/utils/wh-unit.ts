import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function createUnitSubjects() {
  const wordList = [
    { contents: "wh100", unitNumber: 1, subjectKo: "사과" },
    { contents: "wh100", unitNumber: 2, subjectKo: "학교" },
    { contents: "wh100", unitNumber: 3, subjectKo: "바다" },
    { contents: "wh100", unitNumber: 4, subjectKo: "친구" },
    { contents: "wh100", unitNumber: 5, subjectKo: "자동차" },
    { contents: "wh100", unitNumber: 6, subjectKo: "의자" },
    { contents: "wh100", unitNumber: 7, subjectKo: "강아지" },
    { contents: "wh100", unitNumber: 8, subjectKo: "하늘" },
    { contents: "wh100", unitNumber: 9, subjectKo: "비행기" },
    { contents: "wh100", unitNumber: 10, subjectKo: "노트북" },
    { contents: "wh100", unitNumber: 11, subjectKo: "책상" },
    { contents: "wh100", unitNumber: 12, subjectKo: "커피" },
    { contents: "wh100", unitNumber: 13, subjectKo: "음악" },
    { contents: "wh100", unitNumber: 14, subjectKo: "산책" },
    { contents: "wh100", unitNumber: 15, subjectKo: "휴대폰" },
    { contents: "wh100", unitNumber: 16, subjectKo: "저녁" },
    { contents: "wh100", unitNumber: 17, subjectKo: "강" },
    { contents: "wh100", unitNumber: 18, subjectKo: "그림" },
    { contents: "wh100", unitNumber: 19, subjectKo: "공원" },
    { contents: "wh100", unitNumber: 20, subjectKo: "영화" },
  ];

  try {
    // 데이터 일괄 생성
    const createdSubjects = await prisma.unitSubject.createMany({
      data: wordList.map((word) => ({
        contents: word.contents as "wh100", // contents는 enum 타입이므로 타입 지정
        unitNumber: word.unitNumber,
        subjectKo: word.subjectKo,
      })),
      skipDuplicates: true, // 중복된 데이터는 건너뛰기
    });

    console.log("성공적으로 생성된 데이터:", createdSubjects.count);
    return createdSubjects;
  } catch (error) {
    console.error("데이터 생성 중 오류 발생:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 함수 실행
createUnitSubjects()
  .then(() => console.log("데이터 입력이 완료되었습니다."))
  .catch((error) => console.error("오류 발생:", error));
