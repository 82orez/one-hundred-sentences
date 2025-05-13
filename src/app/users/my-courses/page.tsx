"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import { format } from "date-fns";
import { Play, Clock, CheckCircle } from "lucide-react";
import { queryClient } from "@/app/providers";
import { useState } from "react";
import CourseSchedule from "@/components/CourseSchedule";

export default function MyCoursesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // 내 강의 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-courses"],
    queryFn: async () => {
      const response = await axios.get("/api/user/my-courses");
      console.log(response.data);
      return response.data;
    },
  });

  // 수강 시작 mutation
  const startCourseMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const response = await axios.post("/api/user/my-courses", { enrollmentId });
      return response.data;
    },
    onSuccess: () => {
      toast.success("수강이 시작되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "수강 시작에 실패했습니다.");
    },
  });

  const handleStartCourse = (enrollmentId: string) => {
    startCourseMutation.mutate(enrollmentId);
  };

  const formatScheduleDays = (data) => {
    const days = [];
    if (data.scheduleMonday) days.push("월");
    if (data.scheduleTuesday) days.push("화");
    if (data.scheduleWednesday) days.push("수");
    if (data.scheduleThursday) days.push("목");
    if (data.scheduleFriday) days.push("금");
    if (data.scheduleSaturday) days.push("토");
    if (data.scheduleSunday) days.push("일");

    return days.join(" / ");
  };

  const openScheduleModal = (courseId: string) => {
    setSelectedCourseId(courseId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (isLoading) return <LoadingPageSkeleton />;

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <h1 className="mb-8 text-2xl font-bold">내 강의 보기</h1>
        <div className="rounded-lg bg-red-50 p-4 text-red-700">오류가 발생했습니다. 잠시 후 다시 시도해주세요.</div>
      </div>
    );
  }

  const { pendingCourses = [], activeCourses = [] } = data || {};

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">내 강의 보기</h1>

      {pendingCourses.length === 0 && activeCourses.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">수강 중인 강의가 없습니다.</div>
      ) : (
        <>
          {pendingCourses.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-xl font-semibold">신청된 강의</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {pendingCourses.map((enrollment: any) => (
                  <div key={enrollment.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium">{enrollment.course.title}</h3>
                      <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                        <Clock className="mr-1 inline-block h-3 w-3" />
                        대기중
                      </span>
                    </div>
                    <p className="mb-4 text-sm text-gray-600">강사: {enrollment.course.teacher.user.realName}</p>
                    <p className="mb-4 text-sm text-gray-600">
                      <span className="font-medium">수업일:</span> {formatScheduleDays(enrollment.course)}
                    </p>
                    <p className="mb-4 text-xs text-gray-500">시작일: {format(new Date(enrollment.course.startDate), "yyyy년 MM월 dd일")}</p>
                    <button
                      onClick={() => handleStartCourse(enrollment.id)}
                      className="flex w-full items-center justify-center rounded-lg bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
                      disabled={startCourseMutation.isPending}>
                      <Play className="mr-1 h-4 w-4" />
                      {startCourseMutation.isPending ? "처리 중..." : "수강 시작"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeCourses.length > 0 && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">수강 중인 강의</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeCourses.map((enrollment: any) => (
                  <div key={enrollment.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-medium">{enrollment.course.title}</h3>
                      <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                        <CheckCircle className="mr-1 inline-block h-3 w-3" />
                        수강중
                      </span>
                    </div>
                    <p className="mb-2 text-sm text-gray-600">강사: {enrollment.course.teacher.user.realName}</p>
                    <p className="mb-2 text-sm text-gray-600">이메일: {enrollment.course.teacher.user.email}</p>
                    <p className="mb-2 text-sm text-gray-600">전화번호: {enrollment.course.teacher.user.phone}</p>
                    <p className="mb-4 text-sm text-gray-600">
                      <span className="font-medium">수업일:</span> {formatScheduleDays(enrollment.course)}
                    </p>
                    <p className="mb-4 text-xs text-gray-500">시작일: {format(new Date(enrollment.course.startDate), "yyyy년 MM월 dd일")}</p>
                    <p className="mb-4 text-xs text-gray-500">종료일: {format(new Date(enrollment.course.endDate), "yyyy년 MM월 dd일")}</p>

                    <button
                      onClick={() => openScheduleModal(enrollment.course.id)}
                      className="mt-8 rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600">
                      수업 일정 보기
                    </button>

                    <a
                      href={`/dashboard/courses/${enrollment.course.id}`}
                      className="block w-full rounded-lg bg-gray-100 px-4 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-200">
                      강의 상세보기
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* 모달 창 */}
      {isModalOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="relative h-full w-full max-w-5xl overflow-y-auto rounded-lg bg-white px-1 py-6 shadow-lg md:px-6">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="mb-4 text-center text-xl font-semibold">수업 일정</h2>
            <CourseSchedule courseId={selectedCourseId} />
          </div>
        </div>
      )}
    </div>
  );
}
