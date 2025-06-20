// components/StudentListModal.tsx
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/app/providers";
import axios from "axios";
import { X, Trash2, AlertCircle, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import clsx from "clsx";
import EnrollmentModal from "./EnrollmentModal";

interface Enrollment {
  id: string;
  studentName: string;
  studentPhone: string;
  courseId: string;
  courseTitle: string;
  status: string;
  createdAt: string;
  centerName: string;
  localName: string;
  description: string;
}

interface StudentListModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export default function StudentListModal({ isOpen, onClose, courseId, courseTitle }: StudentListModalProps) {
  const { status, data } = useSession();
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 수강생 목록 조회 쿼리
  const { data: enrollments = [], isLoading } = useQuery({
    queryKey: ["enrollments", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/admin/enrollments?courseId=${courseId}`);
      console.log("enrollments: ", response.data.enrollments);
      return response.data.enrollments as Enrollment[];
    },
    enabled: isOpen, // 모달이 열려있을 때만 쿼리 실행
  });

  // 수강생 삭제 뮤테이션
  const deleteMutation = useMutation({
    mutationFn: async (enrollmentId: string) => {
      const response = await axios.delete(`/api/admin/enrollments?enrollmentId=${enrollmentId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success("수강생이 성공적으로 삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      setDeleteConfirmId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "수강생 삭제에 실패했습니다.");
    },
  });

  // 삭제 확인 처리
  const handleConfirmDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const keyword = searchTerm.toLowerCase();
    return (
      enrollment.studentName.toLowerCase().includes(keyword) ||
      enrollment.studentPhone.toLowerCase().includes(keyword) ||
      enrollment.status.toLowerCase().includes(keyword) ||
      enrollment.centerName.toLowerCase().includes(keyword) ||
      enrollment.localName.toLowerCase().includes(keyword)
    );
  });

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="max-h-[80%] w-full max-w-5xl rounded-lg bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              수강생 목록 <span className="text-gray-500">(총 {filteredEnrollments.length}명)</span>
            </h2>
            <button
              onClick={() => {
                setSearchTerm("");
                onClose();
              }}
              className="rounded-full p-1 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-medium text-gray-700">강좌: {courseTitle}</h3>
            <input
              type="text"
              placeholder="이름, 전화번호, 상태 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded border border-gray-300 px-3 py-1 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>

          {isLoading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"></div>
            </div>
          ) : enrollments.length === 0 ? (
            <div className="flex h-40 flex-col items-center justify-center text-gray-500">
              <AlertCircle className="mb-2 h-8 w-8" />
              <p>등록된 수강생이 없습니다.</p>
            </div>
          ) : (
            <div className="max-h-[calc(80vh-200px)] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 z-10 bg-gray-50 text-xs text-gray-700 uppercase">
                  <tr>
                    <th className="px-6 py-3 text-left">순</th>
                    <th className="px-6 py-3 text-left">이름</th>
                    <th className={clsx("px-6 py-3 text-left", { hidden: data?.user.role !== "admin" })}>전화번호</th>
                    <th className="px-6 py-3 text-left">상태</th>
                    <th className="px-6 py-3 text-left">센터명</th>
                    <th className="px-6 py-3 text-left">지점명</th>
                    <th className="px-6 py-3 text-left">비고</th>
                    <th className="px-6 py-3 text-left">등록일</th>
                    <th className={clsx("px-6 py-3 text-center", { hidden: data?.user.role !== "admin" })}>관리</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredEnrollments.map((enrollment, index) => (
                    <tr key={enrollment.id} className="bg-white hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{index + 1}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{enrollment.studentName}</td>
                      <td className={clsx("px-6 py-4 text-sm whitespace-nowrap text-gray-900", { hidden: data?.user.role !== "admin" })}>
                        {enrollment.studentPhone}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                        {enrollment.status === "pending" ? "대기중" : enrollment.status}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{enrollment.centerName || "-"}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{enrollment.localName || "-"}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{enrollment.description || "-"}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">{new Date(enrollment.createdAt).toLocaleDateString()}</td>
                      <td className={clsx("px-6 py-4 text-center text-sm whitespace-nowrap", { hidden: data?.user.role !== "admin" })}>
                        {deleteConfirmId === enrollment.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleConfirmDelete(enrollment.id)}
                              className="rounded bg-red-500 px-2 py-1 text-xs text-white hover:bg-red-600"
                              disabled={deleteMutation.isPending}>
                              확인
                            </button>
                            <button onClick={() => setDeleteConfirmId(null)} className="rounded bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300">
                              취소
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirmId(enrollment.id)} className="rounded-full p-1 text-red-500 hover:bg-red-50">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-0">
            <button
              onClick={() => setIsEnrollmentModalOpen(true)}
              className="flex items-center gap-2 rounded bg-indigo-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-600">
              <UserPlus className="h-4 w-4" />새 수강생 등록
            </button>

            <button
              onClick={() => {
                setSearchTerm("");
                onClose();
              }}
              className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
              닫기
            </button>
          </div>
        </div>
      </div>

      <EnrollmentModal isOpen={isEnrollmentModalOpen} onClose={() => setIsEnrollmentModalOpen(false)} courseId={courseId} courseTitle={courseTitle} />
    </>
  );
}
