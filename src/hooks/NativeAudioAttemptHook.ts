// src/hooks/useNativeAudioAttempt.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryClient } from "@/app/providers";
import axios from "axios";

interface NativeAudioAttemptParams {
  sentenceNo: number;
}

export const useNativeAudioAttempt = () => {
  const recordNativeAudioAttempt = async (params: NativeAudioAttemptParams) => {
    const response = await axios.post("/api/native-audio/attempt", params);
    return response.data;
  };

  return useMutation({
    mutationFn: recordNativeAudioAttempt,
    onSuccess: (data, variables) => {
      // 필요한 경우 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["nativeAudioAttempts", variables.sentenceNo] });
      queryClient.invalidateQueries({ queryKey: ["nativeAudioAttempts"] });
    },
  });
};
