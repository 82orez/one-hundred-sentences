import { PrismaClient } from "@prisma/client";

/**
 * Sentence 모델의 모든 레코드의 contents 필드를 'tour100'으로 업데이트하는 함수
 * @returns {Promise<number>} 업데이트된 레코드 수
 */
async function updateAllSentenceContentsToTour100(): Promise<number> {
  const prisma = new PrismaClient();

  try {
    // Sentence 모델의 모든 레코드의 contents 필드를 'tour100'으로 업데이트
    const updateResult = await prisma.sentence.updateMany({
      data: {
        contents: "tour100", // Contents enum 값
      },
    });

    console.log(`${updateResult.count}개의 Sentence 레코드가 업데이트되었습니다.`);
    return updateResult.count;
  } catch (error) {
    console.error("Sentence 업데이트 중 오류 발생:", error);
    throw error;
  } finally {
    // 데이터베이스 연결 종료
    await prisma.$disconnect();
  }
}

// 함수 실행 예시
updateAllSentenceContentsToTour100()
  .then((count) => console.log(`총 ${count}개의 레코드가 업데이트되었습니다.`))
  .catch((error) => console.error("오류:", error));
