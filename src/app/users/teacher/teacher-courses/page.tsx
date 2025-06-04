"use client";

import React, { useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "react-hot-toast";
import clsx from "clsx";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import CourseSchedule from "@/components/CourseSchedule";
import StudentListModal from "@/components/StudentListModal";
import AttendanceModal from "@/components/AttendanceModal";

export default function MyCourses() {
  // 모달 상태와 선택된 강좌 ID를 관리할 state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState("");

  // 출석부 모달 상태 관리
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [attendanceData, setAttendanceData] = useState([]);
  const [classDates, setClassDates] = useState([]);
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);

  // 수강생 목록 모달 상태 관리
  const [isStudentListModalOpen, setIsStudentListModalOpen] = useState(false);

  const { data: myCourses, isPending: loading } = useQuery({
    queryKey: ["myCourses"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/my-courses");
        console.log("myCourses: ", response.data.courses);
        return response.data.courses;
      } catch (error) {
        console.error("강좌 조회 실패:", error);
        toast.error("강좌를 불러오는 중 오류가 발생했습니다.");
        throw error;
      }
    },
  });

  const formatScheduleDays = (course) => {
    const days = [];
    if (course.scheduleMonday) days.push("월");
    if (course.scheduleTuesday) days.push("화");
    if (course.scheduleWednesday) days.push("수");
    if (course.scheduleThursday) days.push("목");
    if (course.scheduleFriday) days.push("금");
    if (course.scheduleSaturday) days.push("토");
    if (course.scheduleSunday) days.push("일");

    return days.join(", ");
  };

  // 수업 일정 버튼 클릭 핸들러
  const handleScheduleClick = (e, courseId, courseTitle) => {
    e.stopPropagation(); // 이벤트 버블링 방지 (카드 클릭 이벤트가 발생하지 않도록)
    setSelectedCourseId(courseId);
    setSelectedCourseTitle(courseTitle);
    setIsScheduleModalOpen(true);
  };

  // 모달 닫기 핸들러
  const handleCloseModal = () => {
    setIsScheduleModalOpen(false);
    setSelectedCourseId(null);
  };

  // 출석부 버튼 클릭 핸들러
  const handleAttendanceClick = async (e, courseId, courseTitle) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setSelectedCourseId(courseId);
    setSelectedCourseTitle(courseTitle);
    setIsAttendanceLoading(true);

    try {
      // API 호출로 학생 목록과 출결 데이터 가져오기
      const response = await axios.get(`/api/attendance/${courseId}`);
      setAttendanceData(response.data.students || []);
      setClassDates(response.data.classDates || []);
      setIsAttendanceModalOpen(true);
    } catch (error) {
      console.error("출석부 데이터 조회 실패:", error);
      toast.error("출석부 정보를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsAttendanceLoading(false);
    }
  };

  // 출석부 모달 닫기
  const handleCloseAttendanceModal = () => {
    setIsAttendanceModalOpen(false);
    setAttendanceData([]);
    setClassDates([]);
  };

  // 수강생 목록 버튼 클릭 핸들러
  const handleStudentListClick = (e, courseId, courseTitle) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setSelectedCourseId(courseId);
    setSelectedCourseTitle(courseTitle);
    setIsStudentListModalOpen(true);
  };

  // 수강생 목록 모달 닫기 핸들러
  const handleCloseStudentListModal = () => {
    setIsStudentListModalOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">내 강좌</h1>
      {loading ? (
        <div className="py-10 text-center">
          <p>강좌 정보를 불러오고 있습니다...</p>
        </div>
      ) : myCourses.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-10 text-center">
          <p className="text-gray-600">현재 등록된 강좌가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {myCourses.map((item) => {
              // Enrollment 또는 Course 구조에 따라 데이터 추출
              const course = item.course || item;

              return (
                <div key={course.id} className="overflow-hidden rounded-lg border transition-shadow hover:shadow-lg">
                  <div className="p-4">
                    <h2 className="text-xl font-semibold">{course.title}</h2>
                    <p className="mt-2 line-clamp-2 text-gray-600">{course.description || "설명 없음"}</p>

                    <div className="mt-4 space-y-2 text-sm">
                      {course.teacher && (
                        <>
                          <p>
                            <span className="font-medium">강사명:</span> {course.teacher.user?.realName || "미정"}
                          </p>
                          <p className={"hidden"}>
                            <span className="font-medium">zoom:</span> {course.teacher.user?.zoomInviteUrl || "미정"}
                          </p>
                          <p>
                            <span className="font-medium">수업 방식:</span> {course.location || "미정"}
                          </p>
                        </>
                      )}

                      <p>
                        <span className="font-medium">수업일:</span> {formatScheduleDays(course)}
                      </p>

                      {course.startDate && (
                        <p>
                          <span className="font-medium">기간:</span> {format(new Date(course.startDate), "yyyy.MM.dd", { locale: ko })}
                          {course.endDate && ` ~ ${format(new Date(course.endDate), "yyyy.MM.dd", { locale: ko })}`}
                        </p>
                      )}

                      {course.startTime && (
                        <p>
                          <span className="font-medium">시간:</span> {course.startTime}
                          {course.endTime && ` ~ ${course.endTime}`}
                        </p>
                      )}
                    </div>

                    <div className="mt-8 flex flex-col justify-around gap-2 md:flex-row">
                      <button
                        className="min-w-[150px] rounded-md bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                        onClick={(e) => handleScheduleClick(e, course.id, course.title)}>
                        수업 일정 및 진행
                      </button>

                      <button
                        className="min-w-[150px] rounded-md bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
                        onClick={(e) => handleAttendanceClick(e, course.id, course.title)}>
                        수강생 출석부
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-gray-50 px-4 py-3 text-right">
                    <button className="cursor-pointer font-medium text-blue-600" onClick={(e) => handleStudentListClick(e, course.id, course.title)}>
                      수강생 List 보기 →
                    </button>

                    <Link href={`/user-course-points/${course.id}`} className="font-medium text-blue-600" onClick={(e) => e.stopPropagation()}>
                      포인트 랭킹 보기 →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={clsx("mt-4 flex justify-center md:mt-10", { "pointer-events-none": loading })}>
            <Link href={"/users/teacher"} className={"hover:underline"}>
              Back to Teacher Dashboard
            </Link>
          </div>
        </>
      )}

      {/* 수업 일정 모달 */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="relative max-h-[90vh] w-[95vw] max-w-5xl overflow-auto rounded-lg bg-white p-4 shadow-lg">
            <button
              onClick={handleCloseModal}
              className="absolute top-4 right-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              <X size={24} />
            </button>
            <h2 className="mb-4 text-xl font-semibold">{selectedCourseTitle}</h2>
            <CourseSchedule
              courseId={selectedCourseId}
              zoomInviteUrl={myCourses.find((enrollment) => enrollment.id === selectedCourseId)?.teacher?.user?.zoomInviteUrl}
              location={myCourses.find((enrollment) => enrollment.id === selectedCourseId)?.location}
            />
          </div>
        </div>
      )}

      {/* 출석부 모달 */}
      <AttendanceModal
        isOpen={isAttendanceModalOpen}
        onClose={handleCloseAttendanceModal}
        courseTitle={selectedCourseTitle}
        isLoading={isAttendanceLoading}
        attendanceData={attendanceData}
        classDates={classDates}
      />

      {/* 수강생 목록 모달 */}
      {isStudentListModalOpen && (
        <StudentListModal
          isOpen={isStudentListModalOpen}
          onClose={handleCloseStudentListModal}
          courseId={selectedCourseId}
          courseTitle={selectedCourseTitle}
        />
      )}
    </div>
  );
}
