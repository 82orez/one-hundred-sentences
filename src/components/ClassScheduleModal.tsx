"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { DayPicker, DayClickEventHandler } from "react-day-picker";
import { X } from "lucide-react";
import "react-day-picker/dist/style.css";
import EnrollmentConfirmModal from "@/components/EnrollmentConfirmModal";

interface ClassDate {
  id: string;
  courseId: string;
  date: string;
  dayOfWeek: string;
  startTime?: string;
  endTime?: string;
}

interface ClassScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
  coursePricePerHour: number;
}

interface UserInfo {
  realName: string;
  phone: string;
}

const ClassScheduleModal: React.FC<ClassScheduleModalProps> = ({ isOpen, onClose, courseId, courseTitle, coursePricePerHour }) => {
  const [classDates, setClassDates] = useState<ClassDate[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [remainingClasses, setRemainingClasses] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showEnrollmentModal, setShowEnrollmentModal] = useState<boolean>(false);
  const [userInfo, setUserInfo] = useState<UserInfo>({ realName: "", phone: "" });

  // 강좌 일정 데이터 가져오기
  useEffect(() => {
    if (isOpen && courseId) {
      fetchClassDates();
      fetchUserInfo();
    }
  }, [isOpen, courseId]);

  const fetchClassDates = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/class-dates?courseId=${courseId}`);
      if (response.ok) {
        const data = await response.json();
        setClassDates(data);
      }
    } catch (error) {
      console.error("Error fetching class dates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const data = await response.json();
        setUserInfo({
          realName: data.realName || "",
          phone: data.phone || "",
        });
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
  };

  // 수업 날짜들을 Date 객체로 변환
  const classDateObjects = classDates.map((cd) => new Date(cd.date));

  // 특정 날짜가 수업 날짜인지 확인
  const isClassDate = (date: Date) => {
    return classDateObjects.some((classDate) => format(classDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"));
  };

  // 오늘을 포함한 이전 수업 날짜인지 확인
  const isPastOrTodayClassDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    return isClassDate(date) && checkDate <= today;
  };

  // 날짜 클릭 핸들러
  const handleDayClick: DayClickEventHandler = (day) => {
    if (isClassDate(day) && !isPastOrTodayClassDate(day)) {
      setSelectedDate(day);
      calculateRemainingClasses(day);
    }
  };

  // 남은 수업 수 계산
  const calculateRemainingClasses = (clickedDate: Date) => {
    const today = new Date();
    const futureClasses = classDateObjects.filter((classDate) => {
      return classDate >= clickedDate;
    });
    setRemainingClasses(futureClasses.length);
  };

  // 수강 신청 버튼 클릭 핸들러
  const handleEnrollmentClick = () => {
    setShowEnrollmentModal(true);
  };

  // 모달이 열릴 때 body 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/30 whitespace-pre-line">
        <div className="relative mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl">
          {/* 헤더 */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">{courseTitle}</h2>
            <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {/* 로딩 상태 */}
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">수업 일정을 불러오는 중...</div>
            </div>
          ) : (
            <>
              {/* 안내 텍스트 */}
              <div className="mb-4 text-center">
                <p className="text-gray-600">원하는 수업 시작일을 선택하시면 수업 횟수와 수강료를 확인할 수 있습니다.</p>
              </div>

              {/* 달력 */}
              <div className="mb-4 flex justify-center">
                <style jsx global>{`
                  .rdp-day_selected {
                    background-color: #0ea5e9 !important;
                    color: white !important;
                    border-radius: 0.5rem;
                  }
                  .rdp-day_today {
                    font-weight: bold;
                    border: 1px solid #0ea5e9;
                  }
                  .class-date {
                    background-color: #fef3c7;
                    color: #d97706;
                    font-weight: bold;
                    border-radius: 0.5rem;
                  }
                  .class-date:hover {
                    background-color: #fbbf24;
                  }
                  .past-class-date {
                    background-color: #f3f4f6;
                    color: #9ca3af;
                    font-weight: bold;
                    border-radius: 0.5rem;
                    cursor: not-allowed;
                  }
                  .past-class-date:hover {
                    background-color: #f3f4f6;
                  }
                `}</style>

                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onDayClick={handleDayClick}
                  locale={ko}
                  disabled={isPastOrTodayClassDate}
                  modifiers={{
                    classDate: (date) => isClassDate(date) && !isPastOrTodayClassDate(date),
                    pastClassDate: (date) => isPastOrTodayClassDate(date),
                  }}
                  modifiersClassNames={{
                    classDate: "class-date",
                    pastClassDate: "past-class-date",
                    selected: "rdp-day_selected",
                    today: "rdp-day_today",
                  }}
                  formatters={{
                    formatCaption: (date) => format(date, "yyyy년 MM월", { locale: ko }),
                  }}
                />
              </div>

              {/* 선택된 날짜 정보 */}
              {selectedDate && (
                <div className="rounded-lg bg-blue-50 p-4">
                  <div className="text-center">
                    <p className="font-medium text-blue-800">선택하신 수업 시작일</p>
                    <p className="text-lg font-bold text-blue-900">{format(selectedDate, "yyyy년 MM월 dd일 (E)", { locale: ko })}</p>
                    <p className="mt-2 text-blue-700">
                      수업 시작일부터 <span className="font-bold text-blue-900">{remainingClasses}회</span>의 수업이 진행됩니다.{" "}
                      <span className="font-bold text-blue-900">수강료는 {(coursePricePerHour * remainingClasses).toLocaleString()}원</span> 입니다.
                    </p>
                  </div>

                  <div className="mt-6 text-center">
                    <button className="btn btn-primary" onClick={handleEnrollmentClick}>
                      다음 단계
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* 닫기 버튼 */}
          <div className="mt-6 flex justify-center">
            <button onClick={onClose} className="rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700">
              닫기
            </button>
          </div>
        </div>
      </div>

      {/* 수강 신청 확인 모달 */}
      {selectedDate && (
        <EnrollmentConfirmModal
          isOpen={showEnrollmentModal}
          onClose={() => setShowEnrollmentModal(false)}
          userInfo={userInfo}
          courseTitle={courseTitle}
          selectedDate={selectedDate}
          remainingClasses={remainingClasses}
          totalFee={coursePricePerHour * remainingClasses}
        />
      )}
    </>
  );
};

export default ClassScheduleModal;
