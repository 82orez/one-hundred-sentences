"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

  if (isLoading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center text-red-500">프로필 정보를 불러오는 중 오류가 발생했습니다.</p>;

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-xl font-bold">내 프로필</h1>

      <div className="rounded-lg border p-4 shadow-sm">
        <p className="mb-2 text-lg">
          <span className="font-semibold">이름:</span> {userInfo?.realName || "등록되지 않음"}
        </p>
        <p className="mb-2 text-lg">
          <span className="font-semibold">이메일:</span> {userInfo?.email}
        </p>
        <p className="mb-4 text-lg">
          <span className="font-semibold">전화번호:</span> {userInfo?.phone || "등록되지 않음"}
        </p>

        <Link href="/users/edit" className="block w-full rounded bg-blue-500 px-4 py-2 text-center text-white hover:bg-blue-600">
          프로필 수정
        </Link>
      </div>

      <div className="mt-6 flex justify-center">
        <Link href="/" className="text-gray-600 hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
};

export default ProfilePage;
