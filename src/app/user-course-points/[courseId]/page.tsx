"use client";

import { use, useState } from "react";
import axios from "axios";
import { ArrowUpDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

type UserPointsData = {
  id: string;
  userId: string;
  courseId: string;
  points: number;
  userName: string;
  userEmail: string;
  userImage: string | null;
  userClassNickName: string;
  centerName: string | null;
  localName: string | null;
};

type Props = {
  params: Promise<{ courseId: string }>;
};

export default function UserCoursePointsPage({ params }: Props) {
  const { courseId } = use(params);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const {
    data: userPoints,
    isLoading: userPointsIsLoading,
    error: userPointsError,
  } = useQuery({
    queryKey: ["user-course-points", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/user-course-points?courseId=${courseId}`);
      return response.data;
    },
    enabled: !!courseId, // courseId가 있을 때만 요청 수행
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const sortedUserPoints = (userPoints ?? []).sort((a, b) => (sortOrder === "desc" ? b.points - a.points : a.points - b.points));

  if (userPointsIsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="mt-2">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (userPointsError) {
    return (
      <div className="container mx-auto p-4">
        <div className="rounded-lg bg-red-100 p-4 text-red-700">
          <p>{userPointsError.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">강좌 포인트 랭킹</h1>

      <div className="overflow-x-auto rounded-lg border shadow">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b bg-green-100">
              <th className="p-3 text-left">순위</th>
              <th className="p-3 text-left">이름</th>
              <th className="p-3 text-left">닉네임</th>
              <th className="p-3 text-left">이메일</th>
              <th className="p-3 text-left">센터명</th>
              <th className="p-3 text-left">지역명</th>
              <th className="cursor-pointer p-3 text-left" onClick={toggleSortOrder}>
                <div className="flex items-center">
                  포인트
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedUserPoints.map((user, index) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{index + 1}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {user.userImage ? (
                      <div className="h-8 w-8 overflow-hidden rounded-full">
                        <Image
                          src={user.userImage}
                          alt={`${user.userName || "사용자"} 프로필`}
                          width={32}
                          height={32}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                        {user.userName?.charAt(0) || "?"}
                      </div>
                    )}
                    <span>{user.userName}</span>
                  </div>
                </td>
                <td className="p-3">{user.userClassNickName}</td>
                <td className="p-3">{user.userEmail}</td>
                <td className="p-3">{user.centerName || "-"}</td>
                <td className="p-3">{user.localName || "-"}</td>
                <td className="p-3 font-semibold">{user.points}</td>
              </tr>
            ))}
            {userPoints.length === 0 && (
              <tr>
                <td colSpan={7} className="p-3 text-center text-gray-500">
                  등록된 포인트 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className={clsx("mt-10 flex justify-center hover:underline", { "pointer-events-none": userPointsIsLoading })}>
        <Link href={`/users/teacher/teacher-courses`}>Back to Teacher's Dashboard</Link>
      </div>
    </div>
  );
}
