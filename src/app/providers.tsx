"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AnnouncementModal from "@/components/AnnouncementModal";

interface Props {
  children?: React.ReactNode;
}

// 다른 컴포넌트에서도 사용할 수 있게 export 해준다.
export const queryClient = new QueryClient();

export const NextLayout = ({ children }: Props) => {
  const router = useRouter();
  const { status } = useSession();

  // ✅ 로그인된 사용자는 learn 페이지로 이동
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/learn");
    }
  }, [status, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <AnnouncementModal />
      <Navbar />
      {children}
    </QueryClientProvider>
  );
};
