// src/components/TeacherAttendanceModal.tsx
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { X } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

type ClassDate = {
  id: string;
  date: string;
  dayOfWeek: string;
  endTime?: string;
};

type TeacherAttendance = {
  id: string;
  classDateId: string;
  isAttended: boolean;
};

interface TeacherAttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  teacherId: string;
  courseId: string;
  teacherName: string;
}

const TeacherAttendanceModal: React.FC<TeacherAttendanceModalProps> = ({ isOpen, onClose, courseTitle, teacherId, courseId, teacherName }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [classDates, setClassDates] = useState<ClassDate[]>([]);
  const [attendanceData, setAttendanceData] = useState<TeacherAttendance[]>([]);

  useEffect(() => {
    if (isOpen && teacherId && courseId) {
      fetchAttendanceData();
    }
  }, [isOpen, teacherId, courseId]);

  const fetchAttendanceData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/admin/teacher-attendance?teacherId=${teacherId}&courseId=${courseId}`);
      setClassDates(response.data.classDates);
      console.log("classDates: ", response.data.classDates);
      setAttendanceData(response.data.attendanceData);
      console.log("attendanceData: ", response.data.attendanceData);
    } catch (error) {
      console.error("강사 출석 정보를 불러오는데 실패했습니다:", error);
      toast.error("강사 출석 정보를 불러오는데 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative max-h-[90vh] w-[95vw] max-w-3xl overflow-auto rounded-lg bg-white p-4 shadow-lg">
        <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <X size={24} />
        </button>
        <h2 className="mb-6 text-xl font-semibold">
          {courseTitle} - <span className="text-blue-600">{teacherName}</span> 강사 출석 현황
        </h2>

        {isLoading ? (
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
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">날짜</th>
                  <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">요일</th>
                  <th className="px-6 py-3 text-center text-xs font-medium tracking-wider text-gray-500 uppercase">출석 여부</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {classDates.map((classDate) => {
                  // 현재 날짜와 시간
                  const now = new Date();
                  // 수업 날짜
                  const classDateTime = new Date(classDate.date);
                  // 수업이 지났는지 여부 체크
                  const isPastClass = classDateTime < now;

                  // 해당 수업 날짜에 대한 출석 정보 찾기
                  const attendance = attendanceData.find((a) => a.classDateId === classDate.id);

                  // 출석 여부 결정
                  const isAttended = attendance?.isAttended === true;

                  return (
                    <tr key={classDate.id}>
                      <td className="px-6 py-4 whitespace-nowrap">{format(new Date(classDate.date), "yyyy년 MM월 dd일", { locale: ko })}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{classDate.dayOfWeek}요일</td>
                      <td className={`px-6 py-4 text-center whitespace-nowrap ${isPastClass ? "bg-gray-50" : ""}`}>
                        {isPastClass ? (
                          <span
                            className={`inline-flex h-6 w-6 items-center justify-center rounded-full ${
                              isAttended ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}>
                            {isAttended ? "O" : "X"}
                          </span>
                        ) : (
                          <span className="text-gray-400">예정됨</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="mt-4 flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-800">O</span>
                <span>출석</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-100 text-red-800">X</span>
                <span>결석</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAttendanceModal;
