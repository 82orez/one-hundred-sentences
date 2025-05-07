// components/EnrollmentModal.tsx
"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface EnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export default function EnrollmentModal({ isOpen, onClose, courseId, courseTitle }: EnrollmentModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    studentName: "",
    studentPhone: "",
  });

  const enrollMutation = useMutation({
    mutationFn: async (data: { courseId: string; studentName: string; studentPhone: string }) => {
      const response = await axios.post("/api/admin/enrollments", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("수강생이 성공적으로 등록되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["enrollments"] });
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      onClose();
      // 폼 초기화
      setFormData({
        studentName: "",
        studentPhone: "",
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "수강생 등록에 실패했습니다.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 유효성 검사
    if (!formData.studentName.trim()) {
      return toast.error("수강생 이름을 입력해주세요.");
    }

    if (!formData.studentPhone.trim()) {
      return toast.error("전화번호를 입력해주세요.");
    }

    // 전화번호 형식 확인 (기본적인 검증)
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(formData.studentPhone.replace(/-/g, ""))) {
      return toast.error("유효한 전화번호 형식이 아닙니다.");
    }

    enrollMutation.mutate({
      courseId,
      studentName: formData.studentName,
      studentPhone: formData.studentPhone,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">수강생 등록</h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4">
          <h3 className="font-medium text-gray-700">강좌: {courseTitle}</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="studentName" className="mb-1 block text-sm font-medium text-gray-700">
              수강생 이름
            </label>
            <input
              type="text"
              id="studentName"
              name="studentName"
              value={formData.studentName}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              placeholder="이름을 입력하세요"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="studentPhone" className="mb-1 block text-sm font-medium text-gray-700">
              전화번호
            </label>
            <input
              type="text"
              id="studentPhone"
              name="studentPhone"
              value={formData.studentPhone}
              onChange={handleChange}
              className="w-full rounded-md border border-gray-300 p-2 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
              placeholder="예) 01012345678"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
              취소
            </button>
            <button
              type="submit"
              className="rounded bg-indigo-500 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600"
              disabled={enrollMutation.isPending}>
              {enrollMutation.isPending ? "처리 중..." : "등록"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
