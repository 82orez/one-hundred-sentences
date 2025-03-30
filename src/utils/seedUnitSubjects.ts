// src/utils/seedUnitSubjects.ts

import { PrismaClient } from "@prisma/client";

export async function seedUnitSubjects() {
  const prisma = new PrismaClient();

  try {
    const travelPhrases = {
      1: "비행기에서 승무원과 대화하기",
      2: "환승 공항에서 시내로 나가는 방법 묻기",
      3: "공항 보안 검색대에서",
      4: "호텔로 가는 길에 택시 안에서",
      5: "마트에서",
      6: "커피숍에서 주문하기",
      7: "시내에서 길 묻기",
      8: "호텔 체크인",
      9: "호텔에서 물과 타올 요청하기",
      10: "호텔 조식 식당에서",
      11: "쇼핑몰에서 옷 사기",
      12: "아이스크림 가게에서",
      13: "기념품 추천 받기",
      14: "도서관에서 책 빌리기",
      15: "해변에서 사진 부탁하기",
      16: "박물관에서",
      17: "이탈리안 레스토랑에서 추천 받기",
      18: "산책 길에서 강아지 주인과 얘기하기",
      19: "버스에서 버스 카드 충전하기",
      20: "공항 셀프 체크인",
    };

    console.log("시작: unitSubject 데이터 입력");

    // 기존 데이터를 모두 삭제 (선택사항)
    await prisma.unitSubject.deleteMany({});

    // 새 데이터 입력
    for (const [key, value] of Object.entries(travelPhrases)) {
      await prisma.unitSubject.create({
        data: {
          unitNumber: parseInt(key),
          subjectKo: value,
        },
      });
    }

    console.log("완료: unitSubject 에 총 " + Object.keys(travelPhrases).length + "개의 항목이 추가되었습니다.");
  } catch (error) {
    console.error("오류 발생:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// 함수를 직접 실행하려면 아래 코드 사용
seedUnitSubjects().catch(console.error);
