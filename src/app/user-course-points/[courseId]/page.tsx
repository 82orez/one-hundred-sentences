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

// 포인트 상세 정보 타입 정의
type PointsDetail = {
  videoPoints: number;
  videoSeconds: number;
  audioPoints: number;
  audioAttempts: number;
  recordingPoints: number;
  recordingAttempts: number;
  quizAttemptPoints: number;
  quizAttempts: number;
  quizCorrectPoints: number;
  quizCorrect: number;
  attendancePoints: number;
  attendanceCount: number;
  voiceLikePoints: number;
  voiceLikesReceived: number;
  userVoiceLikePoints: number;
  userVoiceLikesGiven: number;
};

type PointsRate = {
  videoPointsRate: number;
  audioPointsRate: number;
  recordingPointsRate: number;
  quizPointsRate: number;
  attendancePointsRate: number;
  voiceLikePointsRate: number;
};

type PointsDetailResponse = {
  studentInfo: {
    name: string;
    email: string;
    classNickName: string;
  };
  pointsDetail: PointsDetail;
  totalPoints: number;
  pointsRate: PointsRate;
};

// 팀 포인트 응답 타입 정의
type TeamPointsResponse = {
  totalPoints: number;
  studentCount: number;
};

type Props = {
  params: Promise<{ courseId: string }>;
};

