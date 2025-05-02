"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { queryClient } from "@/app/providers";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import TeacherSchedule from "@/components/TeacherSchedule";

// 타입 정의
interface Teacher {
  id: string;
  userId: string;
  realName: string;
  email: string;
  phone: string;
  nation: "KR" | "PH";
  subject: "en" | "ja" | "ko" | "zh";
  nickName?: string; // 별칭 필드 추가
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface TeacherApplication {
  id: string;
  realName: string;
  email: string;
  phone: string;
  status: string;
}

interface TeacherUpdateData {
  teacherId: string;
  nation: string;
  subject: string;
  nickName?: string; // 별칭 필드 추가
}

export default function TeachersManagementPage() {
  const [selectedTeacherForSchedule, setSelectedTeacherForSchedule] = useState<Teacher | null>(null);

  // 강사 신청자 목록 조회
  const {
    data: teacherApplications,
    isLoading: isLoadingApplications,
    refetch: refetchApplications,
  } = useQuery({
    queryKey: ["teacherApplications"],
    queryFn: async () => {
      const res = await axios.get("/api/admin/teacher-applications");
      return res.data as TeacherApplication[];
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
      return res.data as Teacher[];
    },
  });

  // 수정 모달 상태
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    nation: "",
    subject: "",
    phone: "", // 전화번호 필드 추가
    nickName: "", // 별칭 필드 추가
  });

  // 수정 모달 열기
  const openEditModal = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      nation: teacher.nation,
      subject: teacher.subject,
      phone: teacher.phone || "", // 전화번호 추가
      nickName: teacher.nickName || "", // 별칭 필드 추가
    });
    setIsEditModalOpen(true);
  };

  // 수정 모달 닫기
  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedTeacher(null);
  };

  // 입력 필드 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // 강사 정보 업데이트 함수
  const updateTeacher = useMutation({
    mutationFn: (data: TeacherUpdateData) => {
      return axios.post("/api/admin/update-teacher", data);
    },
    onSuccess: () => {
      // 데이터 다시 불러오기
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      // 모달 닫기
      closeEditModal();
    },
    onError: (error) => {
      console.error("강사 정보 업데이트 중 오류 발생:", error);
      alert("강사 정보 업데이트 중 오류가 발생했습니다.");
    },
  });

  // 폼 제출 처리
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedTeacher) {
      updateTeacher.mutate({
        teacherId: selectedTeacher.id,
        ...formData,
      });
    }
  };

  // 강사 상태 변경 함수
  const toggleTeacherStatus = async (teacherId: string, currentIsActive: boolean) => {
    try {
      await axios.post("/api/admin/toggle-teacher-status", {
        teacherId,
        isActive: !currentIsActive, // 현재 상태의 반대값으로 변경
      });
      // 데이터 다시 불러오기
      refetchTeachers();
    } catch (error) {
      console.error("강사 상태 변경 중 오류 발생:", error);
    }
  };

  // 강사 신청 승인 함수
  const approveTeacherApplication = useMutation({
    mutationFn: (userId: string) => {
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
    mutationFn: (userId: string) => {
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
    mutationFn: (userId: string) => {
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

  // 스케줄 모달 닫기 함수
  const closeScheduleModal = () => {
    setSelectedTeacherForSchedule(null);
  };

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
                      등록일자
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      이름
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      별칭
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      이메일
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      전화번호
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      국적
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      과목
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      상태
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      스케줄
                    </th>

                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {teachers?.map((teacher) => (
                    <tr key={teacher.id}>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                        {new Date(teacher.createdAt).toLocaleString("ko-KR", {
                          timeZone: "Asia/Seoul",
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{teacher.realName}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{teacher.nickName || "-"}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{teacher.email}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{teacher.phone || "-"}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{teacher.nation || "-"}</td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{teacher.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex rounded-lg px-3 py-2 text-sm leading-5 font-semibold ${
                            teacher.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                          }`}>
                          {teacher.isActive ? "활성화 됨" : "비활성 상태"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                        <button
                          onClick={() => setSelectedTeacherForSchedule(teacher)}
                          className="rounded bg-indigo-500 px-3 py-2 text-white hover:bg-indigo-600">
                          스케줄 보기
                        </button>
                      </td>

                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                        <div className="flex items-center">
                          <button
                            onClick={() => toggleTeacherStatus(teacher.id, teacher.isActive)}
                            className={`mr-2 rounded px-3 py-2 ${
                              teacher.isActive ? "bg-yellow-400 text-white hover:bg-yellow-500" : "bg-green-500 text-white hover:bg-green-600"
                            }`}>
                            {teacher.isActive ? "비활성화" : "활성화"}
                          </button>
                          <button onClick={() => openEditModal(teacher)} className="mr-2 rounded bg-blue-500 px-3 py-2 text-white hover:bg-blue-600">
                            수정하기
                          </button>
                          <button
                            onClick={() => {
                              if (teacher.isActive) {
                                window.alert("활성화 됨 상태일 때는 삭제할 수 없습니다.");
                              } else {
                                if (window.confirm("정말로 삭제하시겠습니까?")) {
                                  deleteTeacher.mutate(teacher.userId);
                                }
                              }
                            }}
                            className="rounded bg-red-500 px-3 py-2 text-white hover:bg-red-600">
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* 수정 모달 */}
      {isEditModalOpen && selectedTeacher && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">강사 정보 수정</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700">이름</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2" value={selectedTeacher.realName} disabled />
              </div>
              <div className="mb-4">
                <label htmlFor="nickName" className="block text-sm font-medium text-gray-700">
                  별칭
                </label>
                <input
                  type="text"
                  id="nickName"
                  name="nickName"
                  value={formData.nickName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700">이메일</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 bg-gray-100 p-2" value={selectedTeacher.email} disabled />
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700">전화번호</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full rounded-lg border border-gray-300 p-2"
                  placeholder="전화번호를 입력하세요"
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-bold text-gray-700">국적</label>
                <select name="nation" value={formData.nation} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-2">
                  <option value="KR">한국 (KR)</option>
                  <option value="PH">필리핀 (PH)</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="mb-2 block text-sm font-bold text-gray-700">과목</label>
                <select name="subject" value={formData.subject} onChange={handleInputChange} className="w-full rounded-lg border border-gray-300 p-2">
                  <option value="en">영어 (en)</option>
                  <option value="ja">일본어 (ja)</option>
                  <option value="ko">한국어 (ko)</option>
                  <option value="zh">중국어 (zh)</option>
                </select>
              </div>
              <div className="flex justify-end space-x-4">
                <button type="button" onClick={closeEditModal} className="rounded bg-gray-300 px-4 py-2 hover:bg-gray-400">
                  취소
                </button>
                <button type="submit" className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">
                  저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 스케줄 모달 추가 */}
      {selectedTeacherForSchedule && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30">
          <div className="my-8 max-h-full w-full max-w-5xl overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">{selectedTeacherForSchedule.realName} 강사의 수업 일정</h2>
              <button onClick={closeScheduleModal} className="rounded-full p-1 hover:bg-gray-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <TeacherSchedule teacherId={selectedTeacherForSchedule.id} />

            <div className="mt-6 flex justify-end">
              <button onClick={closeScheduleModal} className="rounded bg-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-400">
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={"mt-16 flex justify-center"}>
        <Link href="/users/admin" className="flex items-center text-blue-500 hover:underline">
          <ArrowLeft className="mr-1" size={20} />
          관리자 대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}
