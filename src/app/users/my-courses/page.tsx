"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import toast from "react-hot-toast";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import { format } from "date-fns";
import { Play, Clock, CheckCircle } from "lucide-react";
import { queryClient } from "@/app/providers";

export default function MyCoursesPage() {
  // 내 강의 목록 조회
  const { data, isLoading, error } = useQuery({
    queryKey: ["my-courses"],
    queryFn: async () => {
      const response = await axios.get("/api/user/my-courses");
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
                    <p className="mb-4 text-xs text-gray-500">시작일: {format(new Date(enrollment.course.startDate), "yyyy년 MM월 dd일")}</p>
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
    </div>
  );
}