export default function UserCoursePointsPage({ params }: Props) {
  const { courseId } = use(params);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // 상세 포인트 관련 상태 추가
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [selectedUserName, setSelectedUserName] = useState<string | null>(null);

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

  // 팀 전체 포인트 정보를 가져오는 쿼리 추가
  const {
    data: teamPoints,
    isLoading: teamPointsIsLoading,
    error: teamPointsError,
  } = useQuery({
    queryKey: ["team-course-points", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/course-points/team?courseId=${courseId}`);
      return response.data as TeamPointsResponse;
    },
    enabled: !!courseId, // courseId가 있을 때만 요청 수행
  });

  // 포인트 상세 정보를 가져오는 쿼리 추가
  const {
    data: pointsDetail,
    isLoading: pointsDetailIsLoading,
    error: pointsDetailError,
    refetch: refetchPointsDetail,
  } = useQuery({
    queryKey: ["points-detail", courseId, selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;
      const response = await axios.get(`/api/user-course-points/points-detail?courseId=${courseId}&studentId=${selectedUserId}`);
      return response.data;
    },
    enabled: !!courseId && !!selectedUserId, // courseId와 selectedUserId가 있을 때만 요청 수행
  });

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const sortedUserPoints = (userPoints ?? []).sort((a, b) => (sortOrder === "desc" ? b.points - a.points : a.points - b.points));

  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openMessageModal = (message: string) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
  };

  const closeMessageModal = () => {
    setIsModalOpen(false);
    setSelectedMessage(null);
  };

  // 포인트 상세 모달 열기
  const openPointsDetailModal = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
    setIsPointsModalOpen(true);
  };

  // 포인트 상세 모달 닫기
  const closePointsDetailModal = () => {
    setIsPointsModalOpen(false);
    setSelectedUserId(null);
    setSelectedUserName(null);
  };

  if (userPointsIsLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center justify-center gap-4 text-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="">데이터를 불러오는 중...</p>
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
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="mb-4 text-2xl font-bold">수강생 List 및 포인트 랭킹</h1>

      <div className="overflow-x-auto rounded-lg border shadow">
        <table className="w-full table-auto">
          <thead>
            <tr className="border-b bg-green-100">
              <th className="p-3 text-center align-middle">순위</th>
              <th className="p-3 text-center align-middle">닉네임 (실명)</th>
              {/*<th className="p-3 text-center align-middle">닉네임</th>*/}
              <th className="p-3 text-center align-middle">자기 소개</th>
              <th className="p-3 text-center align-middle">센터명</th>
              <th className="p-3 text-center align-middle">지역명</th>
              <th className="cursor-pointer p-3 text-center align-middle" onClick={toggleSortOrder}>
                <div className="flex items-center justify-center gap-1">
                  <div>포인트</div>
                  <ArrowUpDown className="ml-1 h-4 w-4" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody>
            {sortedUserPoints.map((user, index) => (
              <tr key={user.id} className="border-b border-gray-300 hover:bg-gray-50">
                <td className="p-3 text-center align-middle">{index + 1}</td>
                <td className="p-3 text-center align-middle">
                  <div className="flex items-center justify-start gap-3">
                    {user.userImage && user.userIsImagePublicOpen ? (
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
                    {user.userClassNickName ? (
                      <div className={"flex items-center gap-1"}>
                        <span>{user.userClassNickName}</span>
                        <span>({user.userName})</span>
                      </div>
                    ) : (
                      <span>{user.userName}</span>
                    )}
                  </div>
                </td>
                {/*<td className="p-3 text-center align-middle">{user.userClassNickName || "-"}</td>*/}
                <td className="p-3 text-center align-middle">
                  {user.userMessage ? (
                    <button
                      onClick={() => openMessageModal(user.userMessage!)}
                      className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
                      보기
                    </button>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="p-3 text-center align-middle">{user.centerName || "-"}</td>
                <td className="p-3 text-center align-middle">{user.localName || "-"}</td>
                <td
                  className="cursor-pointer p-3 text-center align-middle font-semibold hover:text-blue-600 hover:underline"
                  onClick={() => openPointsDetailModal(user.userId, user.userName || user.userClassNickName)}>
                  {user.points}
                </td>
              </tr>
            ))}
            {userPoints.length === 0 && (
              <tr>
                <td colSpan={7} className="p-3 text-center align-middle text-gray-500">
                  등록된 포인트 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
          {/* 팀 전체 포인트 표시 */}
          <tfoot>
            <tr className="border-t-2 border-green-200 bg-green-50 font-bold">
              <td colSpan={5} className="p-3 text-right align-middle">
                팀 전체 포인트 (수강생 {teamPointsIsLoading ? "-" : teamPoints?.studentCount || 0}명):
              </td>
              <td className="p-3 text-center align-middle">
                {teamPointsIsLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="border-primary h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  </div>
                ) : teamPointsError ? (
                  <span className="text-red-500">오류 발생</span>
                ) : (
                  <span className="text-xl font-bold text-green-700">{teamPoints?.totalPoints.toLocaleString() || 0}</span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className={clsx("mt-10 flex justify-center", { "pointer-events-none": userPointsIsLoading })}>
        <Link href={`/users/teacher/teacher-courses`} className={"hover:underline"}>
          내 강좌 보기
        </Link>
      </div>

      {/* 자기 소개 모달 */}
      {isModalOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-11/12 max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">자기 소개</h2>
            <p className="mb-6 whitespace-pre-wrap text-gray-800">{selectedMessage}</p>
            <div className="text-right">
              <button onClick={closeMessageModal} className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 포인트 상세 정보 모달 */}
      {isPointsModalOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-11/12 max-w-3xl rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-semibold">{selectedUserName}님의 포인트 상세 내역</h2>

            {pointsDetailIsLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
                <p className="ml-2">포인트 상세 정보를 불러오는 중...</p>
              </div>
            ) : pointsDetailError ? (
              <div className="rounded-lg bg-red-100 p-4 text-red-700">
                <p>포인트 상세 정보를 불러오는 중 오류가 발생했습니다.</p>
              </div>
            ) : pointsDetail ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-medium">영상 시청</h3>
                    <p>포인트: {pointsDetail.pointsDetail.videoPoints}점</p>
                    <p>
                      시청 시간: {Math.round(pointsDetail.pointsDetail.videoSeconds / 60)}분 {pointsDetail.pointsDetail.videoSeconds % 60}초
                    </p>
                    <p className="mt-1 text-sm text-gray-500">전체 포인트의 {pointsDetail.pointsRate.videoPointsRate}%</p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-medium">원어민 음성 듣기</h3>
                    <p>포인트: {pointsDetail.pointsDetail.audioPoints}점</p>
                    <p>듣기 횟수: {pointsDetail.pointsDetail.audioAttempts}회</p>
                    <p className="mt-1 text-sm text-gray-500">전체 포인트의 {pointsDetail.pointsRate.audioPointsRate}%</p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-medium">녹음 제출</h3>
                    <p>포인트: {pointsDetail.pointsDetail.recordingPoints}점</p>
                    <p>녹음 횟수: {pointsDetail.pointsDetail.recordingAttempts}회</p>
                    <p className="mt-1 text-sm text-gray-500">전체 포인트의 {pointsDetail.pointsRate.recordingPointsRate}%</p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-medium">퀴즈</h3>
                    <p>
                      시도 포인트: {pointsDetail.pointsDetail.quizAttemptPoints}점 (시도 {pointsDetail.pointsDetail.quizAttempts}회)
                    </p>
                    <p>
                      정답 포인트: {pointsDetail.pointsDetail.quizCorrectPoints}점 (정답 {pointsDetail.pointsDetail.quizCorrect}개)
                    </p>
                    <p className="mt-1 text-sm text-gray-500">전체 포인트의 {pointsDetail.pointsRate.quizPointsRate}%</p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-medium">출석</h3>
                    <p>포인트: {pointsDetail.pointsDetail.attendancePoints}점</p>
                    <p>출석 횟수: {pointsDetail.pointsDetail.attendanceCount}회</p>
                    <p className="mt-1 text-sm text-gray-500">전체 포인트의 {pointsDetail.pointsRate.attendancePointsRate}%</p>
                  </div>

                  <div className="rounded-lg bg-gray-50 p-4">
                    <h3 className="mb-2 font-medium">음성 좋아요</h3>
                    <p>
                      내 발음 공개 포인트: {pointsDetail.pointsDetail.myVoiceOpenPoints}점 (받은 좋아요 {pointsDetail.pointsDetail.myVoiceOpenCount}
                      개)
                    </p>
                    <p>
                      받은 좋아요 포인트: {pointsDetail.pointsDetail.voiceLikePoints}점 (받은 좋아요 {pointsDetail.pointsDetail.voiceLikesReceived}개)
                    </p>
                    <p>
                      준 좋아요 포인트: {pointsDetail.pointsDetail.userVoiceLikePoints}점 (준 좋아요 {pointsDetail.pointsDetail.userVoiceLikesGiven}
                      개)
                    </p>
                    <p className="mt-1 text-sm text-gray-500">전체 포인트의 {pointsDetail.pointsRate.voiceLikePointsRate}%</p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg bg-green-50 p-4 text-center">
                  <p className="text-lg font-bold">총 포인트: {pointsDetail.totalPoints}점</p>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500">포인트 상세 정보가 없습니다.</p>
            )}

            <div className="mt-6 text-right">
              <button onClick={closePointsDetailModal} className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
