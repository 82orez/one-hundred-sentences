// src/app/users/teacher/courses/page.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function CoursesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });

  const { data: courses, refetch } = useQuery({
    queryKey: ["teacherCourses"],
    queryFn: async () => {
      const res = await fetch("/api/teacher/courses");
      if (!res.ok) throw new Error("강좌를 불러오는데 실패했습니다");
      return res.json();
    },
  });

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/teacher/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCourse),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewCourse({ title: "", description: "" });
        refetch();
      }
    } catch (error) {
      console.error("강좌 생성 실패:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">내 강좌 관리</h1>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => setShowCreateModal(true)}>
          <PlusCircle size={18} />새 강좌 만들기
        </button>
      </div>

      {/* 강좌 목록 */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => (
          <div key={course.id} className="rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-xl font-semibold">{course.title}</h2>
            <p className="mb-4 line-clamp-2 text-gray-600">{course.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">학생 수: {course._count?.enrollments || 0}</span>
              <Link href={`/users/teacher/courses/${course.id}`} className="btn btn-sm">
                관리하기
              </Link>
            </div>
          </div>
        ))}

        {courses?.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500">아직 개설한 강좌가 없습니다. 새 강좌를 만들어보세요!</div>
        )}
      </div>

      {/* 강좌 생성 모달 */}
      {showCreateModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">새 강좌 만들기</h2>
            <form onSubmit={handleCreateCourse}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">강좌명</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full rounded border p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">설명</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="h-24 w-full rounded border p-2"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  강좌 만들기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
