// components/CourseSchedule.tsx
"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { addDays, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, startOfMonth, startOfWeek } from "date-fns";
import { ko } from "date-fns/locale";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { koreanHolidays } from "@/lib/koreanHolidays";
import { useSession } from "next-auth/react";

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
  zoomInviteUrl: string | null;
  location: string | null;
}

// 타입 정의 부분에 출석 관련 인터페이스 추가
interface AttendanceInfo {
  classDateId: string;
  date: string;
  isAttended: boolean;
}

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

// 하단에 추가
function MobileSchedule({
  currentDate,
  setCurrentDate,
  setViewMode,
  classDates,
  courseId,
}: {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  setViewMode: React.Dispatch<React.SetStateAction<"day" | "week" | "month">>;
  classDates: ClassDate[] | undefined;
  courseId: string;
}) {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // 출석 정보 조회
  const { data: attendanceData } = useQuery({
    queryKey: ["userAttendance", courseId],
    queryFn: async () => {
      const res = await axios.get(`/api/user/attendance?courseId=${courseId}`);
      return res.data as AttendanceInfo[];
    },
    enabled: !!courseId,
  });

  // 날짜별 수업 및 출석 정보 매핑
  const classDateMap = useMemo(() => {
    const map = new Map<string, { hasClass: boolean; classDates: ClassDate[]; hasAttendance: boolean }>();

    // 모든 수업 날짜 정보 매핑
    classDates?.forEach((cd) => {
      const dateKey = format(new Date(cd.date), "yyyy-MM-dd");
      if (!map.has(dateKey)) {
        map.set(dateKey, { hasClass: true, classDates: [cd], hasAttendance: false });
      } else {
        const entry = map.get(dateKey)!;
        entry.classDates.push(cd);
      }
    });

    // 출석 정보 매핑
    attendanceData?.forEach((attendance) => {
      const dateKey = format(new Date(attendance.date), "yyyy-MM-dd");
      if (map.has(dateKey)) {
        const entry = map.get(dateKey)!;
        entry.hasAttendance = true;
      }
    });

    return map;
  }, [classDates, attendanceData]);

  // 현재 날짜와 시간
  const now = new Date();

  return (
    <div className="mt-4 rounded-lg border bg-white px-2 py-4 shadow-sm sm:hidden">
      <h3 className="mb-4 text-center text-lg font-semibold">{format(currentDate, "yyyy년 MM월", { locale: ko })}</h3>

      <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium">
        {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
          <div key={idx} className={clsx(idx === 0 && "text-red-500", idx === 6 && "text-blue-500")}>
            {day}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const dayInfo = classDateMap.get(dateStr);
          const hasClass = !!dayInfo?.hasClass;
          const isToday = isSameDay(day, new Date());
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isHoliday = koreanHolidays.includes(dateStr);

          // 수업이 있는 날짜에 대해 수업 종료 시간이 지났는지 확인
          let isClassEnded = false;
          let showAttendanceStatus = false;

          if (hasClass && isCurrentMonth) {
            const classDatesForDay = dayInfo.classDates;
            // 오늘 날짜의 모든 수업이 끝났는지 확인
            isClassEnded = classDatesForDay.every((cd) => {
              if (!cd.endTime) return false;
              const endTimeDate = new Date(cd.date);
              const [hours, minutes] = cd.endTime.split(":").map(Number);
              endTimeDate.setHours(hours, minutes, 0, 0);
              return now > endTimeDate;
            });

            // 수업이 끝났을 때만 출석 상태 표시
            showAttendanceStatus = isClassEnded;
          }

          return (
            <div
              key={idx}
              onClick={() => {
                setCurrentDate(day);
                setViewMode("day");
              }}
              className={clsx(
                "flex aspect-square cursor-pointer flex-col items-center justify-between gap-1.5 rounded-md p-1 text-sm",
                isToday && "animate-pulse border-2 bg-blue-100 font-bold",
                hasClass && !showAttendanceStatus && "bg-green-100",
                !isCurrentMonth && "text-gray-400",
                isHoliday && "font-semibold text-red-500",
                day.getDay() === 0 && isCurrentMonth && "text-red-500",
                day.getDay() === 6 && "text-blue-500", // 토요일만 파란색
                // 출석 상태에 따른 스타일
                showAttendanceStatus && dayInfo?.hasAttendance && "border-2 border-green-500 bg-green-100",
                showAttendanceStatus && !dayInfo?.hasAttendance && "border-2 border-red-500 bg-red-100",
              )}>
              <div>{format(day, "d")}</div>

              {/* 출석 상태 표시 */}
              <div className="flex h-1.5 items-center justify-center">
                {showAttendanceStatus ? (
                  dayInfo?.hasAttendance ? (
                    <div className="h-3 w-3 rounded-full border-2 border-green-500" />
                  ) : (
                    <div className="text-xs font-bold text-red-500">X</div>
                  )
                ) : (
                  hasClass && <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function CourseSchedule({ courseId, zoomInviteUrl, location }: CourseScheduleProps) {
  const { status, data } = useSession();
  console.log("Role:", data?.user?.role);

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

  // 출석 정보 조회
  const { data: attendanceData } = useQuery({
    queryKey: ["userAttendance", courseId],
    queryFn: async () => {
      const res = await axios.get(`/api/user/attendance?courseId=${courseId}`);
      return res.data as AttendanceInfo[];
    },
    enabled: !!courseId,
  });

  // 강좌 ID를 기반으로 색상 맵 생성
  const courseColorMap = useMemo(() => {
    const colorMap = new Map<string, (typeof courseColorPalette)[0]>();

    classDates?.forEach((classDate) => {
      if (!colorMap.has(classDate.course.id)) {
        const colorIndex = colorMap.size % courseColorPalette.length;
        colorMap.set(classDate.course.id, courseColorPalette[colorIndex]);
      }
    });

    return colorMap;
  }, [classDates]);

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

  // 시작/종료 시간을 분 단위로 변환하는 함수
  const timeToMinutes = (timeString: string | null): number => {
    if (!timeString) return 0;
    const [hours, minutes] = timeString.split(":").map(Number);
    return hours * 60 + minutes;
  };

  // 날짜 셀을 더블 클릭했을 때 해당 날짜로 이동하고 일간 보기로 전환하는 함수 추가
  const handleDateDoubleClick = (day: Date) => {
    setCurrentDate(day);
    setViewMode("day");
  };

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

    // renderDayView 함수 내부의 해당 부분을 다음과 같이 수정합니다
    return (
      <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
        <h3 className={`mb-4 text-xl font-medium ${getTitleStyle()}`}>
          {format(currentDate, "yyyy년 MM월 dd일 (EEEE)", { locale: ko })}
          {isHoliday && " (공휴일)"}
        </h3>

        {isLoading ? (
          <div className="p-6 text-center">불러오는 중...</div>
        ) : (
          // 높이 고정값을 제거하고 스크롤 가능하도록 수정
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

              {/* 강의 블록 */}
              {filteredClassDates?.map((classDate) => {
                const courseColor = getCourseColor(classDate.course.id);
                const position = calculateCoursePosition(classDate);

                return (
                  <button
                    key={classDate.id}
                    className={`absolute left-0 z-0 w-full rounded-md border ${courseColor.border} ${courseColor.bg} ${location === "online" ? "cursor-pointer" : "pointer-events-none cursor-not-allowed opacity-70"} px-3 py-1 shadow-sm transition-all hover:z-10 hover:shadow-md`}
                    onClick={() => {
                      // 수업 시작 시간을 Date 객체로 변환
                      const classDate_obj = new Date(classDate.date);
                      const [hours, minutes] = (classDate.startTime || "00:00").split(":").map(Number);
                      classDate_obj.setHours(hours, minutes, 0, 0);

                      // 수업 종료 시간을 Date 객체로 변환
                      const classEndDate_obj = new Date(classDate.date);
                      const [endHours, endMinutes] = (classDate.endTime || "00:00").split(":").map(Number);
                      classEndDate_obj.setHours(endHours, endMinutes, 0, 0);

                      // 현재 시간 가져오기
                      const currentTime = new Date();

                      // 수업 종료 시간이 지났는지 확인
                      if (currentTime > classEndDate_obj) {
                        // 수업 시간이 지났음
                        window.alert("수강 시간이 지났습니다.");
                        return;
                      }

                      // 수업 시작 15분 전 시간 계산
                      const fifteenMinutesBeforeClass = new Date(classDate_obj);
                      fifteenMinutesBeforeClass.setMinutes(fifteenMinutesBeforeClass.getMinutes() - 15);

                      // 현재 시간이 수업 시작 15분 전보다 이전인지 확인
                      if (currentTime < fifteenMinutesBeforeClass) {
                        // 아직 수업 참여 불가능
                        window.alert("아직 수업이 시작되지 않았습니다.");
                        return;
                      }

                      // 수업 참여 가능
                      const confirmed = window.confirm("수업에 참여하시겠습니까?");
                      if (confirmed) {
                        // 출석 체크 API 호출
                        axios
                          .post("/api/user/attendance", {
                            classDateId: classDate.id,
                            courseId: classDate.course.id,
                          })
                          .then((response) => {
                            if (response.data.isAttended) {
                              window.alert("출석이 완료되었습니다.");
                            } else {
                              window.alert("출석은 처리되었지만, 출석 인정 시간이 아닙니다.");
                            }
                            // 화상 수업 참여 (Zoom URL 열기)
                            window.open(zoomInviteUrl, "_blank");
                          })
                          .catch((error) => {
                            console.error("출석 체크 실패:", error);
                            window.alert("출석 체크에 실패했습니다.");
                            // 오류가 발생해도 수업에는 참여할 수 있도록 함
                            window.open(zoomInviteUrl, "_blank");
                          });
                      }
                    }}
                    style={{
                      top: position.top,
                      height: position.height,
                      minHeight: "20px",
                    }}>
                    <h4 className={`font-medium ${courseColor.text} truncate`}>{classDate.course.title}</h4>
                    {parseFloat(position.height) > 3 && (
                      <>
                        <p className="truncate text-xs text-gray-600">{classDate.course.description}</p>
                        <div className="mt-1 text-xs text-gray-500">
                          {classDate.startTime} - {classDate.endTime}
                        </div>
                      </>
                    )}
                  </button>
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
              const dateKey = format(day, "yyyy-MM-dd");
              const isHoliday = koreanHolidays.includes(dateKey);
              const dayCourses = classDates
                ?.filter((classDate) => {
                  // 날짜가 같은지 확인
                  const classDateObj = new Date(classDate.date);
                  return isSameDay(classDateObj, day);
                })
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
                      "mb-1 rounded-t p-1 text-center text-sm",
                      isSameDay(day, new Date()) ? "bg-blue-100 font-bold" : "bg-gray-100",
                      isHoliday ? "font-semibold text-red-500" : "",
                      day.getDay() === 0 && "text-red-500", // 일요일
                      day.getDay() === 6 && "text-blue-500", // 토요일
                    )}>
                    <div>{format(day, "E", { locale: ko })}</div>
                    <div>{format(day, "d")}</div>
                  </div>

                  <div className="p-1">
                    {dayCourses?.map((classDate) => {
                      const courseColor = getCourseColor(classDate.course.id);
                      return (
                        <div
                          key={classDate.id}
                          className={`mb-2 cursor-pointer rounded px-1 py-0.5 ${courseColor.bg} ${courseColor.text} ${isSameDay(day, new Date()) && "animate-pulse border-2"}`}
                          onClick={() => handleDateDoubleClick(day)}>
                          <div className="truncate font-medium">{classDate.course.title}</div>
                          <div className="text-gray-500">
                            {classDate.startTime} - {classDate.endTime}
                          </div>
                        </div>
                      );
                    })}
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
    const now = new Date(); // 현재 시간 추가

    // 날짜별 수업 그룹화
    const classDatesByDay = new Map<string, ClassDate[]>();

    classDates?.forEach((classDate) => {
      const dateObj = new Date(classDate.date);
      const dateKey = format(dateObj, "yyyy-MM-dd");

      if (!classDatesByDay.has(dateKey)) {
        classDatesByDay.set(dateKey, []);
      }

      classDatesByDay.get(dateKey)?.push(classDate);
    });

    // 출석 정보 그룹화 (classDateId를 키로 사용)
    const attendanceByClassDateId = new Map<string, boolean>();
    attendanceData?.forEach((attendance) => {
      attendanceByClassDateId.set(attendance.classDateId, attendance.isAttended);
    });

    return (
      <div className="mt-4 rounded-lg border bg-white p-4 shadow-sm">
        <h3 className="mb-4 text-xl font-medium">{format(currentDate, "yyyy년 MM월", { locale: ko })}</h3>

        {isLoading ? (
          <div className="p-6 text-center">불러오는 중...</div>
        ) : (
          <div className="grid grid-cols-7 gap-2">
            {/* 요일 헤더 */}
            {["일", "월", "화", "수", "목", "금", "토"].map((day, index) => (
              <div
                key={index}
                className={clsx(
                  "p-2 text-center font-medium",
                  index === 0 && "text-red-500", // 일요일
                  index === 6 && "text-blue-500", // 토요일
                )}>
                {day}
              </div>
            ))}

            {/* 날짜 */}
            {days.map((day, idx) => {
              const isCurrentMonth = day.getMonth() === currentDate.getMonth();
              const isToday = isSameDay(day, new Date());
              const dateKey = format(day, "yyyy-MM-dd");
              const isHoliday = koreanHolidays.includes(dateKey);
              const dayClassDates = (classDatesByDay.get(dateKey) || []).sort((a, b) => {
                if (!a.startTime) return 1;
                if (!b.startTime) return -1;
                return a.startTime.localeCompare(b.startTime);
              });

              // 최대 3개까지만 표시하고 나머지는 +N 형태로 보여줌
              const visibleEvents = dayClassDates.slice(0, 3);
              const remainingCount = dayClassDates.length - visibleEvents.length;

              return (
                <div
                  key={idx}
                  className={clsx(
                    "min-h-[100px] cursor-pointer rounded-md border border-gray-400 p-1",
                    !isCurrentMonth && "bg-gray-50 text-gray-400",
                    isToday && "animate-pulse border-[3px] border-green-600 bg-blue-50 font-bold",
                    dayClassDates.length > 0 && isCurrentMonth && (isToday ? "bg-green-100" : now > day ? "bg-gray-200" : "bg-green-100"), // 이전 수업일 gray
                    day.getDay() === 0 && isCurrentMonth && "text-red-500", // 일요일
                    day.getDay() === 6 && isCurrentMonth && "text-blue-500", // 토요일
                    isHoliday && isCurrentMonth && "font-semibold text-red-500", // 공휴일
                  )}
                  onClick={() => handleDateDoubleClick(day)}>
                  <div className={clsx("mb-1 text-right", isToday && "text-blue-600")}>{format(day, "d")}</div>
                  <div className="space-y-1">
                    {visibleEvents.map((classDate) => {
                      const courseColor = getCourseColor(classDate.course.id);

                      // 각 수업의 종료 시간 객체 생성
                      const endTimeDate = new Date(classDate.date);
                      if (classDate.endTime) {
                        const [hours, minutes] = classDate.endTime.split(":").map(Number);
                        endTimeDate.setHours(hours, minutes, 0, 0);
                      }

                      // 수업이 이미 종료되었는지 확인
                      const isClassEnded = now > endTimeDate;

                      // 출석 여부 확인
                      const hasAttendance = attendanceByClassDateId.has(classDate.id);
                      const isAttended = attendanceByClassDateId.get(classDate.id);

                      // 출석 상태 메시지 표시 조건
                      let statusText = null;
                      if (isClassEnded) {
                        if (hasAttendance && isAttended) {
                          statusText = "출석 완료 ✅";
                        } else if (!hasAttendance || !isAttended) {
                          statusText = "결석 ❌";
                        }
                      }

                      return (
                        <div
                          key={classDate.id}
                          className={clsx(
                            "truncate rounded-sm px-1 py-0.5 text-xs",
                            statusText === "출석 완료 ✅"
                              ? "border border-green-400 bg-green-200 text-[1rem] text-green-800"
                              : statusText === "결석 ❌"
                                ? "border border-red-400 bg-red-200 text-[1rem] text-red-800"
                                : `${courseColor.bg} ${courseColor.text}`,
                          )}>
                          {statusText || `${classDate.startTime} ${classDate.course.title}`}
                        </div>
                      );
                    })}
                    {remainingCount > 0 && (
                      <div className="rounded-sm bg-gray-100 px-1 py-0.5 text-center text-xs text-gray-800">+{remainingCount}개 더</div>
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

  return (
    <div className="rounded-lg bg-gray-50 p-4">
      {/* 상단 네비게이션 */}
      <div className="mb-4 flex gap-2 sm:items-center sm:justify-between">
        {/* ✅ 모바일 보기 전환 버튼 */}
        <div className="flex w-full flex-col gap-2 sm:hidden">
          <div className="flex justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("month")}
                className={clsx(
                  "rounded-md px-2 py-1 text-sm",
                  viewMode === "month" ? "bg-blue-500 text-white" : "border border-gray-300 bg-white text-gray-700",
                )}>
                월
              </button>
              <button
                onClick={() => setViewMode("day")}
                className={clsx(
                  "rounded-md px-2 py-1 text-sm",
                  viewMode === "day" ? "bg-blue-500 text-white" : "border border-gray-300 bg-white text-gray-700",
                )}>
                일
              </button>
            </div>
          </div>
        </div>

        {/* ✅ 데스크탑 전용 보기 전환 버튼 */}
        <div className="hidden space-x-2 sm:flex">
          <button
            onClick={() => setViewMode("month")}
            className={clsx(
              "rounded-md px-3 py-1 text-sm",
              viewMode === "month" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100",
            )}>
            월
          </button>
          <button
            onClick={() => setViewMode("week")}
            className={clsx(
              "rounded-md px-3 py-1 text-sm",
              viewMode === "week" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100",
            )}>
            주
          </button>
          <button
            onClick={() => setViewMode("day")}
            className={clsx(
              "rounded-md px-3 py-1 text-sm",
              viewMode === "day" ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-100",
            )}>
            일
          </button>
        </div>

        {/* 날짜 이동 버튼은 그대로 유지 */}
        <div className="flex items-center space-x-2">
          <button onClick={() => moveDate("prev")} className="rounded p-1 hover:bg-gray-200">
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => setCurrentDate(new Date())} className="min-w-14 rounded-md bg-white px-3 py-1 text-sm hover:bg-gray-100">
            오늘
          </button>
          <button onClick={() => moveDate("next")} className="rounded p-1 hover:bg-gray-200">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* ✅ 모바일 월간 보기: 월간 보기 상태일 때만 보임 */}
      {viewMode === "month" && (
        <MobileSchedule
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          setViewMode={setViewMode}
          classDates={classDates}
          courseId={courseId}
        />
      )}

      {/* ✅ 일간 보기: 모바일 + PC 공통 */}
      {viewMode === "day" && <div className="block sm:block">{renderDayView()}</div>}

      {/* ✅ 데스크탑용 주/월 보기 */}
      {viewMode !== "day" && (
        <div className="hidden sm:block">
          {viewMode === "week" && renderWeekView()}
          {viewMode === "month" && renderMonthView()}
        </div>
      )}
    </div>
  );
}
