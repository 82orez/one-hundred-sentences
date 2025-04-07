// src/hooks/useRecordingCounts.ts
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useSession } from "next-auth/react";

export function useRecordingCounts(options = {}) {
  const { data: session, status } = useSession();

  return useQuery({
    queryKey: ["recordingCounts", session?.user?.id],
    queryFn: async () => {
      if (!session?.user?.id) return {};

      const res = await axios.get(`/api/recorder/recording-counter?userId=${session.user.id}`);
      return res.data.reduce((acc: { [key: number]: number }, item: { sentenceNo: number; attemptCount: number }) => {
        acc[item.sentenceNo] = item.attemptCount;
        return acc;
      }, {});
    },
    enabled: status === "authenticated" && !!session?.user?.id,
    ...options,
  });
}
