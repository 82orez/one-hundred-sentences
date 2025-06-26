// 문장 번호를 변환하는 함수 추가
export const getDisplaySentenceNumber = (originalNo: number): number => {
  if (originalNo <= 100) {
    return originalNo; // 1~100번은 그대로 표시
  } else if (originalNo <= 200) {
    return originalNo - 100; // 101~200번은 -100
  } else if (originalNo <= 300) {
    return originalNo - 200; // 201~300번은 -200
  }
  return originalNo; // 그 외의 경우는 원래 번호 반환
};
