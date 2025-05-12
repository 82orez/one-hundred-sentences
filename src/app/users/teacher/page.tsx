"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { format, isToday } from "date-fns";
import TeacherSchedule from "@/components/TeacherSchedule";

// 강좌 타입 정의
type Course = {
  id: string;
  title: string;
  startDate: string | null;
  endDate: string | null;
  teacherId: string;
};

// ClassDate 타입 정의
type ClassDateType = {
  id: string;
  courseId: string;
  date: string;
  dayOfWeek: string;
  startTime: string | null;
  endTime: string | null;
};

export default function TeacherDashboard() {
  // 스케줄 모달 상태 관리
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // React Query를 사용하여 강사의 강좌 데이터 가져오기
  const { data: courses, isLoading: isCoursesLoading } = useQuery({
    queryKey: ["teacherCourses"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/teacher-dashboard");
      console.log("courses: ", response.data);
      return response.data as Course[];
    },
  });

  // 수업 일정 데이터 가져오기
  const { data: classDates, isLoading: isClassDatesLoading } = useQuery({
    queryKey: ["teacherClassDates"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/teacher-dashboard/class-dates");
      return response.data as ClassDateType[];
    },
    enabled: !!courses && courses.length > 0,
  });

  // 현재 날짜와 시간
  const now = new Date();

  // 오늘 진행할 수업 갯수 계산
  const getTodayClassesCount = () => {
    if (!classDates) return 0;

    return classDates.filter((classDate) => {
      // 날짜 객체로 변환
      const classDateObj = new Date(classDate.date);

      // 오늘 날짜인지 확인
      if (!isToday(classDateObj)) return false;

      // 시간 확인
      if (classDate.startTime) {
        const [hours, minutes] = classDate.startTime.split(":").map(Number);
        const classTime = new Date();
        classTime.setHours(hours, minutes, 0, 0);

        // 현재 시간 이후의 수업만 포함
        if (classTime < now) return false;
      }

      return true;
    }).length;
  };

  // 현재 날짜
  const today = new Date();

  // 강좌 상태별로 분류
  const getCourseStats = () => {
    if (!courses) return { ongoing: 0, waiting: 0, completed: 0, total: 0 };

    const stats = courses.reduce(
      (acc, course) => {
        const startDate = course.startDate ? new Date(course.startDate) : null;
        const endDate = course.endDate ? new Date(course.endDate) : null;

        if (startDate && endDate) {
          if (today > endDate) {
            // 종료일이 지난 경우: 완강
            acc.completed += 1;
          } else if (today >= startDate && today <= endDate) {
            // 시작일과 종료일 사이: 진행 중
            acc.ongoing += 1;
          } else if (today < startDate) {
            // 시작일 이전: 대기 중
            acc.waiting += 1;
          }
        }

        acc.total += 1;
        return acc;
      },
      { ongoing: 0, waiting: 0, completed: 0, total: 0 },
    );

    return stats;
  };

  const courseStats = getCourseStats();
  // 현재 로그인한 강사의 ID 가져오기
  const teacherId = courses?.[0]?.teacherId || "";

  // 오늘의 수업 갯수
  const todayClassesCount = getTodayClassesCount();

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">강사 대시보드</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 통계 카드 */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-2 text-xl font-semibold">나의 강좌</h2>
          <div className="space-y-2">
            <p className="text-3xl">{courseStats.total}</p>
            <div className="mt-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-500">진행 중</span>
                <span>{courseStats.ongoing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-500">대기 중</span>
                <span>{courseStats.waiting}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">완강</span>
                <span>{courseStats.completed}</span>
              </div>
            </div>
          </div>
          <Link href="/users/teacher/teacher-courses" className="mt-4 inline-block text-blue-500 hover:underline">
            강좌 관리
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-2 text-xl font-semibold">내 학생</h2>
          <p className="text-3xl">0</p>
          <Link href="/users/teacher/students" className="mt-2 inline-block text-blue-500 hover:underline">
            학생 관리
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-2 text-xl font-semibold">미확인 과제</h2>
          <p className="text-3xl">0</p>
          <Link href="/users/teacher/assignments" className="mt-2 inline-block text-blue-500 hover:underline">
            과제 확인하기
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-2 text-xl font-semibold">오늘 진행할 수업</h2>
          <p className="text-3xl">{isClassDatesLoading ? "로딩 중..." : todayClassesCount}</p>
          <button onClick={() => setIsScheduleModalOpen(true)} className="mt-4 rounded-md bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">
            전체 수업 일정 보기
          </button>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">최근 활동</h2>
        {/* 활동 목록 표시 */}
      </div>

      {/* 스케줄 모달 */}
      {isScheduleModalOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 p-4">
          <div className="relative w-full max-w-6xl rounded-lg bg-white">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-xl font-semibold">나의 수업 일정</h2>
              <button onClick={() => setIsScheduleModalOpen(false)} className="rounded-full p-1 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="max-h-[85vh] overflow-y-auto p-4">
              <TeacherSchedule teacherId={teacherId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
