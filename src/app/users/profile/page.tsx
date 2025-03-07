"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, User, Edit, Home } from "lucide-react";

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ 로그인되지 않은 경우 로그인 페이지로 리디렉트
  if (status === "unauthenticated") {
    router.replace("/users/sign-in");
    return null;
  }

  // ✅ 사용자 정보 불러오기
  const {
    data: userInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfile", session?.user?.id],
    queryFn: async () => {
      const res = await axios.get("/api/user/profile");
      return res.data;
    },
    enabled: !!session?.user?.id, // 세션이 있는 경우만 실행
  });

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <Skeleton className="h-40 w-80 rounded-lg" />
        <Skeleton className="mt-4 h-10 w-40 rounded-md" />
      </div>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">프로필 정보를 불러오는 중 오류가 발생했습니다.</p>;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-300 p-6">
      <Card className="w-full max-w-lg rounded-2xl bg-white/90 shadow-lg backdrop-blur-md">
        <CardHeader className="flex flex-col items-center">
          {/* ✅ 프로필 이미지 */}
          <Avatar className="h-20 w-20 border shadow-md">
            <AvatarImage src={session.user.image || "/default-avatar.png"} alt="Profile Image" />
            <AvatarFallback>{userInfo?.realName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-3 text-2xl font-semibold">{userInfo?.realName || "등록되지 않음"}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-gray-700">
          <div className="flex items-center gap-3">
            <User size={20} className="text-gray-500" />
            <span className="text-lg">{userInfo?.realName || "등록되지 않음"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={20} className="text-gray-500" />
            <span className="text-lg">{session.user.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={20} className="text-gray-500" />
            <span className="text-lg">{userInfo?.phone || "등록되지 않음"}</span>
          </div>

          <div className="mt-6 flex justify-between">
            <Button asChild className="gap-2">
              <Link href="/users/edit">
                <Edit size={18} />
                프로필 수정
              </Link>
            </Button>

            <Button variant="outline" asChild className="gap-2">
              <Link href="/">
                <Home size={18} />
                홈으로
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
