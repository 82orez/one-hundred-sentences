// components/DatePickerCalendarAddOrRemove.tsx
import React, { useState } from "react";
import { DayPicker, DayClickEventHandler, Formatters } from "react-day-picker";
import { ko } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";
import toast from "react-hot-toast";

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
}

const DatePickerCalendarAddOrRemove: React.FC<DatePickerCalendarAddOrRemoveProps> = ({
  selectedDates = [],
  onAddDate,
  onRemoveDate,
  minDate,
  onCancel = () => {},
  getDayOfWeekName,
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
    const isDateSelected = selectedDates.some((selectedDate) => format(selectedDate, "yyyy-MM-dd") === format(day, "yyyy-MM-dd"));

    setConfirmAction({
      show: true,
      date: day,
      isAdd: !isDateSelected,
    });
  };

  // 확인 액션 처리
  const handleConfirmAction = (confirm: boolean) => {
    if (confirm && confirmAction.date) {
      if (confirmAction.isAdd) {
        onAddDate(confirmAction.date);
        toast.success("수업이 추가되었습니다.");
      } else {
        onRemoveDate(confirmAction.date);
        toast.success("수업이 삭제되었습니다.");
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

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-md">
      <style jsx global>{`
        .rdp-day_selected {
          background-color: #0ea5e9 !important;
          color: white !important;
        }
        .rdp-day_today {
          font-weight: bold;
          border: 1px solid #0ea5e9;
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
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                예
              </button>
              <button
                onClick={() => handleConfirmAction(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
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
        mode="multiple"
        selected={selectedDates}
        onDayClick={handleDayClick}
        locale={ko}
        fromDate={minDate}
        formatters={formatters}
        month={month}
        onMonthChange={setMonth}
        modifiersClassNames={{
          selected: "rdp-day_selected",
          today: "rdp-day_today",
        }}
        modifiers={{
          saturday: (date) => isSaturday(date),
          sunday: (date) => isSunday(date),
          holiday: (date) => isHoliday(date),
          selected: (date) => isSelectedDate(date),
          holidayAndClassDay: (date) => isHolidayAndClassDay(date),
        }}
        modifiersStyles={{
          saturday: { color: "#2563eb" },
          sunday: { color: "#dc2626" },
          holiday: { color: "#dc2626", fontWeight: "bold" },
          holidayAndClassDay: { backgroundColor: "#f97316", color: "white" },
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
