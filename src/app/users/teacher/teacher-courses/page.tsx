"use client";

import React, { useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import clsx from "clsx";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import Image from "next/image";
import CourseSchedule from "@/components/CourseSchedule";
import StudentListModal from "@/components/StudentListModal";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const router = useRouter();
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

  const { isPending: loading } = useQuery({
    queryKey: ["myCourses"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/my-courses");
        setCourses(response.data.courses);
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
      ) : courses.length === 0 ? (
        <div className="rounded-lg bg-gray-50 py-10 text-center">
          <p className="text-gray-600">현재 등록된 강좌가 없습니다.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((item) => {
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
                    <button className="font-medium text-blue-600" onClick={(e) => handleStudentListClick(e, course.id, course.title)}>
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

          <div className={clsx("mt-4 flex justify-center hover:underline md:mt-10", { "pointer-events-none": loading })}>
            <Link href={"/users/teacher"}>Back to Teacher Dashboard</Link>
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
              zoomInviteUrl={courses.find((enrollment) => enrollment.id === selectedCourseId)?.teacher?.user?.zoomInviteUrl}
              location={courses.find((enrollment) => enrollment.id === selectedCourseId)?.location}
            />
          </div>
        </div>
      )}

      {/* 출석부 모달 */}
      {isAttendanceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="relative max-h-[90vh] w-[95vw] max-w-5xl overflow-auto rounded-lg bg-white p-4 shadow-lg">
            <button
              onClick={handleCloseAttendanceModal}
              className="absolute top-4 right-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
              <X size={24} />
            </button>
            <h2 className="mb-6 text-xl font-semibold">{selectedCourseTitle} - 출석부</h2>

            {isAttendanceLoading ? (
              <div className="flex h-40 items-center justify-center">
                <p>출석 정보를 불러오고 있습니다...</p>
              </div>
            ) : classDates.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-gray-600">등록된 수업 일정이 없습니다.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">학생 이름</th>
                      {classDates.map((classDate) => {
                        // 현재 날짜와 시간
                        const now = new Date();
                        // 수업 날짜
                        const classDateTime = new Date(classDate.date);
                        // 수업이 지났는지 여부 체크
                        const isPastClass = classDateTime < now;

                        return (
                          <th
                            key={classDate.id}
                            className={`px-3 py-3 text-center text-xs font-medium tracking-wider uppercase ${
                              isPastClass ? "bg-gray-100 text-gray-600" : "text-gray-500"
                            }`}>
                            {format(new Date(classDate.date), "MM.dd", { locale: ko })}
                            <div className="text-xs font-normal">{classDate.dayOfWeek}요일</div>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {attendanceData.map((student) => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1 text-sm font-medium text-gray-900">
                            {student.image && student.isImagePublicOpen ? (
                              <div className="h-8 w-8 overflow-hidden rounded-full">
                                <Image
                                  src={student.image}
                                  alt={`${student.image || "사용자"} 프로필`}
                                  width={32}
                                  height={32}
                                  className="h-full w-full object-cover object-center"
                                />
                              </div>
                            ) : (
                              // <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">?</div>
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-500">
                                {student.name?.charAt(0) || "?"}
                              </div>
                            )}
                            <span>{student.nickName || student.name}</span>
                            <span className={clsx({ hidden: !student.nickName })}>({student.name})</span>
                          </div>
                        </td>
                        {classDates.map((classDate) => {
                          const attendance = student.attendance.find((a) => a.classDateId === classDate.id);
                          // 현재 날짜와 시간
                          const now = new Date();
                          // 수업 날짜와 시간 정보를 가져옴
                          const classDateTime = new Date(classDate.date);

                          // 수업 종료 시간이 있으면 파싱하여 설정
                          if (classDate.endTime) {
                            const [hours, minutes] = classDate.endTime.split(":").map(Number);
                            classDateTime.setHours(hours, minutes);
                          }

                          // 수업이 끝났는지 여부 체크 (현재 시간이 수업 종료 시간을 지났는지)
                          const isClassEnded = now > classDateTime;

                          // 출석 여부 결정
                          // 1. 출석 정보가 있고 isAttended가 true면 출석
                          // 2. 수업이 끝났고 출석 정보가 없거나 isAttended가 false면 결석
                          // 3. 그 외의 경우는 아직 진행 중이거나 시작 전인 수업
                          const isAttended = attendance?.isAttended === true;
                          const isAbsent = isClassEnded && (!attendance || attendance.isAttended === false);

                          return (
                            <td key={`${student.id}-${classDate.id}`} className={`px-3 py-4 text-center ${isClassEnded ? "bg-gray-50" : ""}`}>
                              {isAttended || isAbsent ? (
                                <span className={`inline-block h-3 w-3 rounded-full ${isAttended ? "bg-green-500" : "bg-red-500"}`} />
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex items-center space-x-4 text-sm">
                  <div className="flex items-center">
                    <span className="mr-2 inline-block h-3 w-3 rounded-full bg-green-500"></span>
                    <span>출석</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 inline-block h-3 w-3 rounded-full bg-red-500"></span>
                    <span>결석</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 inline-block h-3 w-3 border border-gray-200 bg-gray-50"></span>
                    <span>지난 수업</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

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
