// 페이지 로드 시 Selected 데이터 초기화
import axios from "axios";

export const resetSelectedData = async () => {
  try {
    await axios.post("/api/admin/selected/reset");
  } catch (error) {
    console.error("Selected 데이터 초기화 오류:", error);
  }
};
