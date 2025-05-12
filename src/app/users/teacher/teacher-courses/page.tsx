// src/app/users/teacher/teacher-courses/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import clsx from "clsx";
import Link from "next/link";

export default function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchMyCourses = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/my-courses");
        setCourses(response.data.courses);
      } catch (error) {
        console.error("강좌 조회 실패:", error);
        toast.error("강좌를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyCourses();
  }, []);

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
                <div
                  key={course.id}
                  className="cursor-pointer overflow-hidden rounded-lg border transition-shadow hover:shadow-lg"
                  onClick={() => router.push(`/dashboard/courses/${course.id}`)}>
                  <div className="p-4">
                    <h2 className="text-xl font-semibold">{course.title}</h2>
                    <p className="mt-2 line-clamp-2 text-gray-600">{course.description || "설명 없음"}</p>

                    <div className="mt-4 space-y-2 text-sm">
                      {course.teacher && (
                        <p>
                          <span className="font-medium">교사:</span> {course.teacher.user?.realName || "미정"}
                        </p>
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
                  </div>

                  <div className="bg-gray-50 px-4 py-3 text-right">
                    <span className="text-sm font-medium text-blue-600">자세히 보기 →</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className={clsx(
              "mt-4 flex justify-center hover:underline md:mt-10",
              // { "pointer-events-none": isLoading }
            )}>
            <Link href={"/users/teacher"}>Back to Teacher Dashboard</Link>
          </div>
        </>
      )}
    </div>
  );
}
