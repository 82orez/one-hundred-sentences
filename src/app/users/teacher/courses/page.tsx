"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { PlusCircle } from "lucide-react";

export default function CoursesPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", description: "" });
  const [editingCourse, setEditingCourse] = useState({ id: "", title: "", description: "" });
  const [courseToDelete, setCourseToDelete] = useState(null);

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

  const handleEditCourse = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/teacher/courses/${editingCourse.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editingCourse.title,
          description: editingCourse.description,
        }),
      });

      if (res.ok) {
        setShowEditModal(false);
        setEditingCourse({ id: "", title: "", description: "" });
        refetch();
      }
    } catch (error) {
      console.error("강좌 수정 실패:", error);
    }
  };

  const openEditModal = (course) => {
    setEditingCourse({
      id: course.id,
      title: course.title,
      description: course.description,
    });
    setShowEditModal(true);
  };

  // 삭제 모달 열기 함수
  const openDeleteModal = (course) => {
    setCourseToDelete(course);
    setShowDeleteModal(true);
  };

  // 강좌 삭제 처리 함수
  const handleDeleteCourse = async () => {
    if (!courseToDelete) return;

    try {
      const res = await fetch(`/api/teacher/courses/${courseToDelete.id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // 삭제 성공 시 모달 닫고 목록 갱신
        setShowDeleteModal(false);
        setCourseToDelete(null);
        refetch();
      } else {
        const error = await res.json();
        console.error("강좌 삭제 실패:", error);
        alert("강좌를 삭제하는데 실패했습니다.");
      }
    } catch (error) {
      console.error("강좌 삭제 중 오류 발생:", error);
      alert("네트워크 오류가 발생했습니다.");
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
              <div className="flex gap-2">
                <button className="btn btn-sm" onClick={() => openEditModal(course)}>
                  수정하기
                </button>
                <button className="btn btn-sm btn-error" onClick={() => openDeleteModal(course)}>
                  삭제하기
                </button>
              </div>
            </div>
          </div>
        ))}

        {courses?.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500">아직 개설한 강좌가 없습니다. 새 강좌를 만들어보세요!</div>
        )}
      </div>

      {/* 강좌 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">새 강좌 만들기</h2>
            <form onSubmit={handleCreateCourse}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">강좌명</label>
                <input
                  type="text"
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">설명</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2"
                  rows={3}></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn" onClick={() => setShowCreateModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 강좌 수정 모달 */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-2xl font-bold">강좌 수정</h2>
            <form onSubmit={handleEditCourse}>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">강좌명</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">설명</label>
                <textarea
                  value={editingCourse.description}
                  onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 p-2"
                  rows={3}></textarea>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" className="btn" onClick={() => setShowEditModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 강좌 삭제 확인 모달 */}
      {showDeleteModal && courseToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="text-error mb-4 text-xl font-bold">강좌 삭제 확인</h2>
            <p className="mb-6">
              <span className="font-semibold">'{courseToDelete.title}'</span> 강좌를 정말 삭제하시겠습니까?
              <br />
              삭제된 강좌는 복구할 수 없습니다.
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn" onClick={() => setShowDeleteModal(false)}>
                취소
              </button>
              <button className="btn btn-error" onClick={handleDeleteCourse}>
                삭제 확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
