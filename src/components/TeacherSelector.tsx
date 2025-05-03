"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { AlertTriangle, CheckCircle, Search, Filter } from "lucide-react";
import clsx from "clsx";

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
  onChange: (teacherId: string) => void;
  startTime: string;
  endTime: string;
  currentCourseId?: string;
}

export default function TeacherSelector({ classDates, selectedTeacherId, onChange, startTime, endTime, currentCourseId }: TeacherSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [nationFilter, setNationFilter] = useState("전체");
  const [subjectFilter, setSubjectFilter] = useState("전체");
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

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
    const isAvailable = !showOnlyAvailable || !conflictData[teacher.id];

    // 현재 선택된 강사는 제외하지 않음
    const notSelected = teacher.id !== selectedTeacherId;

    return matchesSearch && matchesNation && matchesSubject && (isAvailable || teacher.id === selectedTeacherId);
  });

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="mb-2 text-lg font-semibold">현재 선택된 강사</h3>
        {currentTeacher ? (
          <div className="rounded-md border bg-gray-50 p-3">
            <p className="font-medium">
              {currentTeacher.realName} {currentTeacher.nickName && `(${currentTeacher.nickName})`}
            </p>
            <p className="text-sm text-gray-600">
              {currentTeacher.email} | {currentTeacher.nation} | {currentTeacher.subject}
            </p>
          </div>
        ) : (
          <div className="rounded-md border bg-gray-50 p-3">
            <p className="text-gray-500">없음</p>
          </div>
        )}
      </div>

      <div className="mb-4 space-y-2">
        <div className="flex items-center gap-2">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="이름, 이메일, 전화번호로 검색"
            className="w-full rounded-md border p-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1">
            <Filter size={16} className="text-gray-400" />
            <select className="rounded-md border p-2" value={nationFilter} onChange={(e) => setNationFilter(e.target.value)}>
              {nationOptions.map((option: string, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select className="rounded-md border p-2" value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value)}>
              {subjectOptions.map((option: string, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-1">
            <input type="checkbox" checked={showOnlyAvailable} onChange={() => setShowOnlyAvailable(!showOnlyAvailable)} className="rounded" />
            <span className="text-sm">배정 가능한 강사만 보기</span>
          </label>
        </div>
      </div>

      {isLoadingTeachers || isCheckingConflicts ? (
        <div className="py-4 text-center">
          <p>로딩 중...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-md border">
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

                  return (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{teacher.realName}</div>
                          {teacher.nickName && <div className="text-sm text-gray-500">{teacher.nickName}</div>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{teacher.email}</td>
                      <td className="px-4 py-3 text-sm">{teacher.nation}</td>
                      <td className="px-4 py-3 text-sm">{teacher.subject}</td>
                      <td className="px-4 py-3">
                        {hasConflicts ? (
                          <div className="flex items-center">
                            <span className="flex items-center text-red-500">
                              <AlertTriangle size={16} className="mr-1" />
                              <span>⚠️ 이 시간에 다른 강좌 있음</span>
                            </span>
                            {conflicts.length > 0 && (
                              <div className="group relative ml-2">
                                <button className="text-xs text-blue-500 underline">상세보기</button>
                                <div className="absolute top-full left-0 z-10 hidden min-w-[250px] rounded-md border bg-white p-2 shadow-lg group-hover:block">
                                  <h4 className="mb-1 text-sm font-semibold">충돌 강좌:</h4>
                                  <ul className="space-y-1 text-xs">
                                    {conflicts.map((conflict: ConflictingCourse) => (
                                      <li key={conflict.id}>
                                        <p className="font-medium">{conflict.title}</p>
                                        <p className="text-gray-500">
                                          {conflict.date} ({conflict.startTime} ~ {conflict.endTime})
                                        </p>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="flex items-center text-green-500">
                            <CheckCircle size={16} className="mr-1" />
                            <span>✅ 배정 가능</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className={clsx(
                            "rounded-md px-3 py-1 text-sm font-medium",
                            teacher.id === selectedTeacherId
                              ? "bg-blue-100 text-blue-700"
                              : hasConflicts
                                ? "cursor-not-allowed bg-gray-100 text-gray-400"
                                : "bg-blue-50 text-blue-600 hover:bg-blue-100",
                          )}
                          onClick={(e) => {
                            // 이벤트 버블링 중지
                            e.preventDefault();
                            e.stopPropagation();

                            !hasConflicts && onChange(teacher.id);
                          }}
                          disabled={hasConflicts}>
                          {teacher.id === selectedTeacherId ? "선택됨" : "선택"}
                        </button>
                      </td>
                    </tr>
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
