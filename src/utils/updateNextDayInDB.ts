import axios from "axios";

// ✅ DB 의 nextDay 정보 업데이트
export const updateNextDayInDB = async (day, totalCompleted, courseId) => {
  try {
    // DB 업데이트
    await axios.post("/api/nextday", {
      courseId,
      nextDay: day,
      totalCompleted,
    });

    // 로컬 상태 업데이트
  } catch (error) {
    console.error("nextDay DB 업데이트 중 오류:", error);
  }
};
