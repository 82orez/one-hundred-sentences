"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { User, Users, BarChart3, Settings, Home, BookOpen, Menu, X, GraduationCap } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { queryClient } from "@/app/providers";

// Chart 등록
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 가상 사용자 데이터
const MOCK_USERS = [
  { id: 1, name: "김철수", email: "kim@example.com", role: "사용자", status: "활성" },
  { id: 2, name: "이영희", email: "lee@example.com", role: "관리자", status: "활성" },
  { id: 3, name: "박지민", email: "park@example.com", role: "사용자", status: "비활성" },
  { id: 4, name: "정민준", email: "jung@example.com", role: "사용자", status: "활성" },
  { id: 5, name: "최수진", email: "choi@example.com", role: "사용자", status: "활성" },
];

// 가상 Teacher 데이터
const MOCK_Teachers = [
  { id: 1, name: "김철수2", email: "kim2@example.com", role: "영어", status: "활성" },
  { id: 2, name: "이영희2", email: "lee2@example.com", role: "일본어", status: "활성" },
  { id: 3, name: "박지민2", email: "park2@example.com", role: "영어", status: "비활성" },
  { id: 4, name: "정민준2", email: "jung2@example.com", role: "영어", status: "활성" },
  { id: 5, name: "최수진2", email: "choi2@example.com", role: "중국어", status: "활성" },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const router = useRouter();
  const [users, setUsers] = useState(MOCK_USERS);
  // const [teachers, setTeachers] = useState(MOCK_Teachers);
  // const [teacherApplications, setTeacherApplications] = useState(MOCK_TEACHER_APPLICATIONS);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // 가상 통계 데이터
  const chartData = {
    labels: ["1월", "2월", "3월", "4월", "5월", "6월"],
    datasets: [
      {
        label: "월별 신규 사용자",
        data: [12, 19, 3, 5, 2, 3],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
      {
        label: "월별 활성 사용자",
        data: [8, 15, 7, 12, 9, 11],
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  // ✅ 강사 신청자 목록 조회
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

  // ✅ 등록된 강사 목록 조회
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

  // ✅ 강사 상태 변경 함수
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

  // ✅ 강사 신청 승인 함수
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

  // ✅ 강사 신청 거절 함수
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

  // ✅ 강사 삭제 함수
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

  // 태블릿/모바일에서 사이드바 선택 후 닫기
  const handleMobileNavigation = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth < 640) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="relative flex h-screen flex-col bg-gray-100 md:flex-row">
      {/* 모바일 토글 버튼 */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute top-3.5 right-5 rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden">
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* 사이드바 네비게이션 */}
      <div
        className={`fixed inset-y-0 left-0 z-10 w-64 transform bg-white shadow-md transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:block`}>
        <div className="border-b border-gray-200 p-4 md:pt-6">
          <h2 className="text-2xl font-semibold text-gray-800">관리자 패널</h2>
          {/* 모바일 토글 버튼 */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="absolute top-3.5 right-5 rounded-md p-2 text-gray-600 hover:bg-gray-100 md:hidden">
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => handleMobileNavigation("dashboard")}
                className={`flex w-full items-center rounded-lg px-4 py-2 ${
                  activeTab === "dashboard" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}>
                <Home className="mr-3 h-5 w-5" />
                <span>대시보드</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMobileNavigation("courses")}
                className={`flex w-full items-center rounded-lg px-4 py-2 ${
                  activeTab === "courses" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}>
                <BookOpen className="mr-3 h-5 w-5" />
                <span>강좌 관리</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMobileNavigation("users")}
                className={`flex w-full items-center rounded-lg px-4 py-2 ${
                  activeTab === "users" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}>
                <Users className="mr-3 h-5 w-5" />
                <span>사용자 관리</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMobileNavigation("teachers")}
                className={`flex w-full items-center rounded-lg px-4 py-2 ${
                  activeTab === "teachers" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}>
                <GraduationCap className="mr-3 h-5 w-5" />
                <span>강사 관리</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMobileNavigation("statistics")}
                className={`flex w-full items-center rounded-lg px-4 py-2 ${
                  activeTab === "statistics" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}>
                <BarChart3 className="mr-3 h-5 w-5" />
                <span>통계</span>
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMobileNavigation("settings")}
                className={`flex w-full items-center rounded-lg px-4 py-2 ${
                  activeTab === "settings" ? "bg-blue-500 text-white" : "text-gray-700 hover:bg-gray-100"
                }`}>
                <Settings className="mr-3 h-5 w-5" />
                <span>설정</span>
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 overflow-auto pt-0 md:pt-0">
        {/* 오버레이 - 모바일에서 사이드바 열릴 때 배경 어둡게 처리 */}
        {sidebarOpen && <div className="bg-opacity-50 fixed inset-0 z-0 bg-black md:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* 콘텐츠 영역 - 여기에 기존 콘텐츠 내용 넣기 */}
        <div className="p-4 md:p-6">
          {activeTab === "dashboard" && (
            <div>
              <h2 className="mb-6 text-2xl font-bold">대시보드</h2>
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow-md">
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full bg-blue-100 p-3">
                      <User className="text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">총 사용자</p>
                      <p className="text-2xl font-semibold">{users.length}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-md">
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full bg-green-100 p-3">
                      <User className="text-green-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">활성 사용자</p>
                      <p className="text-2xl font-semibold">{users.filter((user) => user.status === "활성").length}</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg bg-white p-6 shadow-md">
                  <div className="flex items-center">
                    <div className="mr-4 rounded-full bg-red-100 p-3">
                      <User className="text-red-500" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">비활성 사용자</p>
                      <p className="text-2xl font-semibold">{users.filter((user) => user.status === "비활성").length}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-semibold">사용자 통계</h3>
                <div className="h-80">
                  <Bar data={chartData} />
                </div>
              </div>
            </div>
          )}

          {/* 강좌 관리 탭 콘텐츠 추가 */}
          {activeTab === "courses" && (
            <div>
              <h2 className="mb-6 text-2xl font-bold">강좌 관리</h2>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <p className="text-gray-600">강좌 관리 페이지입니다. 여기에서 강좌를 추가, 수정, 삭제할 수 있습니다.</p>
                {/* 강좌 목록 또는 관리 UI를 여기에 추가할 수 있습니다 */}
                <div className="mt-4">
                  <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">새 강좌 추가</button>
                </div>
              </div>
            </div>
          )}

          {/* 사용자 관리 탭 콘텐츠 추가 */}
          {activeTab === "users" && (
            <div>
              <h2 className="mb-6 text-2xl font-bold">사용자 관리</h2>
              <div className="overflow-hidden rounded-lg bg-white shadow-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                          ID
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                          이름
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                          이메일
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                          역할
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
                      {users.map((user) => (
                        <tr key={user.id}>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{user.id}</td>
                          <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{user.name}</td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{user.email}</td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{user.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex rounded-full px-2 text-xs leading-5 font-semibold ${
                                user.status === "활성" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                            <button
                              // onClick={() => toggleUserStatus(user.id)}
                              className={`mr-2 rounded px-3 py-1 ${
                                user.status === "활성" ? "bg-red-500 text-white hover:bg-red-600" : "bg-green-500 text-white hover:bg-green-600"
                              }`}>
                              {user.status === "활성" ? "비활성화" : "활성화"}
                            </button>
                            <button className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600">수정</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* 강사 관리 탭 */}
          {activeTab === "teachers" && (
            <div>
              <h2 className="mb-6 text-2xl font-bold">강사 관리</h2>

              {/* 첫번째 섹션: 강사 신청 목록 */}
              <div className="mb-8">
                <h3 className="mb-4 text-xl font-semibold">강사 신청 목록</h3>
                <div className="overflow-hidden rounded-lg bg-white shadow-md">
                  <div className="overflow-x-auto">
                    {teacherApplications.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">현재 강사 신청이 없습니다.</div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                              ID
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
                          {teacherApplications.map((application) => (
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
                    {teachers.length === 0 ? (
                      <div className="p-6 text-center text-gray-500">승인된 강사가 없습니다.</div>
                    ) : (
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                              ID
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                              이름
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                              이메일
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
                          {teachers.map((teacher) => (
                            <tr key={teacher.id}>
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{teacher.id}</td>
                              <td className="px-6 py-4 text-sm font-medium whitespace-nowrap text-gray-900">{teacher.realName}</td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{teacher.email}</td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">{teacher.role}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`inline-flex rounded-lg p-2 text-sm leading-5 font-semibold ${
                                    teacher.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                                  }`}>
                                  {teacher.status === "active" ? "활성화 됨" : "비활성 상태"}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                                <button
                                  onClick={() => toggleTeacherStatus(teacher.id, teacher.status)}
                                  className={`mr-2 rounded px-3 py-1 ${
                                    teacher.status === "active"
                                      ? "bg-red-500 text-white hover:bg-red-600"
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
                                  className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600">
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
            </div>
          )}

          {/* 통계 관리 탭 콘텐츠 추가 */}
          {activeTab === "statistics" && (
            <div>
              <h2 className="mb-6 text-2xl font-bold">통계</h2>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-semibold">월별 사용자 통계</h3>
                <div className="h-96">
                  <Bar data={chartData} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div>
              <h2 className="mb-6 text-2xl font-bold">설정</h2>
              <div className="rounded-lg bg-white p-6 shadow-md">
                <h3 className="mb-4 text-lg font-semibold">일반 설정</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">사이트 이름</label>
                    <input
                      type="text"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                      placeholder="사이트 이름"
                      defaultValue="One Hundred Sentences"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">관리자 이메일</label>
                    <input
                      type="email"
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                      placeholder="관리자 이메일"
                      defaultValue="admin@example.com"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="maintenance-mode"
                      name="maintenance-mode"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="maintenance-mode" className="ml-2 block text-sm text-gray-900">
                      유지보수 모드 활성화
                    </label>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
                    설정 저장
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
