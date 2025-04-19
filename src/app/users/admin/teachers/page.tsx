"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { queryClient } from "@/app/providers";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function TeachersManagementPage() {
  // 강사 신청자 목록 조회
  const {
    data: teacherApplications,
    isLoading: isLoadingApplications,
    refetch: refetchApplications,
  } = useQuery({
    queryKey: ["teacherApplications"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/teacher-applications");
      return res.data;
    },
  });

  // 등록된 강사 목록 조회
  const {
    data: teachers,
    isLoading: isLoadingTeachers,
    refetch: refetchTeachers,
  } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/get-teachers");
      return res.data;
    },
  });

  // 강사 상태 변경 함수
  const toggleTeacherStatus = async (teacherId, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await axios.post("/api/admin/toggle-teacher-status", {
        teacherId,
        status: newStatus,
      });
      // 데이터 다시 불러오기
      refetchTeachers();
    } catch (error) {
      console.error("강사 상태 변경 중 오류 발생:", error);
    }
  };

  // 강사 신청 승인 함수
  const approveTeacherApplication = useMutation({
    mutationFn: async (userId) => {
      return axios.post("/api/admin/teacher-approve", { userId });
    },
    onSuccess: () => {
      // 데이터 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ["teacherApplications"] });
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (error) => {
      console.error("강사 승인 중 오류 발생:", error);
    },
  });

  // 강사 신청 거절 함수
  const rejectTeacherApplication = useMutation({
    mutationFn: async (userId) => {
      return axios.post("/api/admin/teacher-reject", { userId });
    },
    onSuccess: () => {
      // 데이터 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ["teacherApplications"] });
    },
    onError: (error) => {
      console.error("강사 거절 중 오류 발생:", error);
    },
  });

  // 강사 삭제 함수
  const deleteTeacher = useMutation({
    mutationFn: async (userId) => {
      return axios.delete(`/api/admin/delete-teacher?userId=${userId}`);
    },
    onSuccess: () => {
      // 데이터 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (error) => {
      console.error("강사 삭제 중 오류 발생:", error);
    },
  });

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center">
        <h1 className="text-2xl font-bold">강사 관리</h1>
      </div>

      {/* 첫번째 섹션: 강사 신청 목록 */}
      <div className="mb-8">
        <h3 className="mb-4 text-xl font-semibold">강사 신청 목록</h3>
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="overflow-x-auto">
            {isLoadingApplications ? (
              <div className="p-6 text-center">불러오는 중...</div>
            ) : teacherApplications?.length === 0 ? (
              <div className="p-6 text-center text-gray-500">현재 강사 신청이 없습니다.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      User ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      이름
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      이메일
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      연락처
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      상태
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {teacherApplications?.map((application) => (
                    <tr key={application.id}>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{application.id}</td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{application.realName}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{application.email}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{application.phone}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex rounded-full bg-yellow-100 px-2 text-xs leading-5 font-semibold text-yellow-800">
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                        <button
                          onClick={() => approveTeacherApplication.mutate(application.id)}
                          className="mr-2 rounded bg-green-500 px-3 py-1 text-white hover:bg-green-600">
                          승인
                        </button>
                        <button
                          onClick={() => rejectTeacherApplication.mutate(application.id)}
                          className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600">
                          거절
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* 두번째 섹션: 승인된 강사 목록 */}
      <div>
        <h3 className="mb-4 text-xl font-semibold">강사 목록</h3>
        <div className="overflow-hidden rounded-lg bg-white shadow-md">
          <div className="overflow-x-auto">
            {isLoadingTeachers ? (
              <div className="p-6 text-center">불러오는 중...</div>
            ) : teachers?.length === 0 ? (
              <div className="p-6 text-center text-gray-500">승인된 강사가 없습니다.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      User ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      이름
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      이메일
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      전화번호
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      전문 분야
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      상태
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {teachers?.map((teacher) => (
                    <tr key={teacher.id}>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{teacher.id}</td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{teacher.realName}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{teacher.email}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{teacher.phone || "-"}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{teacher.role}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-lg px-3 py-2 text-sm leading-5 font-semibold ${
                            teacher.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                          {teacher.status === "active" ? "활성화 됨" : "비활성 상태"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                        <button
                          onClick={() => toggleTeacherStatus(teacher.id, teacher.status)}
                          className={`mr-4 rounded px-3 py-2 ${
                            teacher.status === "active"
                              ? "bg-yellow-400 text-white hover:bg-yellow-500"
                              : "bg-green-500 text-white hover:bg-green-600"
                          }`}>
                          {teacher.status === "active" ? "비활성화" : "활성화"}
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm("정말로 삭제하시겠습니까?")) {
                              deleteTeacher.mutate(teacher.userId);
                            }
                          }}
                          className="rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600">
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      <div className={"mt-16 flex justify-center"}>
        <Link href="/users/admin" className="flex items-center text-blue-500 hover:underline">
          <ArrowLeft className="mr-1" size={20} />
          관리자 대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}
