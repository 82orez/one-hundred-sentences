// src/app/users/teacher/page.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";

export default function TeacherDashboard() {
  // 필요 데이터 불러오기
  const { data: courseStats } = useQuery({
    queryKey: ["teacherStats"],
    queryFn: async () => {
      const res = await fetch("/api/teacher/stats");
      if (!res.ok) throw new Error("통계 데이터를 불러오는데 실패했습니다");
      return res.json();
    },
  });

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">강사 대시보드</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* 통계 카드 */}
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-2 text-xl font-semibold">나의 강좌</h2>
          <p className="text-3xl">{courseStats?.totalCourses || 0}</p>
          <Link href="/users/teacher/courses" className="mt-2 inline-block text-blue-500 hover:underline">
            강좌 관리
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-2 text-xl font-semibold">내 학생</h2>
          <p className="text-3xl">{courseStats?.totalStudents || 0}</p>
          <Link href="/users/teacher/students" className="mt-2 inline-block text-blue-500 hover:underline">
            학생 관리
          </Link>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-2 text-xl font-semibold">미확인 과제</h2>
          <p className="text-3xl">{courseStats?.pendingAssignments || 0}</p>
          <Link href="/users/teacher/assignments" className="mt-2 inline-block text-blue-500 hover:underline">
            과제 확인하기
          </Link>
        </div>
      </div>

      {/* 최근 활동 */}
      <div className="mt-8 rounded-lg bg-white p-6 shadow-md">
        <h2 className="mb-4 text-xl font-semibold">최근 활동</h2>
        {/* 활동 목록 표시 */}
      </div>
    </div>
  );
}
