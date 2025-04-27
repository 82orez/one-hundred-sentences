import React from "react";
import { DayPicker, DayClickEventHandler, CaptionProps, Formatters } from "react-day-picker";
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
  onDateSelect: (date: Date) => void;
  minDate?: Date;
}

const DatePickerCalendar: React.FC<DatePickerCalendarProps> = ({ selectedDate, onDateSelect, minDate }) => {
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

  const handleDayClick: DayClickEventHandler = (day) => {
    onDateSelect(day);
  };

  // 헤더 형식을 커스터마이징
  const formatters: Partial<Formatters> = {
    formatCaption: (date, options) => {
      return format(date, "yyyy년 MM월", { locale: ko });
    },
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
      <DayPicker
        mode="single"
        selected={selectedDate}
        onDayClick={handleDayClick}
        locale={ko}
        fromDate={minDate}
        formatters={formatters}
        modifiersClassNames={{
          selected: "rdp-day_selected",
          today: "rdp-day_today",
        }}
        modifiers={{
          saturday: (date) => isSaturday(date),
          sunday: (date) => isSunday(date),
          holiday: (date) => isHoliday(date),
        }}
        modifiersStyles={{
          saturday: { color: "#2563eb" }, // 파란색
          sunday: { color: "#dc2626" }, // 빨간색
          holiday: { color: "#dc2626", fontWeight: "bold" }, // 빨간색 볼드체
        }}
      />
    </div>
  );
};

export default DatePickerCalendar;
