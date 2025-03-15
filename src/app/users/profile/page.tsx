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
import { MdOutlinePhoneAndroid } from "react-icons/md";

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // user 정보 불러오기
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
    enabled: !!session?.user?.id, // 여기서 조건부 실행 제어
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
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center text-red-500">
        <p>프로필 정보를 불러오는 중 오류가 발생했습니다.</p>
        <Button asChild className="mt-4">
          <Link href="/users/sign-in">다시 시도하기</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-blue-50 to-blue-200 p-4 md:p-6">
      <Card className="mt-12 w-full max-w-md rounded-3xl border border-gray-300/50 bg-white/80 shadow-xl backdrop-blur-lg">
        <CardTitle className="mx-auto mt-4 text-3xl font-bold text-gray-800">My Profile</CardTitle>
        <CardHeader className="flex flex-col items-center">
          {/* ✅ 프로필 이미지 */}
          <Avatar className="h-24 w-24 shadow-md ring-2 ring-blue-300 md:h-32 md:w-32">
            <AvatarImage src={session?.user?.image || "/default-avatar.png"} alt="Profile Image" />
            <AvatarFallback>{userInfo?.realName?.charAt(0) || "U"}</AvatarFallback>
          </Avatar>
          <CardTitle className="mt-4 text-xl font-semibold text-gray-800">{userInfo?.realName || "등록되지 않음"}</CardTitle>
        </CardHeader>

        <CardContent className="mt-2 space-y-6 text-gray-700">
          <div className="flex items-center gap-4 px-2">
            <User size={22} className="text-gray-500" />
            <span className="text-lg">{userInfo?.realName || "등록되지 않음"}</span>
          </div>
          <div className="flex items-center gap-4 px-2">
            <Mail size={22} className="text-gray-500" />
            <span className="text-lg">{session?.user?.email || "등록되지 않음"}</span>
          </div>
          <div className="flex items-center gap-4 px-2">
            <MdOutlinePhoneAndroid size={22} className="text-gray-500" />
            <span className="text-lg">{userInfo?.phone || "등록되지 않음"}</span>
          </div>

          <div className="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
            <Button
              asChild
              className="h-10 w-full max-w-sm rounded-lg px-5 py-3 text-lg font-semibold text-white shadow-md hover:bg-gray-600 md:w-40">
              <Link href="/users/edit">
                <Edit size={20} />
                회원 정보 수정
              </Link>
            </Button>

            <Button
              variant="outline"
              asChild
              className="h-10 w-full max-w-sm rounded-lg bg-gray-200 px-5 py-3 text-lg font-semibold text-gray-800 shadow-md hover:bg-gray-300 md:w-40">
              <Link href="/">
                <Home size={20} />
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
