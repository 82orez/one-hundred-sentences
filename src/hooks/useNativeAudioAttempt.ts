// src/hooks/useNativeAudioAttempt.ts
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { queryClient } from "@/app/providers";

/**
 * 원어민 음성 시청 기록을 관리하는 훅
 * @returns 원어민 음성 시청 기록을 저장하는 뮤테이션 객체
 */
export function useNativeAudioAttempt() {
  return useMutation({
    mutationFn: async (params: { sentenceNo: number; courseId: string }) => {
      const response = await axios.post("/api/native-audio/attempt", params);
      return response.data;
    },
    onSuccess: (data, variables) => {
      // 필요한 경우 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["nativeAudioAttempts", variables.sentenceNo] });
      queryClient.invalidateQueries({ queryKey: ["nativeAudioAttempts"] });
    },
  });
}
