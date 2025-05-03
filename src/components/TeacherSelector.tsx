import { useState, useEffect } from "react";
import axios from "axios";
import { CheckCircle, AlertTriangle, Search, Filter } from "lucide-react";
import clsx from "clsx";
import toast from "react-hot-toast";
import React from "react";

interface ClassDate {
  id?: string;
  courseId?: string;
  date: string;
  dayOfWeek: string;
  startTime: string | null;
  endTime: string | null;
}

interface ConflictingCourse {
  courseId: string;
  courseTitle: string;
  conflictingDates: {
    date: string;
    startTime: string;
    endTime: string;
  }[];
}

interface TeacherWithSchedule {
  id: string;
  realName: string;
  email: string;
  phone: string;
  nation: string;
  subject: string;
  nickName: string | null;
  isAvailable?: boolean;
  conflictingCourses?: ConflictingCourse[];
}

interface TeacherSelectorProps {
  classDates: ClassDate[];
  selectedTeacherId: string;
  onSelectTeacher: (teacherId: string) => void;
}

export default function TeacherSelector({ classDates, selectedTeacherId, onSelectTeacher }: TeacherSelectorProps) {
  const [teachers, setTeachers] = useState<TeacherWithSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedNation, setSelectedNation] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showConflicts, setShowConflicts] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!classDates.length) {
        return;
      }

      try {
        setLoading(true);
        const classDatesWithTime = classDates.map((cd) => ({
          ...cd,
          startTime: cd.startTime,
          endTime: cd.endTime,
        }));

        const response = await axios.get("/api/admin/active-teachers", {
          params: {
            classDates: JSON.stringify(classDatesWithTime),
            currentTeacherId: selectedTeacherId,
          },
        });

        setTeachers(response.data.teachers);
      } catch (error) {
        console.error("강사 목록 조회 오류:", error);
        toast.error("강사 목록을 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [classDates, selectedTeacherId]);

  const filteredTeachers = teachers
    .filter((teacher) => teacher.id !== selectedTeacherId) // 선택된 강사 제외
    .filter((teacher) => {
      const matchesSearch =
        teacher.realName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (teacher.nickName && teacher.nickName.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesNation = !selectedNation || teacher.nation === selectedNation;
      const matchesSubject = !selectedSubject || teacher.subject === selectedSubject;

      return matchesSearch && matchesNation && matchesSubject;
    });

  // 국적 표시 함수
  const getNationDisplay = (nation: string) => {
    const nationMap: Record<string, string> = {
      KR: "한국",
      PH: "필리핀",
    };
    return nationMap[nation] || nation;
  };

  // 과목 표시 함수
  const getSubjectDisplay = (subject: string) => {
    const subjectMap: Record<string, string> = {
      en: "영어",
      ja: "일본어",
      ko: "한국어",
      zh: "중국어",
    };
    return subjectMap[subject] || subject;
  };

  // 충돌 세부 정보 토글
  const toggleConflictDetails = (teacherId: string) => {
    setShowConflicts((prev) => ({
      ...prev,
      [teacherId]: !prev[teacherId],
    }));
  };

  if (!classDates.length) {
    return (
      <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4">
        <p className="text-amber-800">수업 일정을 먼저 설정해주세요. 수업 일정에 따라 배정 가능한 강사가 표시됩니다.</p>
      </div>
    );
  }

  if (loading) {
    return <div className="p-4 text-center">강사 목록을 불러오는 중...</div>;
  }

  return (
    <div className="mt-4 rounded-lg border p-4">
      <h3 className="mb-4 text-lg font-medium">강사 선택</h3>

      {/* 현재 선택된 강사 표시 */}
      <div className="mb-4 rounded-md bg-gray-50 p-3">
        <h4 className="mb-2 font-medium">선택된 강사</h4>
        {selectedTeacherId ? (
          <div>
            {teachers.find((t) => t.id === selectedTeacherId)?.realName || "불러오는 중..."}
            {teachers.find((t) => t.id === selectedTeacherId)?.nickName && ` (${teachers.find((t) => t.id === selectedTeacherId)?.nickName})`}
          </div>
        ) : (
          <div className="text-gray-500">없음</div>
        )}
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-4 flex flex-wrap gap-2">
        <div className="flex flex-grow items-center overflow-hidden rounded-md border">
          <Search className="ml-2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="강사 이름 또는 이메일 검색"
            className="w-full p-2 outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <select className="rounded-md border p-2" value={selectedNation || ""} onChange={(e) => setSelectedNation(e.target.value || null)}>
            <option value="">모든 국적</option>
            <option value="KR">한국</option>
            <option value="PH">필리핀</option>
          </select>

          <select className="rounded-md border p-2" value={selectedSubject || ""} onChange={(e) => setSelectedSubject(e.target.value || null)}>
            <option value="">모든 과목</option>
            <option value="en">영어</option>
            <option value="ja">일본어</option>
            <option value="ko">한국어</option>
            <option value="zh">중국어</option>
          </select>
        </div>
      </div>

      {/* 강사 목록 */}
      <div className="max-h-96 overflow-y-auto rounded-md border">
        {filteredTeachers.length === 0 ? (
          <div className="p-4 text-center text-gray-500">검색 결과가 없습니다.</div>
        ) : (
          <table className="w-full">
            <thead className="sticky top-0 bg-gray-50">
              <tr>
                <th className="p-2 text-left">강사명</th>
                <th className="p-2 text-left">이메일</th>
                <th className="p-2 text-left">국적</th>
                <th className="p-2 text-left">과목</th>
                <th className="p-2 text-left">상태</th>
                <th className="p-2 text-center">선택</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher) => (
                <React.Fragment key={teacher.id}>
                  <tr className={clsx("border-t", selectedTeacherId === teacher.id && "bg-blue-50")}>
                    <td className="p-2">
                      {teacher.realName}
                      {teacher.nickName && <span className="ml-1 text-gray-500">({teacher.nickName})</span>}
                    </td>
                    <td className="p-2">{teacher.email}</td>
                    <td className="p-2">{getNationDisplay(teacher.nation)}</td>
                    <td className="p-2">{getSubjectDisplay(teacher.subject)}</td>
                    <td className="p-2">
                      {teacher.isAvailable ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle size={16} className="mr-1" />
                          <span>배정 가능</span>
                        </div>
                      ) : (
                        <div className="flex cursor-pointer items-center text-red-600" onClick={() => toggleConflictDetails(teacher.id)}>
                          <AlertTriangle size={16} className="mr-1" />
                          <span>일정 충돌</span>
                        </div>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <button
                        className={clsx(
                          "rounded px-3 py-1",
                          teacher.isAvailable ? "bg-blue-500 text-white hover:bg-blue-600" : "cursor-not-allowed bg-gray-300 text-gray-500",
                        )}
                        onClick={(e) => {
                          // 이벤트 버블링 중지
                          e.preventDefault();
                          e.stopPropagation();

                          if (teacher.isAvailable) {
                            onSelectTeacher(teacher.id);
                          }
                        }}
                        disabled={!teacher.isAvailable}>
                        {selectedTeacherId === teacher.id ? "선택됨" : "선택"}
                      </button>
                    </td>
                  </tr>

                  {/* 충돌 세부 정보 행 */}
                  {!teacher.isAvailable && showConflicts[teacher.id] && (
                    <tr>
                      <td colSpan={6} className="bg-red-50 p-3">
                        <div className="text-sm">
                          <h5 className="mb-2 font-medium">충돌되는 강의:</h5>
                          <ul className="list-disc pl-5">
                            {teacher.conflictingCourses?.map((course, idx) => (
                              <li key={idx}>
                                <strong>{course.courseTitle}</strong>
                                <ul className="list-disc pl-5 text-gray-700">
                                  {course.conflictingDates.map((date, dateIdx) => (
                                    <li key={dateIdx}>
                                      {new Date(date.date).toLocaleDateString("ko-KR")}
                                      {date.startTime && date.endTime && ` (${date.startTime} - ${date.endTime})`}
                                    </li>
                                  ))}
                                </ul>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
