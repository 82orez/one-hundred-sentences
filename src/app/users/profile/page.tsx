"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Mail, User, Edit, Home } from "lucide-react";
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
      {/* daisyUI 카드 적용 */}
      <div className="card mt-12 w-full max-w-md rounded-3xl border border-gray-300/50 bg-white/80 p-8 shadow-xl backdrop-blur-lg">
        <div className="card-body items-center justify-center text-center">
          <div className={"flex items-center justify-center"}>
            <h2 className="card-title text-3xl font-bold text-gray-800">My Profile</h2>
          </div>

          {/* 프로필 이미지 */}
          <div className="avatar mt-8">
            <div className="h-24 w-24 rounded-full shadow-md ring-2 ring-blue-300 md:h-32 md:w-32">
              <img src={session?.user?.image || "/images/anon-user.png"} alt="Profile Image" />
            </div>
          </div>

          <h3 className="mt-4 text-xl font-semibold text-gray-800">{userInfo?.realName || "등록되지 않음"}</h3>

          <div className="mt-8 w-full space-y-6 text-gray-700">
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
              <Link href="/users/edit" className="btn btn-primary h-10 w-full max-w-sm rounded-lg text-lg shadow-md md:w-40">
                <Edit size={20} />
                회원 정보 수정
              </Link>

              <Link href="/" className="btn btn-outline btn-neutral h-10 w-full max-w-sm rounded-lg text-lg shadow-md md:w-40">
                <Home size={20} />
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
