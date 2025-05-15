import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";

const useSaveSelectedCourse = () => {
  return useMutation({
    mutationFn: async ({
      selectedCourseId,
      selectedCourseContents,
      selectedCourseTitle,
    }: {
      selectedCourseId: string;
      selectedCourseContents: any; // 타입 명확히 알면 지정
      selectedCourseTitle: string;
    }) => {
      await axios.post("/api/admin/selected", {
        selectedCourseId,
        selectedCourseContents,
        selectedCourseTitle,
      });
    },
    onError: (error) => {
      toast.error("코스 정보 저장에 실패했습니다");
      console.error("코스 정보 저장 오류:", error);
    },
  });
};
