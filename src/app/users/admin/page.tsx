"use client";

import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { User, Users, BarChart3, Settings, Home, BookOpen, Menu, X, GraduationCap } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";

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
  const [users, setUsers] = useState(MOCK_USERS);
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

  // 태블릿/모바일에서 사이드바 선택 후 닫기
  const handleMobileNavigation = (tab) => {
    setActiveTab(tab);
    if (window.innerWidth < 640) {
      setSidebarOpen(false);
    }
  };

  // recordings 버킷의 모든 파일 삭제하기
  // const deleteAllRecordings = async () => {
  //   try {
  //     const response = await fetch("/api/admin/delete-recordings", {
  //       method: "DELETE",
  //     });
  //
  //     const data = await response.json();
  //
  //     if (response.ok) {
  //       console.log("모든 녹음 파일이 삭제되었습니다:", data);
  //       // 성공 처리 로직 (예: 토스트 메시지 표시)
  //     } else {
  //       console.error("파일 삭제 오류:", data.error);
  //       // 오류 처리 로직
  //     }
  //   } catch (error) {
  //     console.error("요청 처리 중 오류 발생:", error);
  //     // 예외 처리 로직
  //   }
  // };

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
                      <Link href={"/users/admin/teachers"}>
                        <p className="text-sm text-gray-500">강사 신청 대기 중</p>
                        <p className="text-2xl font-semibold">{teacherApplications?.length || 0}</p>
                      </Link>
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

          {/* 강사 관리 탭 */}
          {activeTab === "teachers" && (
            <div>
              <h2 className="mb-6 text-2xl font-bold">강사 관리</h2>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg bg-white p-6 shadow-md">
                  <h3 className="mb-4 text-lg font-semibold">강사 신청 대기 중</h3>
                  <p className="text-3xl font-bold">{teacherApplications?.length || 0}</p>
                  <p className="mt-4 text-gray-500">대기 중인 강사 신청</p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                  <h3 className="mb-4 text-lg font-semibold">현재 강사</h3>
                  <p className="text-3xl font-bold">{teachers?.filter((t) => t.isActive).length || 0}</p>
                  <p className="mt-4 text-gray-500">활성화된 강사</p>
                </div>

                <div className="rounded-lg bg-white p-6 shadow-md">
                  <h3 className="mb-4 text-lg font-semibold">비활성 강사</h3>
                  <p className="text-3xl font-bold">{teachers?.filter((t) => !t.isActive).length || 0}</p>
                  <p className="mt-4 text-gray-500">비활성화된 강사</p>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <Link href="/users/admin/teachers" className="rounded-md bg-blue-500 px-6 py-3 text-white hover:bg-blue-600">
                  강사 관리 페이지로 이동
                </Link>
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

          {/* 설정 탭 콘텐츠 추가 */}
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

              {/*<div className="mt-6 flex items-center justify-between rounded-lg bg-white p-6 shadow-md">*/}
              {/*  <div className={"text-lg font-semibold"}>모든 레코딩 파일 삭제하기</div>*/}
              {/*  <button*/}
              {/*    className={"rounded-md bg-red-400 p-2 text-white"}*/}
              {/*    onClick={() => {*/}
              {/*      if (window.confirm("정말로 모든 녹음 파일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {*/}
              {/*        deleteAllRecordings();*/}
              {/*      }*/}
              {/*    }}>*/}
              {/*    삭제*/}
              {/*  </button>*/}
              {/*</div>*/}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
