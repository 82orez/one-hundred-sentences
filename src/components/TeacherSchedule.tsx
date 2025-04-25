// components/TeacherSchedule.tsx
"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

// 타입 정의
interface Course {
  id: string;
  title: string;
  description?: string;
  startDate: string | null;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  duration: string | null;
  scheduleMonday: boolean;
  scheduleTuesday: boolean;
  scheduleWednesday: boolean;
  scheduleThursday: boolean;
  scheduleFriday: boolean;
  scheduleSaturday: boolean;
  scheduleSunday: boolean;
}

interface TeacherScheduleProps {
  teacherId: string;
}

// 요일 매핑
const dayMapping: { [key: number]: string } = {
  0: "scheduleSunday",
  1: "scheduleMonday",
  2: "scheduleTuesday",
  3: "scheduleWednesday",
  4: "scheduleThursday",
  5: "scheduleFriday",
  6: "scheduleSaturday",
};

// 강좌 색상 팔레트 정의
const courseColorPalette = [
  { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
  { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
  { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
  { bg: "bg-teal-100", text: "text-teal-800", border: "border-teal-200" },
  { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-200" },
  { bg: "bg-red-100", text: "text-red-800", border: "border-red-200" },
  { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-200" },
  { bg: "bg-cyan-100", text: "text-cyan-800", border: "border-cyan-200" },
];

export default function TeacherSchedule({ teacherId }: TeacherScheduleProps) {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // 강사 스케줄 조회
  const { data: courses, isLoading } = useQuery({
    queryKey: ["teacherSchedule", teacherId],
    queryFn: async () => {
      const res = await axios.get(`/api/admin/teacher-schedule?teacherId=${teacherId}`);
      return res.data as Course[];
    },
    enabled: !!teacherId,
  });

  // 강좌 ID를 기반으로 색상 맵 생성
  const courseColorMap = useMemo(() => {
    const colorMap = new Map<string, (typeof courseColorPalette)[0]>();

    courses?.forEach((course, index) => {
      const colorIndex = index % courseColorPalette.length;
      colorMap.set(course.id, courseColorPalette[colorIndex]);
    });

    return colorMap;
  }, [courses]);

  // 강좌에 색상 할당
  const getCourseColor = (courseId: string) => {
    return courseColorMap.get(courseId) || courseColorPalette[0];
  };

  // 날짜 이동 함수
  const moveDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);

    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    } else if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }

    setCurrentDate(newDate);
  };

  // 일간 보기 렌더링
  const renderDayView = () => {
    const currentDayOfWeek = currentDate.getDay();
    const currentDayProperty = dayMapping[currentDayOfWeek];

    const filteredCourses = courses
      ?.filter((course) => {
        // 날짜 범위 내에 있는지 확인
        const startDate = course.startDate ? new Date(course.startDate) : null;
        const endDate = course.endDate ? new Date(course.endDate) : null;

        // 시작일과 종료일이 모두 있을 경우 날짜 범위 체크
        if (startDate && endDate) {
          if (currentDate < startDate || currentDate > endDate) {
            return false;
          }
        }

        // 현재 요일이 수업 요일인지 확인
        return course[currentDayProperty as keyof Course];
      }) // 시작 시간 기준으로 정렬
      .sort((a, b) => {
        // 시작 시간이 없는 경우 처리
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;

        return a.startTime.localeCompare(b.startTime);
      });

    // 24시간 시간대 생성
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // 시작/종료 시간을 분 단위로 변환하는 함수
    const timeToMinutes = (timeString: string | null): number => {
      if (!timeString) return 0;
      const [hours, minutes] = timeString.split(":").map(Number);
      return hours * 60 + minutes;
    };

    // 강의의 위치 및 높이 계산
    const calculateCoursePosition = (course: Course) => {
      const startMinutes = timeToMinutes(course.startTime);
      const endMinutes = timeToMinutes(course.endTime);
      const duration = endMinutes - startMinutes;

      // 시작 시간의 상대적 위치 (하루 = 1440분)
      const top = (startMinutes / 1440) * 100;
      // 강의 길이의 상대적 높이
      const height = (duration / 1440) * 100;

      return {
        top: `${top}%`,
        height: `${height}%`,
      };
    };

    return (
      <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-xl font-medium">{format(currentDate, "yyyy년 MM월 dd일 (EEEE)", { locale: ko })}</h3>

        {isLoading ? (
          <div className="p-6 text-center">불러오는 중...</div>
        ) : (
          <div className="relative flex h-[800px]">
            {/* 시간 눈금 */}
            <div className="w-16 flex-shrink-0 pr-2 text-right">
              {hours.map((hour) => (
                <div key={hour} className="relative h-[33.33px]">
                  <span className="absolute -top-2 right-0 text-xs text-gray-500">
                    {hour === 0 ? "오전 12시" : hour < 12 ? `오전 ${hour}시` : hour === 12 ? "오후 12시" : `오후 ${hour - 12}시`}
                  </span>
                </div>
              ))}
            </div>

            {/* 시간표 그리드 및 강의 */}
            <div className="relative flex-grow border-l border-gray-200">
              {/* 시간대 배경 */}
              {hours.map((hour) => (
                <div key={hour} className={`h-[33.33px] border-b border-gray-100 ${hour % 2 === 0 ? "bg-gray-50" : ""}`} />
              ))}

              {/* 현재 시간 표시선 */}
              <div
                className="absolute left-0 z-10 w-full border-t border-red-400"
                style={{
                  top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / 1440) * 100}%`,
                }}>
                <div className="relative">
                  <span className="absolute -top-2 -left-18 rounded bg-red-400 px-1 text-xs text-white">현재</span>
                </div>
              </div>

              {/* 강의 블록 */}
              {filteredCourses?.map((course) => {
                const courseColor = getCourseColor(course.id);
                const position = calculateCoursePosition(course);

                return (
                  <div
                    key={course.id}
                    className={`absolute left-0 z-0 w-full rounded-md border ${courseColor.border} ${courseColor.bg} px-3 py-1 shadow-sm transition-all hover:z-10 hover:shadow-md`}
                    style={{
                      top: position.top,
                      height: position.height,
                      minHeight: "20px",
                    }}>
                    <h4 className={`font-medium ${courseColor.text} truncate`}>{course.title}</h4>
                    {parseFloat(position.height) > 3 && (
                      <>
                        <p className="truncate text-xs text-gray-600">{course.description}</p>
                        <div className="mt-1 text-xs text-gray-500">
                          {course.startTime} - {course.endTime}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 주간 보기 렌더링
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // 일요일부터 시작
    const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
    const days = [];

    for (let i = 0; i < 7; i++) {
      days.push(addDays(weekStart, i));
    }

    return (
      <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-xl font-medium">
          {format(weekStart, "yyyy년 MM월 dd일", { locale: ko })} ~ {format(weekEnd, "MM월 dd일", { locale: ko })}
        </h3>

        {isLoading ? (
          <div className="p-6 text-center">불러오는 중...</div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              const dayOfWeek = day.getDay();
              const dayProperty = dayMapping[dayOfWeek];

              const dayCourses = courses
                ?.filter((course) => {
                  // 날짜 범위 내에 있는지 확인
                  const startDate = course.startDate ? new Date(course.startDate) : null;
                  const endDate = course.endDate ? new Date(course.endDate) : null;

                  // 시작일과 종료일이 모두 있을 경우 날짜 범위 체크
                  if (startDate && endDate) {
                    if (day < startDate || day > endDate) {
                      return false;
                    }
                  }

                  // 현재 요일이 수업 요일인지 확인
                  return course[dayProperty as keyof Course];
                }) // 시작 시간 기준으로 정렬
                .sort((a, b) => {
                  // 시작 시간이 없는 경우 처리
                  if (!a.startTime) return 1;
                  if (!b.startTime) return -1;

                  return a.startTime.localeCompare(b.startTime);
                });

              return (
                <div key={index} className="h-full min-h-[120px]">
                  <div
                    className={clsx(
                      "mb-2 rounded-t-md p-1 text-center font-medium",
                      dayOfWeek === 0 ? "bg-red-100 text-red-800" : dayOfWeek === 6 ? "bg-blue-100 text-blue-800" : "bg-gray-100",
                    )}>
                    {format(day, "EEE", { locale: ko })}
                    <div className="text-sm">{format(day, "d")}</div>
                  </div>

                  <div className="overflow-y-auto rounded-b-md border border-gray-200 p-1">
                    {dayCourses?.length ? (
                      <ul className="space-y-1">
                        {dayCourses.map((course) => {
                          const courseColor = getCourseColor(course.id);

                          return (
                            <li key={course.id} className={`rounded ${courseColor.bg} p-1 text-xs`}>
                              <div className={`font-medium ${courseColor.text}`}>{course.title}</div>
                              <div className="text-gray-600">
                                {course.startTime} - {course.endTime}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      <div className="text-center text-xs text-gray-400">수업 없음</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // 월간 보기 렌더링
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = eachDayOfInterval({ start: startDate, end: endDate });

    // 주별로 날짜 배열 나누기
    const weeks = [];
    let week = [];

    for (let i = 0; i < days.length; i++) {
      week.push(days[i]);

      if (week.length === 7) {
        weeks.push(week);
        week = [];
      }
    }

    return (
      <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-xl font-medium">{format(monthStart, "yyyy년 MM월", { locale: ko })}</h3>

        {isLoading ? (
          <div className="p-6 text-center">불러오는 중...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-fixed border-collapse">
              <thead>
                <tr>
                  {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
                    <th key={idx} className={clsx("border p-1 text-center text-sm", idx === 0 ? "text-red-600" : idx === 6 ? "text-blue-600" : "")}>
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weeks.map((week, weekIdx) => (
                  <tr key={weekIdx} className="h-24">
                    {week.map((day, dayIdx) => {
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                      const dayOfWeek = day.getDay();
                      const dayProperty = dayMapping[dayOfWeek];

                      // 이 날짜에 해당하는 강의 찾기
                      const dayCourses = courses
                        ?.filter((course) => {
                          // 날짜 범위 내에 있는지 확인
                          const courseStart = course.startDate ? new Date(course.startDate) : null;
                          const courseEnd = course.endDate ? new Date(course.endDate) : null;

                          // 시작일과 종료일이 모두 있을 경우 날짜 범위 체크
                          if (courseStart && courseEnd) {
                            if (!isWithinInterval(day, { start: courseStart, end: courseEnd })) {
                              return false;
                            }
                          }

                          // 현재 요일이 수업 요일인지 확인
                          return course[dayProperty as keyof Course];
                        }) // 시작 시간 기준으로 정렬
                        .sort((a, b) => {
                          // 시작 시간이 없는 경우 처리
                          if (!a.startTime) return 1;
                          if (!b.startTime) return -1;

                          return a.startTime.localeCompare(b.startTime);
                        });

                      return (
                        <td
                          key={dayIdx}
                          className={clsx(
                            "relative border align-top",
                            isCurrentMonth ? "" : "bg-gray-100",
                            (dayOfWeek === 0 || dayOfWeek === 6) && isCurrentMonth ? "bg-gray-50" : "",
                          )}>
                          <div
                            className={clsx(
                              "p-1 text-right text-sm font-medium",
                              dayOfWeek === 0 ? "text-red-600" : dayOfWeek === 6 ? "text-blue-600" : "",
                              !isCurrentMonth && "text-gray-400",
                            )}>
                            {format(day, "d")}
                          </div>

                          <div className="mt-1 max-h-16 overflow-y-auto p-1">
                            {dayCourses?.map((course) => {
                              const courseColor = getCourseColor(course.id);

                              return (
                                <div key={course.id} className={`mb-1 rounded ${courseColor.bg} px-1 py-0.5 text-xs font-medium ${courseColor.text}`}>
                                  {course.title}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">강의 스케줄</h2>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("day")}
            className={clsx(
              "rounded-md px-3 py-1 text-sm font-medium",
              viewMode === "day" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300",
            )}>
            일간
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={clsx(
              "rounded-md px-3 py-1 text-sm font-medium",
              viewMode === "week" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300",
            )}>
            주간
          </button>
          <button
            onClick={() => setViewMode("month")}
            className={clsx(
              "rounded-md px-3 py-1 text-sm font-medium",
              viewMode === "month" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300",
            )}>
            월간
          </button>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <button onClick={() => moveDate("prev")} className="flex items-center rounded-md bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200">
          <ChevronLeft size={16} />
          {viewMode === "day" ? "이전 날" : viewMode === "week" ? "이전 주" : "이전 달"}
        </button>

        <button
          onClick={() => setCurrentDate(new Date())}
          className="rounded-md bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300">
          오늘
        </button>

        <button onClick={() => moveDate("next")} className="flex items-center rounded-md bg-gray-100 px-3 py-1 text-gray-700 hover:bg-gray-200">
          {viewMode === "day" ? "다음 날" : viewMode === "week" ? "다음 주" : "다음 달"}
          <ChevronRight size={16} />
        </button>
      </div>

      {viewMode === "day" && renderDayView()}
      {viewMode === "week" && renderWeekView()}
      {viewMode === "month" && renderMonthView()}
    </div>
  );
}
