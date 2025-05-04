// components/DatePickerCalendarAddOrRemove.tsx
import React, { useState, useEffect } from "react";
import { DayPicker, DayClickEventHandler, Formatters } from "react-day-picker";
import { ko } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useTeacherConflictStore } from "@/stores/useTeacherConflictStore";

// 공휴일 목록 정의
const koreanHolidays = [
  "2025-01-01", // 신정
  "2025-02-28", // 설날 연휴
  "2025-03-01", // 삼일절
  "2025-05-05", // 어린이날, 부처님 오신 날
  "2025-05-06", // 대체 공휴일
  "2025-06-03", // 대통령 선거일
  "2025-06-06", // 현충일
  "2025-08-15", // 광복절
  "2025-10-03", // 개천절
  "2025-10-05", // 추석 연휴
  "2025-10-06", // 추석
  "2025-10-07", // 추석 연휴
  "2025-10-08", // 추석 연휴(대체)
  "2025-10-09", // 한글날
  "2025-12-25", // 크리스마스
];

interface ClassDate {
  date: string;
  dayOfWeek: string;
}

interface DatePickerCalendarAddOrRemoveProps {
  selectedDates: Date[];
  onAddDate: (date: Date) => void;
  onRemoveDate: (date: Date) => void;
  minDate?: Date;
  onCancel?: () => void;
  getDayOfWeekName: (dayNumber: number) => string;
  startDate?: Date;
  endDate?: Date;
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

  // 날짜 클릭 핸들러 수정
  const handleDayClick: DayClickEventHandler = (day) => {
    const dayString = format(day, "yyyy-MM-dd");

    // 시작일이면 삭제 불가
    if (startDate && format(startDate, "yyyy-MM-dd") === dayString) {
      toast.error("수업 시작일은 삭제할 수 없습니다.");
      return;
    }

    const isDateSelected = selectedDates.some((selectedDate) => format(selectedDate, "yyyy-MM-dd") === dayString);

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

  // Zustand 스토어에서 충돌 데이터 가져오기
  const { conflicts: conflictData } = useTeacherConflictStore();

  // 스토어의 충돌 데이터를 배열로 변환 (모든 강사의 충돌 일자)
  const allConflictDates = React.useMemo(() => {
    const dates = new Set<string>();
    Object.values(conflictData).forEach((teacherConflicts) => {
      teacherConflicts.forEach((conflict) => {
        dates.add(conflict.date);
      });
    });
    return Array.from(dates);
  }, [conflictData]);

  // 날짜가 충돌 날짜인지 확인하는 함수
  const isConflictDate = (date: Date) => {
    return allConflictDates.includes(format(date, "yyyy-MM-dd"));
  };

  return (
    <div className="mx-auto flex w-1/2 flex-col items-center rounded-lg border border-gray-200 bg-white p-4 shadow-md">
      <style jsx global>{`
        .rdp-day_selected {
          background-color: #0ea5e9;
          color: white !important;
          border-radius: 0.75rem;
          outline: 3px solid white;
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
        .conflict-date {
          background-color: #a7f3d0 !important; /* 초록색 계열 */
          color: #064e3b !important; /* 어두운 녹색 텍스트 */
          font-weight: bold;
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
        key={`${confirmAction.show ? "dialog-open" : "dialog-closed"}-${selectedDatesKey}`}
        mode="multiple"
        selected={selectedDates}
        onDayClick={handleDayClick}
        locale={ko}
        fromDate={minDate}
        formatters={formatters}
        month={month}
        onMonthChange={setMonth}
        modifiersClassNames={{
          conflictDate: "conflict-date", // 충돌 날짜 스타일 추가
          holidayAndClassDay: "holiday-and-class-day",
          selected: "rdp-day_selected",
          today: "rdp-day_today",
          startDate: "start-date-highlight",
          endDate: "end-date-highlight",
        }}
        modifiers={{
          saturday: (date) => isSaturday(date),
          sunday: (date) => isSunday(date),
          holiday: (date) => isHoliday(date),
          selected: (date) => isSelectedDate(date),
          holidayAndClassDay: (date) => isHolidayAndClassDay(date),
          conflictDate: (date) => isConflictDate(date), // 충돌 날짜 구분자 추가
          startDate: (date) => startDate && format(date, "yyyy-MM-dd") === format(startDate, "yyyy-MM-dd"),
          endDate: (date) => endDate && format(date, "yyyy-MM-dd") === format(endDate, "yyyy-MM-dd"),
        }}
        modifiersStyles={{
          saturday: { color: "#2563eb" },
          sunday: { color: "#dc2626" },
          holiday: { color: "#dc2626", fontWeight: "bold" },
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

      {/* 스토어에 충돌 데이터가 있는 경우 표시 */}
      {allConflictDates.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-700">
            <span className="mr-1 inline-block h-3 w-3 rounded-full bg-green-200"></span>
            초록색 배경은 강사 스케줄 충돌 날짜입니다.
          </p>
        </div>
      )}
    </div>
  );
};

export default DatePickerCalendarAddOrRemove;
