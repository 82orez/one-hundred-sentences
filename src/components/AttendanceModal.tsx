// components/AttendanceModal.tsx
import React from "react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import clsx from "clsx";
import { X } from "lucide-react";
import Image from "next/image";

type ClassDate = {
  id: string;
  date: string;
  dayOfWeek: string;
  endTime?: string;
};

type Attendance = {
  classDateId: string;
  isAttended: boolean;
};

type Student = {
  id: string;
  name: string;
  nickName?: string;
  image?: string;
  isImagePublicOpen?: boolean;
  attendance: Attendance[];
};

interface AttendanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  isLoading: boolean;
  attendanceData: Student[];
  classDates: ClassDate[];
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ isOpen, onClose, courseTitle, isLoading, attendanceData, classDates }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative max-h-[90vh] w-[95vw] max-w-5xl overflow-auto rounded-lg bg-white p-4 shadow-lg">
        <button onClick={onClose} className="absolute top-4 right-4 rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <X size={24} />
        </button>
        <h2 className="mb-6 text-xl font-semibold">{courseTitle} - 출석부</h2>

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
  );
};

export default AttendanceModal;
