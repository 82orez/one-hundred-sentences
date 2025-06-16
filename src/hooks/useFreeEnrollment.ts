// src/hooks/useFreeEnrollment.ts
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface EnrollCourseInput {
  courseId: string;
  courseTitle: string;
}

export function useFreeEnrollment() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: EnrollCourseInput) => {
      const response = await axios.post("/api/payment/free-enrollment", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("수강 신청이 완료되었습니다.");
      router.push("/users/my-courses");
    },
    onError: (error: any) => {
      if (error.response?.data?.message === "수강 신청 내역 확인을 위해 반드시 먼저 회원 정보에서 실제 이름과 전화번호를 입력해 주세요.") {
        // 사용자 정보 미등록 에러 처리
        if (confirm(error.response.data.message + "\n회원 정보 수정 페이지로 이동하시겠습니까?")) {
          router.push("/users/edit");
        }
      } else {
        toast.error(error.response?.data?.error || "수강 신청 중 오류가 발생했습니다.");
      }
    },
  });
}
