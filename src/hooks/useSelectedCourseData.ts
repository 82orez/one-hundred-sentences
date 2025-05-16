// src/hooks/useSelectedData.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

interface SelectedData {
  selectedCourseId: string;
  selectedCourseContents: string;
  selectedCourseTitle: string;
}

export const useSelectedCourseData = () => {
  const { data: session, status } = useSession();

  const { data: selectedCourseData, isLoading: isLoadingSelectedCourseData } = useQuery({
    queryKey: ["selected", session?.user?.id],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/selected?userId=${session?.user?.id}`);
      return response.data;
    },
    enabled: status === "authenticated" && !!session?.user?.id,
  });

  // 필요한 변수 추출하기
  const selectedCourseId = selectedCourseData?.selectedCourseId || "";
  const selectedCourseContents = selectedCourseData?.selectedCourseContents || "";
  const selectedCourseTitle = selectedCourseData?.selectedCourseTitle || "";

  return {
    selectedCourseData,
    isLoadingSelectedCourseData,
    selectedCourseId,
    selectedCourseContents,
    selectedCourseTitle,
  };
};
