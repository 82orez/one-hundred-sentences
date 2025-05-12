// components/DatePickerCalendarAddOrRemove.tsx
import React, { useState, useEffect } from "react";
import { DayPicker, DayClickEventHandler, Formatters, DayButtonProps } from "react-day-picker";
import { ko } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import toast from "react-hot-toast";
import axios from "axios";
import { koreanHolidays } from "@/lib/koreanHolidays";

interface DatePickerCalendarAddOrRemoveProps {
  selectedDates: Date[];
  onAddDate: (date: Date) => void;
  onRemoveDate: (date: Date) => void;
  minDate?: Date;
  onCancel?: () => void;
  getDayOfWeekName: (dayNumber: number) => string;
  startDate?: Date;
  endDate?: Date;
  startTime?: string; // 시작 시간 추가
  endTime?: string; // 종료 시간 추가
  teacherId?: string; // 강사 ID 추가
  checkScheduleConflict?: (dates: Date[], newDate: Date) => Promise<boolean>; // 충돌 확인 함수 추가
}

const DatePickerCalendarAddOrRemove: React.FC<DatePickerCalendarAddOrRemoveProps> = ({
  selectedDates = [],
  onAddDate,
  onRemoveDate,
  minDate,
  onCancel = () => {},
  getDayOfWeekName,
  startDate,
  endDate,
  startTime,
  endTime,
  teacherId,
  checkScheduleConflict,
}) => {
  // 현재 표시되는 월 상태 추가
  const [month, setMonth] = useState<Date>(new Date());
  const [confirmAction, setConfirmAction] = useState<{
    show: boolean;
    date: Date | null;
    isAdd: boolean;
  }>({
    show: false,
    date: null,
    isAdd: true,
  });

  // 충돌 날짜 및 강좌 정보 상태 추가
  const [conflictDates, setConflictDates] = useState<Map<string, string>>(new Map());

  // selectedDates 변경 감지를 위한 키 값 추가
  const [selectedDatesKey, setSelectedDatesKey] = useState(0);

  // selectedDates가 변경될 때마다 키 값 업데이트
  useEffect(() => {
    setSelectedDatesKey((prev) => prev + 1);
  }, [selectedDates]);

  // 공휴일 배열로 변환
  const holidayDates = koreanHolidays.map((date) => new Date(date));

  // 주말 스타일
  const isSaturday = (date: Date) => {
    return date.getDay() === 6;
  };

  const isSunday = (date: Date) => {
    return date.getDay() === 0;
  };

  const isHoliday = (date: Date) => {
    return holidayDates.some((holiday) => format(holiday, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
  };

  // 충돌 날짜 확인 함수
  const isConflictDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return conflictDates.has(dateStr);
  };

  // 날짜 변경 시 해당 월의 모든 날짜에 대해 충돌 확인
  useEffect(() => {
    if (!teacherId || !checkScheduleConflict) return;

    // 현재 표시 중인 월의 첫날과 마지막 날
    const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
    const lastDay = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    // 모든 날짜를 배열로
    const daysInMonth: Date[] = [];
    let currentDay = new Date(firstDay);

    while (currentDay <= lastDay) {
      daysInMonth.push(new Date(currentDay));
      currentDay.setDate(currentDay.getDate() + 1);
    }

    // 각 날짜에 대해 충돌 확인
    const checkConflicts = async () => {
      const newConflictMap = new Map<string, string>();

      for (const day of daysInMonth) {
        try {
          // 이미 선택된 날짜는 건너뜀
          const dayStr = format(day, "yyyy-MM-dd");
          if (selectedDates.some((d) => format(d, "yyyy-MM-dd") === dayStr)) {
            continue;
          }

          // 충돌 확인
          const tempDates = [...selectedDates];

          if (checkScheduleConflict) {
            const hasConflict = await checkScheduleConflict(tempDates, day);

            if (hasConflict) {
              // 충돌 상세 정보 가져오기 (API 호출)
              try {
                const response = await axios.post("/api/admin/check-teacher-schedule-conflict", {
                  teacherId: teacherId,
                  date: format(day, "yyyy-MM-dd"),
                  startTime: startTime || "00:00",
                  endTime: endTime || "23:59",
                });

                if (response.data.hasConflict && response.data.conflictDetails) {
                  newConflictMap.set(dayStr, `${response.data.conflictDetails.courseTitle} (${response.data.conflictDetails.time})`);
                } else {
                  newConflictMap.set(dayStr, "일정 충돌");
                }
              } catch (error) {
                console.error("충돌 정보 가져오기 오류:", error);
                newConflictMap.set(dayStr, "일정 충돌");
              }
            }
          }
        } catch (error) {
          console.error("충돌 확인 중 오류:", error);
        }
      }

      setConflictDates(newConflictMap);
    };

    checkConflicts();
  }, [month, teacherId, selectedDates, checkScheduleConflict]);

  // 날짜 클릭 핸들러
  const handleDayClick: DayClickEventHandler = async (day) => {
    const dayString = format(day, "yyyy-MM-dd");
    const isDateSelected = selectedDates.some((selectedDate) => format(selectedDate, "yyyy-MM-dd") === dayString);

    // 시작일이면 삭제 불가
    if (startDate && format(startDate, "yyyy-MM-dd") === dayString) {
      toast.error("수업 시작일은 삭제할 수 없습니다.");
      return;
    }

    // 추가: 시작일 이전 날짜는 추가 불가 (이미 선택된 날짜가 아닐 경우에만)
    if (!isDateSelected && startDate && day < startDate) {
      toast.error("수업 시작일 이전의 날짜는 추가할 수 없습니다.");
      return;
    }

    // 날짜를 추가하려고 할 때 충돌 검사 실행
    if (!isDateSelected && checkScheduleConflict) {
      try {
        // 임시 수업 목록 생성 (기존 + 클릭한 일자)
        const tempDates = [...selectedDates, day];

        // 충돌 검사 실행
        const hasConflict = await checkScheduleConflict(tempDates, day);

        if (hasConflict) {
          const conflictInfo = conflictDates.get(dayString) || "다른 강의 일정";
          toast.error(`이 날짜에 다른 강의 일정이 있습니다: ${conflictInfo}`);
          return;
        }
      } catch (error) {
        console.error("스케줄 충돌 검사 중 오류 발생:", error);
        toast.error("일정 충돌 검사 중 오류가 발생했습니다.");
        return;
      }
    }

    setConfirmAction({
      show: true,
      date: day,
      isAdd: !isDateSelected,
    });
  };

  // 확인 액션 처리
  const handleConfirmAction = (confirm: boolean) => {
    if (confirmAction.date) {
      if (confirm) {
        if (confirmAction.isAdd) {
          onAddDate(confirmAction.date);
          toast.success("수업이 추가되었습니다.");
        } else {
          onRemoveDate(confirmAction.date);
          toast.success("수업이 삭제되었습니다.");
        }
      } else {
        // '아니오' 버튼을 클릭한 경우, DayPicker 컴포넌트 강제 업데이트를 위해 빈 객체 설정
        // 이렇게 하면 선택되지 않은 상태로 렌더링됨
        if (confirmAction.isAdd) {
          // 선택을 취소할 때 DayPicker 업데이트를 위한 빈 렌더링 트리거
          const forceUpdate = [...selectedDates];
          // 아무 작업 없이 원래 선택된 날짜들을 유지
        }
      }
    }

    // 확인 대화상자 닫기
    setConfirmAction({
      show: false,
      date: null,
      isAdd: true,
    });
  };

  // 오늘 버튼 클릭 핸들러
  const handleTodayClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setMonth(new Date());
  };

  // 취소 버튼 클릭 핸들러
  const handleCancelClick = () => {
    onCancel();
  };

  // 헤더 형식을 커스터마이징
  const formatters: Partial<Formatters> = {
    formatCaption: (date, options) => {
      return format(date, "yyyy년 MM월", { locale: ko });
    },
  };

  // 날짜가 선택된 날짜인지 확인하는 함수
  const isSelectedDate = (date: Date) => {
    return selectedDates.some((selectedDate) => format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
  };

  // 날짜가 공휴일이면서 수업일인지 확인
  const isHolidayAndClassDay = (date: Date) => {
    return isHoliday(date) && isSelectedDate(date);
  };

  const CustomDayButton = (props: DayButtonProps) => {
    const { day, ...buttonProps } = props;
    const dateStr = format(day.date, "yyyy-MM-dd");
    const tooltip = conflictDates.get(dateStr);
    const isConflict = !!tooltip;

    return (
      <button {...buttonProps} title={tooltip} aria-label={tooltip} className={`${props.className || ""} ${isConflict ? "conflict-day" : ""}`.trim()}>
        {day.date.getDate()}
      </button>
    );
  };

  return (
    <div className="mx-auto flex w-1/2 flex-col items-center rounded-lg border border-gray-200 bg-white p-4 shadow-md">
      <style jsx global>{`
        .rdp-day_selected {
          background-color: #0ea5e9;
          color: white !important;
          border-radius: 0.75rem; /* <-- 모서리를 둥글게 */
          outline: 3px solid white; /* 흰색 테두리로 경계 시각화 */
          outline-offset: -2px;
        }
        .rdp-day_today {
          font-weight: bold;
          border: 2px solid #0ea5e9;
        }
        .saturday-day {
          color: #2563eb;
        }
        .sunday-day,
        .holiday-day {
          color: #dc2626;
        }
        .holiday-day {
          font-weight: bold;
        }
        .holiday-and-class-day {
          background-color: #f97316 !important;
          color: white !important;
        }
        .conflict-day {
          background-color: #e5e7eb !important; /* 회색 배경 */
          cursor: pointer;
          position: relative;
        }
        .conflict-day:hover::after {
          content: attr(aria-label);
          position: absolute;
          top: -30px;
          left: 50%;
          transform: translateX(-50%);
          background-color: rgba(0, 0, 0, 0.8);
          color: white;
          padding: 5px 10px;
          border-radius: 4px;
          white-space: nowrap;
          z-index: 10;
          font-size: 12px;
        }

        @keyframes pulseRed {
          0% {
            background-color: #fecaca;
          }
          50% {
            background-color: #f87171;
          }
          100% {
            background-color: #fecaca;
          }
        }

        .start-date-highlight,
        .end-date-highlight {
          color: white !important;
          border-radius: 0.75rem;
          animation: pulseRed 1.5s ease-in-out infinite;
          outline: 2px solid #ef4444;
          outline-offset: -2px;
        }
      `}</style>

      {/* 확인 대화상자 */}
      {confirmAction.show && confirmAction.date && (
        <div className="bg-opacity-50 absolute inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-72 rounded-lg bg-white p-4 shadow-lg">
            <p className="mb-4 text-center text-lg font-medium">{confirmAction.isAdd ? "수업을 추가하시겠습니까?" : "수업을 삭제하시겠습니까?"}</p>
            <p className="mb-6 text-center">
              {format(confirmAction.date, "yyyy년 MM월 dd일")} ({getDayOfWeekName(confirmAction.date.getDay())}요일)
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => handleConfirmAction(true)}
                className="min-w-20 rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                예
              </button>
              <button
                onClick={() => handleConfirmAction(false)}
                className="min-w-20 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                아니오
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 오늘 버튼 */}
      <div className="mb-2 flex justify-center">
        <button onClick={handleTodayClick} className="rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300">
          오늘
        </button>
      </div>

      <DayPicker
        key={`${confirmAction.show ? "dialog-open" : "dialog-closed"}-${selectedDatesKey}`} // 선택된 날짜 변경 시에도 리렌더링 트리거
        mode="multiple"
        selected={selectedDates}
        onDayClick={handleDayClick}
        onSelect={() => {}} // 자동 선택 비활성화
        locale={ko}
        fromDate={minDate}
        formatters={formatters}
        month={month}
        onMonthChange={setMonth}
        modifiersClassNames={{
          holidayAndClassDay: "holiday-and-class-day", // 1순위
          selected: "rdp-day_selected",
          today: "rdp-day_today",
          startDate: "start-date-highlight",
          endDate: "end-date-highlight",
          // conflictDay: "conflict-day",
        }}
        modifiers={{
          saturday: (date) => isSaturday(date),
          sunday: (date) => isSunday(date),
          holiday: (date) => isHoliday(date),
          selected: (date) => isSelectedDate(date),
          holidayAndClassDay: (date) => isHolidayAndClassDay(date),
          startDate: (date) => startDate && format(date, "yyyy-MM-dd") === format(startDate, "yyyy-MM-dd"),
          endDate: (date) => endDate && format(date, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd"),
          // conflictDay: (date) => isConflictDate(date),
        }}
        modifiersStyles={{
          saturday: { color: "#2563eb" },
          sunday: { color: "#dc2626" },
          holiday: { color: "#dc2626", fontWeight: "bold" },
        }}
        components={{
          DayButton: CustomDayButton,
        }}
      />

      {/* 닫기 버튼 */}
      <div className="mt-4 flex justify-center">
        <button
          onClick={handleCancelClick}
          className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          닫기
        </button>
      </div>
    </div>
  );
};

export default DatePickerCalendarAddOrRemove;
