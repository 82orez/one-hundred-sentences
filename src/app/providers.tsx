"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import AnnouncementModalForOneDay from "@/components/Announcement/oneday/AnnouncementModalForOneDay";
import AnnouncementModal from "@/components/Announcement/AnnouncementModal";
import DevelopingNotion from "@/components/Announcement/oneday/DevelopingNotion";

interface Props {
  children?: React.ReactNode;
}

// 다른 컴포넌트에서도 사용할 수 있게 export 해준다.
export const queryClient = new QueryClient();

export const NextLayout = ({ children }: Props) => {
  const router = useRouter();
  const { status, data: session } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      console.log("data: ", session);
      if (session?.user.role === "student") {
        // student 인 경우 realName 과 phone 값 확인
        const userRealName = session?.user.realName;
        const userPhone = session?.user.phone;

        // realName 또는 phone 값이 없는 경우 /users/edit 로 리다이렉트
        if (!userRealName || !userPhone) {
          router.replace("/users/edit");
        }
      }
    }
  }, [status, router, session]);

  return (
    <QueryClientProvider client={queryClient}>
      {/*<DevelopingNotion />*/}
      {/*<AnnouncementModalForOneDay />*/}
      {/*<AnnouncementModal />*/}
      <Navbar />
      {children}
    </QueryClientProvider>
  );
};
