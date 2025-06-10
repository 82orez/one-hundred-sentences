// hooks/useVoiceListenedStatus.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import { queryClient } from "@/app/providers";
import { useSession } from "next-auth/react";

export function useVoiceListenedStatus(voiceIds: string[]) {
  const { data: session } = useSession();

  // 음성 파일 청취 상태 조회
  const { data: listenedStatus, isLoading } = useQuery({
    queryKey: ["voiceListened", voiceIds],
    queryFn: async () => {
      if (!session?.user || voiceIds.length === 0) return {};

      // 여러 음성 파일의 청취 상태를 한 번에 가져오기
      const listenedMap: Record<string, boolean> = {};

      await Promise.all(
        voiceIds.map(async (voiceId) => {
          try {
            const response = await axios.get(`/api/voice/listened?voiceId=${voiceId}`);
            listenedMap[voiceId] = response.data.listened;
          } catch (error) {
            console.error(`음성 파일(${voiceId}) 청취 여부 확인 중 오류:`, error);
            listenedMap[voiceId] = false;
          }
        }),
      );

      return listenedMap;
    },
    enabled: !!session?.user && voiceIds.length > 0,
  });

  // 음성 파일 청취 상태 업데이트 뮤테이션
  const { mutate: markAsListened } = useMutation({
    mutationFn: async (voiceId: string) => {
      if (!session?.user) return;
      return axios.post("/api/voice/listened", { voiceId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["voiceListened"] });
    },
  });

  return {
    listenedStatus: listenedStatus || {},
    isLoading,
    markAsListened,
  };
}
