// components/CoursePointsRankingModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import axios from "axios";
import { X, User } from "lucide-react";
import Image from "next/image";

interface UserPoints {
  userId: string;
  displayName: string;
  profileImage: string | null;
  points: number;
  isCurrentUser: boolean;
}

interface CoursePointsRankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export default function CoursePointsRankingModal({ isOpen, onClose, courseId, courseTitle }: CoursePointsRankingModalProps) {
  const { data: session } = useSession();

  // 강좌 포인트 랭킹 조회 쿼리
  const { data, isLoading } = useQuery({
    queryKey: ["coursePointsRanking", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/course-points/each-student-rank?courseId=${courseId}`);

      // 사용자 정보와 포인트를 함께 가공
      const pointsWithUserInfo = response.data.map((item: any) => ({
        userId: item.userId,
        displayName: item.user?.classNickName || item.user?.realName || "알 수 없음",
        profileImage: item.user?.customImageUrl || item.user?.image || "/images/anon-user-1.jpg",
        points: item.points,
        isCurrentUser: item.userId === session?.user?.id,
      }));

      // 포인트 기준으로 내림차순 정렬
      return pointsWithUserInfo.sort((a: UserPoints, b: UserPoints) => b.points - a.points);
    },
    enabled: isOpen, // 모달이 열려있을 때만 쿼리 실행
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            우리 강좌 기여도 랭킹 <span className="text-gray-500">(총 {data?.length || 0}명)</span>
          </h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <h3 className="font-medium text-gray-700 md:mb-4">강좌명: {courseTitle}</h3>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"></div>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto">
            <div className="hidden rounded-lg border border-gray-200 bg-gray-50 p-4 md:block">
              <div className="grid grid-cols-12 gap-2 font-semibold text-gray-700">
                <div className="col-span-1 text-center">순위</div>
                <div className="col-span-2 text-center">프로필</div>
                <div className="col-span-6">이름</div>
                <div className="col-span-3 text-right">포인트</div>
              </div>
            </div>

            {data?.map((user: UserPoints, index: number) => (
              <div
                key={user.userId}
                className={`mt-2 rounded-lg border p-4 transition hover:shadow-md ${
                  user.isCurrentUser ? "border-indigo-300 bg-indigo-50" : "border-gray-200"
                }`}>
                <div className="grid grid-cols-12 items-center gap-2">
                  <div className="col-span-1 text-center text-lg font-bold text-indigo-600">{index + 1}</div>
                  <div className="col-span-2 flex justify-center">
                    <div className="col-span-2 flex justify-center">
                      <div className="h-10 w-10 overflow-hidden rounded-full bg-gray-200">
                        {user.profileImage ? (
                          <img
                            src={user.profileImage}
                            alt={user.displayName}
                            width={40}
                            height={40}
                            className={`h-full w-full object-cover ${!user.isCurrentUser ? "blur-sm" : ""}`}
                          />
                        ) : (
                          <User className="h-10 w-10 p-2 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`col-span-6 font-medium ${!user.isCurrentUser ? "blur-sm" : ""}`}>{user.displayName}</div>
                  <div className="col-span-3 text-right font-bold text-indigo-700">{user.points.toLocaleString()} </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
