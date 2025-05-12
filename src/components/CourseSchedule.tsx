"use client";

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { format, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isWithinInterval, isSameDay } from "date-fns";
import { ko } from "date-fns/locale";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { koreanHolidays } from "@/lib/koreanHolidays";

// 타입 정의
interface ClassDate {
  id: string;
  date: string;
  dayOfWeek: string;
  startTime: string | null;
  endTime: string | null;
  course: {
    id: string;
    title: string;
    description?: string;
  };
}

interface CourseScheduleProps {
  courseId: string;
}

// 일정 색상 팔레트 정의
const scheduleColorPalette = [
  { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-200" },
  { bg: "bg-green-100", text: "text-green-800", border: "border-green-200" },
  { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-200" },
  { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-200" },
  { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-200" },
];

// 모바일 달력 컴포넌트
function MobileSchedule({
  currentDate,
  setCurrentDate,
  setViewMode,
  classDates,
}: {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  setViewMode: React.Dispatch<React.SetStateAction<"day" | "week" | "month">>;
  classDates: ClassDate[] | undefined;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const classDateMap = useMemo(() => {
    const map = new Set<string>();
    classDates?.forEach((cd) => {
      map.add(format(new Date(cd.date), "yyyy-MM-dd"));
    });
    return map;
  }, [classDates]);

  return (
    <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm sm:hidden">
      <h3 className="mb-4 text-center text-lg font-semibold">{format(currentDate, "yyyy년 MM월", { locale: ko })}</h3>

      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
          <div key={idx} className={clsx(idx === 0 && "text-red-500", idx === 6 && "text-blue-500")}>
            {day}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const hasClass = classDateMap.has(dateStr);
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isHoliday = koreanHolidays.includes(dateStr);

          return (
            <div
              key={idx}
              onClick={() => {
                setCurrentDate(day);
                setViewMode("day");
              }}
              className={clsx(
                "flex aspect-square cursor-pointer flex-col items-center justify-between gap-1.5 rounded-md p-1 text-sm",
                isToday && "animate-pulse bg-blue-100 font-bold",
                !isCurrentMonth && "text-gray-400",
                isHoliday && "font-semibold text-red-500",
                day.getDay() === 0 && isCurrentMonth && "text-red-500",
                day.getDay() === 6 && "text-blue-500", // 토요일만 파란색
              )}>
              <div>{format(day, "d")}</div>
              <div className="h-1.5">{hasClass && <div className="h-1.5 w-1.5 rounded-full bg-green-500" />}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CourseSchedule({ courseId }: CourseScheduleProps) {
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("month");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // 수업 일정 조회 (ClassDate 모델 사용)
  const { data: classDates, isLoading } = useQuery({
    queryKey: ["courseSchedule", courseId],
    queryFn: async () => {
      const res = await axios.get(`/api/admin/courses/course-schedule?courseId=${courseId}`);
      return res.data as ClassDate[];
    },
    enabled: !!courseId,
  });

  // 시작/종료 시간을 분 단위로 변환하는 함수
  const timeToMinutes = (timeString: string | null): number => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
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

  // 날짜 셀을 더블 클릭했을 때 해당 날짜로 이동하고 일간 보기로 전환하는 함수
  const handleDateDoubleClick = (day: Date) => {
    setCurrentDate(day);
    setViewMode("day");
  };

  // 월간 데이터 계산을 위한 필요한 값들
  const monthStart = useMemo(() => startOfMonth(currentDate), [currentDate]);
  const monthEnd = useMemo(() => endOfMonth(currentDate), [currentDate]);
  const startDate = useMemo(() => startOfWeek(monthStart, { weekStartsOn: 0 }), [monthStart]);
  const endDate = useMemo(() => endOfWeek(monthEnd, { weekStartsOn: 0 }), [monthEnd]);
  const monthDays = useMemo(() => eachDayOfInterval({ start: startDate, end: endDate }), [startDate, endDate]);

  // 월간 수업 분류 - 컴포넌트 최상위 레벨로 이동
  const monthClassDates = useMemo(() => {
    if (!classDates) return {};

    const result: Record<string, ClassDate[]> = {};

    monthDays.forEach((day) => {
      const dateStr = format(day, "yyyy-MM-dd");
      result[dateStr] = classDates.filter((classDate) => {
        const classDateObj = new Date(classDate.date);
        return isSameDay(classDateObj, day);
      });
    });

    return result;
  }, [classDates, monthDays]);

  // 일간 보기 렌더링
  const renderDayView = () => {
    const filteredClassDates = classDates
      ?.filter((classDate) => {
        // 날짜가 같은지 확인
        const classDateObj = new Date(classDate.date);
        return isSameDay(classDateObj, currentDate);
      })
      .sort((a, b) => {
        // 시작 시간이 없는 경우 처리
        if (!a.startTime) return 1;
        if (!b.startTime) return -1;

        return a.startTime.localeCompare(b.startTime);
      });

    // 24시간 시간대 생성
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // 강의의 위치 및 높이 계산
    const calculateCoursePosition = (classDate: ClassDate) => {
      const startMinutes = timeToMinutes(classDate.startTime);
      const endMinutes = timeToMinutes(classDate.endTime);
      const duration = endMinutes - startMinutes;

      // 시작 시간의 상대적 위치 (하루 = 1440분)
      const top = (startMinutes / 1440) * 200;
      // 강의 길이의 상대적 높이
      const height = (duration / 1440) * 100;

      return {
        top: `${top}%`,
        height: `${height}%`,
      };
    };

    // 해당 날짜가 주말인지 공휴일인지 확인
    const dateKey = format(currentDate, "yyyy-MM-dd");
    const isHoliday = koreanHolidays.includes(dateKey);
    const isSunday = currentDate.getDay() === 0;
    const isSaturday = currentDate.getDay() === 6;

    // 제목 스타일 결정
    const getTitleStyle = () => {
      if (isHoliday || isSunday) return "text-red-500";
      if (isSaturday) return "text-blue-500";
      return "";
    };

    return (
      <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
        <h3 className={`mb-4 text-xl font-medium ${getTitleStyle()}`}>
          {format(currentDate, "yyyy년 MM월 dd일 (EEEE)", { locale: ko })}
          {isHoliday && " (공휴일)"}
        </h3>

        {isLoading ? (
          <div className="p-6 text-center">불러오는 중...</div>
        ) : (
          <div className="relative flex h-[600px] overflow-y-auto">
            {/* 시간 눈금 */}
            <div className="w-16 flex-shrink-0 pr-2 text-right">
              {hours.map((hour) => (
                <div key={hour} className="relative h-[50px]">
                  <span className="absolute -top-2 right-0 text-xs text-gray-500">
                    {hour === 0 ? "오전 12시" : hour < 12 ? `오전 ${hour}시` : hour === 12 ? "오후 12시" : `오후 ${hour - 12}시`}
                  </span>
                </div>
              ))}
            </div>

            {/* 시간표 그리드 및 강의 */}
            <div className={`relative flex-grow border-l border-gray-200 ${isHoliday || isSunday ? "bg-red-50" : isSaturday ? "bg-blue-50" : ""}`}>
              {/* 시간대 배경 */}
              {hours.map((hour) => (
                <div
                  key={hour}
                  className={`h-[50px] border-b border-gray-100 ${hour % 2 === 0 ? (isHoliday || isSunday ? "bg-red-100/30" : isSaturday ? "bg-blue-100/30" : "bg-gray-100") : ""}`}
                />
              ))}

              {/* 현재 시간 표시선 */}
              <div
                className="absolute left-0 z-10 w-full border-t-2 border-red-400"
                style={{
                  top: `${((new Date().getHours() * 60 + new Date().getMinutes()) / 1440) * 1200}px`,
                }}>
                <div className="relative">
                  <span className="absolute -top-2 -left-16 rounded bg-red-400 px-1 text-xs text-white">현재</span>
                </div>
              </div>

              {/* 수업 일정 블록 */}
              {filteredClassDates?.map((classDate) => {
                const scheduleColor = scheduleColorPalette[0]; // 같은 강좌에 속한 일정이므로 색상 통일
                const position = calculateCoursePosition(classDate);

                return (
                  <div
                    key={classDate.id}
                    className={`absolute right-0 left-0 z-10 mx-1 rounded-md border ${scheduleColor.border} ${scheduleColor.bg} p-2 shadow-sm`}
                    style={{
                      top: position.top,
                      height: position.height,
                    }}>
                    <div className={`text-sm font-medium ${scheduleColor.text}`}>
                      {classDate.startTime && classDate.endTime && `${classDate.startTime} - ${classDate.endTime}`}
                    </div>
                    <div className="text-xs">{classDate.course.title}</div>
                  </div>
                );
              })}

              {filteredClassDates?.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <p className="text-gray-500">이 날짜에 예정된 수업이 없습니다.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // 주간 보기 렌더링
  const renderWeekView = () => {
    const startOfWeekDate = startOfWeek(currentDate, { weekStartsOn: 0 });
    const endOfWeekDate = endOfWeek(currentDate, { weekStartsOn: 0 });
    const days = eachDayOfInterval({ start: startOfWeekDate, end: endOfWeekDate });

    // 주간 수업 분류
    const weekClassDates = useMemo(() => {
      if (!classDates) return {};

      const result: Record<string, ClassDate[]> = {};

      days.forEach((day) => {
        const dateStr = format(day, "yyyy-MM-dd");
        result[dateStr] = classDates.filter((classDate) => {
          const classDateObj = new Date(classDate.date);
          return isSameDay(classDateObj, day);
        });
      });

      return result;
    }, [classDates, days]);

    // 각 요일에 대한 스타일 가져오기
    const getDayHeaderStyle = (day: Date) => {
      const dateStr = format(day, "yyyy-MM-dd");
      const isHoliday = koreanHolidays.includes(dateStr);
      const isSunday = day.getDay() === 0;
      const isSaturday = day.getDay() === 6;

      if (isHoliday || isSunday) return "text-red-500";
      if (isSaturday) return "text-blue-500";
      return "";
    };

    return (
      <div className="mt-4 hidden rounded-lg border bg-white p-4 shadow-sm sm:block">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dailyClasses = weekClassDates[dateStr] || [];
            const isToday = isSameDay(day, new Date());
            const headerStyle = getDayHeaderStyle(day);
            const isHoliday = koreanHolidays.includes(dateStr);

            return (
              <div
                key={idx}
                className={`min-h-[150px] rounded-md border p-2 ${isToday ? "border-blue-400 bg-blue-50" : "border-gray-200"} ${isHoliday ? "bg-red-50" : day.getDay() === 0 ? "bg-red-50" : day.getDay() === 6 ? "bg-blue-50" : ""}`}
                onDoubleClick={() => handleDateDoubleClick(day)}>
                <div className={`mb-2 text-center font-medium ${headerStyle}`}>
                  {format(day, "MM/dd (EEE)", { locale: ko })}
                  {isHoliday && " (공휴일)"}
                </div>

                <div className="space-y-1">
                  {dailyClasses.length === 0 ? (
                    <div className="text-center text-xs text-gray-400">수업 없음</div>
                  ) : (
                    dailyClasses
                      .sort((a, b) => {
                        if (!a.startTime) return 1;
                        if (!b.startTime) return -1;
                        return a.startTime.localeCompare(b.startTime);
                      })
                      .map((classDate) => (
                        <div
                          key={classDate.id}
                          className={`rounded-md border ${scheduleColorPalette[0].border} ${scheduleColorPalette[0].bg} p-1 text-xs ${scheduleColorPalette[0].text}`}>
                          <div className="font-medium">
                            {classDate.startTime} {classDate.endTime && `- ${classDate.endTime}`}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
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

    return (
      <div className="mt-4 hidden rounded-lg border bg-white p-4 shadow-sm sm:block">
        <div className="grid grid-cols-7 text-center">
          {["일", "월", "화", "수", "목", "금", "토"].map((dayName, idx) => (
            <div key={idx} className={`mb-2 font-medium ${idx === 0 ? "text-red-500" : idx === 6 ? "text-blue-500" : ""}`}>
              {dayName}
            </div>
          ))}

          {days.map((day, idx) => {
            const dateStr = format(day, "yyyy-MM-dd");
            const dailyClasses = monthClassDates[dateStr] || [];
            const isToday = isSameDay(day, new Date());
            const isCurrentMonth = day.getMonth() === currentDate.getMonth();
            const isHoliday = koreanHolidays.includes(dateStr);

            return (
              <div
                key={idx}
                className={`min-h-[100px] border p-1 ${isToday ? "border-blue-400 bg-blue-50" : "border-gray-200"} ${!isCurrentMonth ? "bg-gray-50" : ""}`}
                onDoubleClick={() => handleDateDoubleClick(day)}>
                <div
                  className={clsx(
                    "mb-1 text-right text-sm font-medium",
                    !isCurrentMonth && "text-gray-400",
                    isHoliday && "text-red-500",
                    !isHoliday && day.getDay() === 0 && "text-red-500",
                    day.getDay() === 6 && "text-blue-500",
                  )}>
                  {format(day, "d")}
                </div>

                <div className="space-y-1">
                  {dailyClasses.slice(0, 3).map((classDate) => (
                    <div key={classDate.id} className="rounded-sm bg-green-100 px-1 py-0.5 text-xs text-green-800">
                      {classDate.startTime}
                    </div>
                  ))}
                  {dailyClasses.length > 3 && <div className="text-xs text-gray-500">+{dailyClasses.length - 3}개 더</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">수업 일정</h2>

        <div className="flex items-center space-x-4">
          <div className="flex space-x-1">
            <button onClick={() => moveDate("prev")} className="rounded-md border p-1 text-gray-700 hover:bg-gray-100">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => moveDate("next")} className="rounded-md border p-1 text-gray-700 hover:bg-gray-100">
              <ChevronRight size={16} />
            </button>
          </div>

          <button onClick={() => setCurrentDate(new Date())} className="rounded-md border bg-white px-2 py-1 text-sm text-gray-700 hover:bg-gray-100">
            오늘
          </button>

          <div className="flex rounded-md border">
            <button
              onClick={() => setViewMode("day")}
              className={`px-3 py-1 text-sm ${viewMode === "day" ? "bg-blue-100 font-medium text-blue-800" : "bg-white text-gray-700 hover:bg-gray-100"}`}>
              일간
            </button>
            <button
              onClick={() => setViewMode("week")}
              className={`px-3 py-1 text-sm ${viewMode === "week" ? "bg-blue-100 font-medium text-blue-800" : "bg-white text-gray-700 hover:bg-gray-100"}`}>
              주간
            </button>
            <button
              onClick={() => setViewMode("month")}
              className={`px-3 py-1 text-sm ${viewMode === "month" ? "bg-blue-100 font-medium text-blue-800" : "bg-white text-gray-700 hover:bg-gray-100"}`}>
              월간
            </button>
          </div>
        </div>
      </div>

      {isLoading && <div className="mt-4 rounded-md border bg-white p-6 text-center">수업 일정을 불러오는 중...</div>}

      {!isLoading && viewMode === "day" && renderDayView()}
      {!isLoading && viewMode === "week" && renderWeekView()}
      {!isLoading && viewMode === "month" && renderMonthView()}

      {/* 모바일 달력 뷰 */}
      <MobileSchedule currentDate={currentDate} setCurrentDate={setCurrentDate} setViewMode={setViewMode} classDates={classDates} />
    </div>
  );
}
