"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, CheckCircle, Search, Filter } from "lucide-react";
import clsx from "clsx";
import React from "react";
import toast from "react-hot-toast";

// 타입 정의
interface Teacher {
  id: string;
  realName: string;
  nickName?: string;
  email: string;
  phone: string;
  nation: string;
  subject: string;
  isActive: boolean;
}

interface ClassDate {
  id?: string;
  courseId?: string;
  date: string;
  dayOfWeek: string;
  startTime: string | null;
  endTime: string | null;
}

interface ConflictingCourse {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
}

interface TeacherSelectorProps {
  classDates: ClassDate[];
  selectedTeacherId: string | null;
  onChange: (teacherId: string | null) => void;
  startTime: string;
  endTime: string;
  currentCourseId?: string;
  onConflictChange?: (hasConflict: boolean) => void; // 충돌 상태를 상위 컴포넌트에 전달하는 콜백
  courseStatus?: "대기 중" | "진행 중" | "완료"; // 강좌 상태 속성 추가
}

export default function TeacherSelector({
  classDates,
  selectedTeacherId,
  onChange,
  startTime,
  endTime,
  currentCourseId,
  onConflictChange,
  courseStatus,
}: TeacherSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [nationFilter, setNationFilter] = useState("전체");
  const [subjectFilter, setSubjectFilter] = useState("전체");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
  const [expandedTeacherId, setExpandedTeacherId] = useState<string | null>(null);

  // 강사 목록 가져오기
  const { data: teachers = [], isLoading: isLoadingTeachers } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/active-teachers");
      return response.data.teachers;
    },
  });

  // 강사들의 강의 스케줄 충돌 체크
  const { data: conflictData = {}, isLoading: isCheckingConflicts } = useQuery({
    queryKey: ["teacherConflicts", classDates, startTime, endTime, currentCourseId],
    queryFn: async () => {
      if (!classDates.length || !startTime || !endTime) return {};

      const response = await axios.post("/api/admin/check-teacher-conflicts", {
        classDates,
        startTime,
        endTime,
        currentCourseId,
      });
      console.log("response.data.conflicts: ", response.data.conflicts);
      return response.data.conflicts || {};
    },
    enabled: classDates.length > 0 && !!startTime && !!endTime,
  });

  // 현재 강좌에 배정된 강사 정보
  const { data: currentTeacher = null } = useQuery({
    queryKey: ["currentTeacher", selectedTeacherId],
    queryFn: async () => {
      if (!selectedTeacherId) return null;
      const response = await axios.get(`/api/admin/teachers?selectedTeacherId=${selectedTeacherId}`);
      return response.data.teacher;
    },
    enabled: !!selectedTeacherId,
  });

  // 선택된 강사의 충돌 상태를 감시하고 상위 컴포넌트에 알림
  useEffect(() => {
    if (selectedTeacherId && conflictData && onConflictChange) {
      const hasConflict = !!conflictData[selectedTeacherId];
      onConflictChange(hasConflict);

      // 충돌이 발생한 경우 토스트 메시지 표시
      if (hasConflict) {
        toast.error("선택된 강사에게 강의 충돌이 발생했습니다.");
      }
    }
  }, [selectedTeacherId, conflictData, onConflictChange]);

  // 사용 가능한 국적 필터 목록
  const nationOptions = ["전체", ...Array.from(new Set(teachers.map((t: Teacher) => t.nation)))];

  // 사용 가능한 과목 필터 목록
  const subjectOptions = ["전체", ...Array.from(new Set(teachers.map((t: Teacher) => t.subject)))];

  // 필터링된 강사 목록
  const filteredTeachers = teachers.filter((teacher: Teacher) => {
    // 검색어 필터링
    const matchesSearch =
      teacher.realName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (teacher.nickName && teacher.nickName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      teacher.phone.includes(searchTerm);

    // 국적 필터링
    const matchesNation = nationFilter === "전체" || teacher.nation === nationFilter;

    // 과목 필터링
    const matchesSubject = subjectFilter === "전체" || teacher.subject === subjectFilter;

    // 가용성 필터링
    const isAvailable = !conflictData[teacher.id];

    // 현재 선택된 강사는 제외하지 않음
    const notSelected = teacher.id !== selectedTeacherId;

    return matchesSearch && matchesNation && matchesSubject && (showOnlyAvailable ? isAvailable : true);
  });

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold">현재 선택된 강사</h3>
        {currentTeacher ? (
          <div className="flex items-center justify-between rounded-md border bg-amber-100 p-3">
            <div>
              <p className="font-medium">
                {currentTeacher.user.realName} {currentTeacher.nickName && `(${currentTeacher.nickName})`}
              </p>
              <p className="mt-2 text-sm text-gray-600">
                {currentTeacher.user.email} | {currentTeacher.user.phone} | {currentTeacher.nation} | {currentTeacher.subject}
              </p>
            </div>
            <button
              onClick={() => onChange(null)}
              className={clsx("ml-4 rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-600 hover:bg-gray-300", {
                hidden: courseStatus === "진행 중" || courseStatus === "완료",
              })}>
              선택 취소
            </button>
          </div>
        ) : (
          <div className="rounded-md border bg-gray-50 p-3">
            <p className="text-gray-500">없음</p>
          </div>
        )}
      </div>

      <div
        className={clsx("mt-8 mb-4 space-y-2", {
          hidden: courseStatus === "진행 중" || courseStatus === "완료",
        })}>
        <div className="relative flex items-center gap-2">
          <Search size={20} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="이름, 이메일, 전화번호로 검색"
            className="w-full rounded-md border p-2 pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-400" />
                <span>국적</span>
                <select className="rounded-md border p-1" value={nationFilter} onChange={(e) => setNationFilter(e.target.value)}>
                  {nationOptions.map((option: string, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <div className={"flex items-center gap-2"}>
                <Filter size={20} className="text-gray-400" />
                <span>과목</span>
                <select className="rounded-md border p-1" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
                  {subjectOptions.map((option: string, index) => (
                    <option key={index} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showOnlyAvailable}
              onChange={() => setShowOnlyAvailable(!showOnlyAvailable)}
              className="h-5 w-5 rounded"
            />
            <span className="">배정 가능한 강사만 보기</span>
          </label>
        </div>
      </div>

      {isLoadingTeachers || isCheckingConflicts ? (
        <div className="py-4 text-center">
          <p>로딩 중...</p>
        </div>
      ) : (
        <div
          className={clsx("overflow-hidden rounded-md border", {
            hidden: courseStatus === "진행 중" || courseStatus === "완료",
          })}>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">강사명</th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">이메일</th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">국적</th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">과목</th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">상태</th>
                <th className="px-4 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">선택</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {filteredTeachers.length > 0 ? (
                filteredTeachers.map((teacher: Teacher) => {
                  const hasConflicts = conflictData[teacher.id];
                  const conflicts = hasConflicts || [];
                  const isExpanded = expandedTeacherId === teacher.id;

                  return (
                    <React.Fragment key={teacher.id}>
                      <tr className={clsx("", { "bg-amber-100": teacher.id === selectedTeacherId })}>
                        <td className="px-4 py-3">
                          <div>
                            <div className="font-medium">{teacher.realName}</div>
                            {teacher.nickName && <div className="text-sm text-gray-500">{teacher.nickName}</div>}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <div className="font-medium">{teacher.email}</div>
                          {teacher.phone}
                        </td>
                        <td className="px-4 py-3 text-sm">{teacher.nation}</td>
                        <td className="px-4 py-3 text-sm">{teacher.subject}</td>
                        <td className="px-4 py-3">
                          {hasConflicts ? (
                            <div className="flex items-center justify-between">
                              <span className="flex items-center text-red-500">
                                <AlertTriangle size={16} className="mr-1" />
                                <span>강의 충돌</span>
                              </span>
                              {conflicts.length > 0 && (
                                <button
                                  type="button"
                                  className="text-sm text-blue-500 underline"
                                  onClick={() => setExpandedTeacherId(isExpanded ? null : teacher.id)}>
                                  {isExpanded ? "닫기" : "상세보기"}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="flex items-center text-green-500">
                              <CheckCircle size={16} className="mr-1" />
                              <span>배정 가능</span>
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            className={clsx(
                              "rounded-md px-3 py-1 text-sm font-medium",
                              teacher.id === selectedTeacherId
                                ? "bg-amber-200 text-amber-700"
                                : hasConflicts
                                  ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                  : "bg-blue-50 text-blue-600 hover:bg-blue-100",
                            )}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              !hasConflicts && onChange(teacher.id);
                            }}
                            disabled={hasConflicts}>
                            {teacher.id === selectedTeacherId ? "선택됨" : "선택"}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="bg-red-50 px-4 py-3 text-sm text-gray-800">
                            <div className="mb-2 font-semibold">🔻 충돌 강좌 목록:</div>
                            <ul className="list-disc space-y-1 pl-4">
                              {conflicts.map((conflict: ConflictingCourse, index: number) => (
                                <li key={index}>
                                  <div className="font-medium">{conflict.title}</div>
                                  <div className="text-sm text-gray-600">
                                    {conflict.date} ({conflict.startTime} ~ {conflict.endTime})
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-3 text-center text-gray-500">
                    검색 조건에 맞는 강사가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
