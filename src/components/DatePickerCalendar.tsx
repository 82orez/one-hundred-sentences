import React, { useState } from "react";
import { DayPicker, DayClickEventHandler, Formatters } from "react-day-picker";
import { ko } from "date-fns/locale";
import "react-day-picker/dist/style.css";
import { format } from "date-fns";

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

interface DatePickerCalendarProps {
  selectedDate?: Date;
  selectedDates?: Date[]; // 여러 날짜 선택을 위한 prop 추가
  onDateSelect: (date: Date) => void;
  minDate?: Date;
  onCancel?: () => void;
}

const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({
  selectedDate,
  selectedDates = [], // 기본값 빈 배열로 설정
  onDateSelect,
  minDate,
  onCancel = () => {}, // 기본값으로 빈 함수 설정
}) => {
  // 임시 선택 날짜 상태 추가
  const [tempSelectedDate, setTempSelectedDate] = useState<Date | undefined>(selectedDate);

  // 현재 표시되는 월 상태 추가
  const [month, setMonth] = useState<Date>(tempSelectedDate || new Date());

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
    setTempSelectedDate(day);
  };

  // 오늘 버튼 클릭 핸들러
  const handleTodayClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // 이벤트 버블링 중지
    e.preventDefault();
    e.stopPropagation();

    const today = new Date();
    setMonth(today);
  };

  // 선택 버튼 클릭 핸들러
  const handleSelectClick = () => {
    if (tempSelectedDate) {
      onDateSelect(tempSelectedDate);
    }
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

  // 날짜가 선택된 날짜인지 확인하는 함수 추가
  const isSelectedDate = (date: Date) => {
    return selectedDates.some((selectedDate) => format(selectedDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
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
      `}</style>
      {/* 여기서 today 버튼 추가 */}
      <div className="mb-2 flex justify-center">
        <button onClick={handleTodayClick} className="rounded-md bg-gray-200 px-3 py-1 text-sm text-gray-700 hover:bg-gray-300">
          오늘
        </button>
      </div>
      <DayPicker
        mode="single"
        selected={tempSelectedDate}
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
          selected: (date) => isSelectedDate(date), // 여러 날짜 선택 지원 추가
        }}
        modifiersStyles={{
          saturday: { color: "#2563eb" },
          sunday: { color: "#dc2626" },
          holiday: { color: "#dc2626", fontWeight: "bold" },
        }}
      />

      {/* 하단 버튼 영역 추가 */}
      {/* 읽기 전용 모드일 때 버튼 숨기기 */}
      <div className="mt-4 flex justify-between gap-2">
        <button
          onClick={handleSelectClick}
          disabled={!tempSelectedDate}
          className={`w-1/2 rounded-md px-4 py-2 text-sm font-medium text-white ${
            tempSelectedDate ? "bg-blue-600 hover:bg-blue-700" : "cursor-not-allowed bg-blue-300"
          }`}>
          선택
        </button>
        <button
          onClick={handleCancelClick}
          className="w-1/2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          닫기
        </button>
      </div>
    </div>
  );
};

export default DatePickerCalendar;
