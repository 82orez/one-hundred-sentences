"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format, addDays, getDay, isValid } from "date-fns";
import { Calendar, CheckSquare, Edit, Trash2, Plus, X, Clock } from "lucide-react";
import toast from "react-hot-toast";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";

// 타입 정의 확장
interface Teacher {
  id: string;
  realName: string;
  email: string;
  phone: string;
  isActive: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  teacherId: string;
  teacher: Teacher;
  scheduleMonday: boolean;
  scheduleTuesday: boolean;
  scheduleWednesday: boolean;
  scheduleThursday: boolean;
  scheduleFriday: boolean;
  scheduleSaturday: boolean;
  scheduleSunday: boolean;
  startDate: string;
  endDate: string;
  startTime: string;
  duration: string;
  endTime: string;
  classCount: number; // 수업 횟수 추가
  classDates: string; // 수업 날짜들 추가
  createdAt: string;
  updatedAt: string;
}

// 날짜와 요일 정보를 담는 인터페이스
interface ClassDate {
  date: string;
  dayOfWeek: string;
}

export default function CoursePage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    teacherId: "",
    scheduleMonday: false,
    scheduleTuesday: false,
    scheduleWednesday: false,
    scheduleThursday: false,
    scheduleFriday: false,
    scheduleSaturday: false,
    scheduleSunday: false,
    startDate: "",
    endDate: "",
    startTime: "",
    durationHours: "0",
    durationMinutes: "25",
    classCount: 1, // 수업 횟수 추가
  });

  // 수업 종료 시간 계산
  const [endTime, setEndTime] = useState<string>("");

  // 수업 날짜 목록 상태 추가
  const [classDates, setClassDates] = useState<ClassDate[]>([]);

  // 선택된 수업 요일 배열 생성 함수
  const getSelectedDaysArray = () => {
    const days = [];
    if (formData.scheduleMonday) days.push(1); // 월요일: 1
    if (formData.scheduleTuesday) days.push(2); // 화요일: 2
    if (formData.scheduleWednesday) days.push(3); // 수요일: 3
    if (formData.scheduleThursday) days.push(4); // 목요일: 4
    if (formData.scheduleFriday) days.push(5); // 금요일: 5
    if (formData.scheduleSaturday) days.push(6); // 토요일: 6
    if (formData.scheduleSunday) days.push(0); // 일요일: 0
    return days;
  };

  // 요일 이름 가져오기 함수
  const getDayOfWeekName = (dayNumber: number): string => {
    const days = ["일", "월", "화", "수", "목", "금", "토"];
    return days[dayNumber];
  };

  // 수업 날짜 및 종료일 계산
  useEffect(() => {
    if (formData.startDate && formData.classCount > 0) {
      const startDate = new Date(formData.startDate);

      // 유효한 날짜인지 확인
      if (!isValid(startDate)) {
        setClassDates([]);
        return;
      }

      const selectedDays = getSelectedDaysArray();

      // 수업 요일이 선택되지 않았으면 계산하지 않음
      if (selectedDays.length === 0) {
        setClassDates([]);
        return;
      }

      // 시작일의 요일이 선택된 요일 중 하나인지 확인
      const startDayOfWeek = getDay(startDate);
      if (!selectedDays.includes(startDayOfWeek)) {
        toast.error("시작일은 선택한 수업 요일 중 하나여야 합니다.");
        return;
      }

      // 수업 날짜 계산
      const tempDates: ClassDate[] = [];
      let currentDate = new Date(startDate);
      let classesScheduled = 0;

      while (classesScheduled < formData.classCount) {
        const currentDayOfWeek = getDay(currentDate);

        if (selectedDays.includes(currentDayOfWeek)) {
          tempDates.push({
            date: format(currentDate, "yyyy-MM-dd"),
            dayOfWeek: getDayOfWeekName(currentDayOfWeek),
          });
          classesScheduled++;
        }

        // 다음 날짜로 이동
        currentDate = addDays(currentDate, 1);
      }

      // 종료일 계산 (마지막 수업 날짜)
      if (tempDates.length > 0) {
        const lastClassDate = tempDates[tempDates.length - 1].date;
        setFormData((prev) => ({ ...prev, endDate: lastClassDate }));
      }

      setClassDates(tempDates);
    } else {
      setClassDates([]);
    }
  }, [
    formData.startDate,
    formData.classCount,
    formData.scheduleMonday,
    formData.scheduleTuesday,
    formData.scheduleWednesday,
    formData.scheduleThursday,
    formData.scheduleFriday,
    formData.scheduleSaturday,
    formData.scheduleSunday,
  ]);

  // 수업 시간이 변경될 때마다 종료 시간 재계산
  useEffect(() => {
    if (formData.startTime) {
      const [hours, minutes] = formData.startTime.split(":").map(Number);
      const durationHours = parseInt(formData.durationHours) || 0;
      const durationMinutes = parseInt(formData.durationMinutes) || 0;

      // 종료 시간 계산
      let endHour = hours + durationHours;
      let endMinute = minutes + durationMinutes;

      // 분이 60을 넘으면 시간 조정
      if (endMinute >= 60) {
        endHour += Math.floor(endMinute / 60);
        endMinute %= 60;
      }

      // 24시간 형식으로 변환
      endHour %= 24;

      const calculatedEndTime = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
      setEndTime(calculatedEndTime);
    }
  }, [formData.startTime, formData.durationHours, formData.durationMinutes]);

  // 활성 강사 목록 불러오기
  const { data: teachers = [] } = useQuery({
    queryKey: ["teachers"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/active-teachers");
      return response.data.teachers;
    },
  });

  // 강좌 목록 불러오기
  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const response = await axios.get("/api/admin/courses");
      return response.data.courses;
    },
  });

  // 강좌 생성 mutation
  const createCourseMutation = useMutation({
    mutationFn: async (data: any) => {
      // 수업 진행 시간과 종료 시간 형식 설정
      const formattedData = {
        ...data,
        duration: parseInt(data.durationHours) > 0 ? `${data.durationHours}시간 ${data.durationMinutes}분` : `${data.durationMinutes}분`,
        endTime: endTime,
        // 수업 날짜 목록 JSON 형식으로 변환
        classDates: JSON.stringify(classDates),
      };

      // durationHours와 durationMinutes는 제출하지 않음
      delete formattedData.durationHours;
      delete formattedData.durationMinutes;

      return axios.post("/api/admin/courses", formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      resetForm();
      setIsModalOpen(false);
      toast.success("강좌가 성공적으로 생성되었습니다.");
    },
    onError: (error) => {
      toast.error("강좌 생성에 실패했습니다.");
      console.error("강좌 생성 에러:", error);
    },
  });

  // 강좌 수정 mutation 수정
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // 수업 진행 시간과 종료 시간 형식 설정
      const formattedData = {
        ...data,
        duration: parseInt(data.durationHours) > 0 ? `${data.durationHours}시간 ${data.durationMinutes}분` : `${data.durationMinutes}분`,
        endTime: endTime,
        // 수업 날짜 목록 JSON 형식으로 변환
        classDates: JSON.stringify(classDates),
      };

      // durationHours와 durationMinutes는 제출하지 않음
      delete formattedData.durationHours;
      delete formattedData.durationMinutes;

      return axios.put(`/api/admin/courses?id=${id}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      resetForm();
      setIsModalOpen(false);
      setEditingCourse(null);
      toast.success("강좌가 성공적으로 수정되었습니다.");
    },
    onError: (error) => {
      toast.error("강좌 수정에 실패했습니다.");
      console.error("강좌 수정 에러:", error);
    },
  });

  // 강좌 삭제 mutation
  const deleteCourseMutation = useMutation({
    mutationFn: async (id: string) => {
      return axios.delete(`/api/admin/courses?id=${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("강좌가 성공적으로 삭제되었습니다.");
    },
    onError: (error) => {
      toast.error("강좌 삭제에 실패했습니다.");
      console.error("강좌 삭제 에러:", error);
    },
  });

  // 폼 데이터 초기화
  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      teacherId: "",
      scheduleMonday: false,
      scheduleTuesday: false,
      scheduleWednesday: false,
      scheduleThursday: false,
      scheduleFriday: false,
      scheduleSaturday: false,
      scheduleSunday: false,
      startDate: "",
      endDate: "",
      startTime: "",
      durationHours: "0",
      durationMinutes: "25",
      classCount: 1,
    });
    setClassDates([]);
  };

  // 강좌 편집 모드 시작 함수 수정
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);

    // duration 에서 시간과 분 추출
    let durationHours = "0";
    let durationMinutes = "25";

    if (course.duration) {
      // "X시간 Y분" 형식 매칭
      const fullMatch = course.duration.match(/(\d+)시간\s*(\d+)분/);
      // "Y분"만 있는 형식 매칭
      const onlyMinutesMatch = course.duration.match(/^(\d+)분$/);

      if (fullMatch) {
        durationHours = fullMatch[1];
        durationMinutes = fullMatch[2];
      } else if (onlyMinutesMatch) {
        durationHours = "0";
        durationMinutes = onlyMinutesMatch[1];
      }
    }

    // 수업 날짜 설정
    if (course.classDates) {
      try {
        const parsedDates = JSON.parse(course.classDates);
        setClassDates(parsedDates);
      } catch (error) {
        console.error("수업 날짜 파싱 오류:", error);
        setClassDates([]);
      }
    } else {
      setClassDates([]);
    }

    setFormData({
      title: course.title,
      description: course.description || "",
      teacherId: course.teacherId,
      scheduleMonday: course.scheduleMonday,
      scheduleTuesday: course.scheduleTuesday,
      scheduleWednesday: course.scheduleWednesday,
      scheduleThursday: course.scheduleThursday,
      scheduleFriday: course.scheduleFriday,
      scheduleSaturday: course.scheduleSaturday,
      scheduleSunday: course.scheduleSunday,
      startDate: course.startDate ? course.startDate.split("T")[0] : "",
      endDate: course.endDate ? course.endDate.split("T")[0] : "",
      startTime: course.startTime || "",
      durationHours,
      durationMinutes,
      classCount: course.classCount || 1,
    });
    setIsModalOpen(true);
  };

  // 강좌 삭제 확인
  const handleDeleteCourse = (id: string) => {
    if (window.confirm("정말로 이 강좌를 삭제하시겠습니까?")) {
      deleteCourseMutation.mutate(id);
    }
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "durationMinutes") {
      // 분 값이 0-59 범위 내에 있는지 확인
      const minutesValue = parseInt(value);
      if (isNaN(minutesValue) || (minutesValue >= 0 && minutesValue <= 59)) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else if (name === "classCount") {
      // 수업 횟수는 최소 1회 이상이어야 함
      const countValue = parseInt(value);
      if (!isNaN(countValue) && countValue > 0) {
        setFormData((prev) => ({ ...prev, [name]: countValue }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 폼 제출 핸들러 수정
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 종료일이 시작일보다 빠른 경우
    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toast.error("종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }

    // 수업 요일이 하나도 선택되지 않은 경우
    const isNoScheduleSelected = !(
      formData.scheduleMonday ||
      formData.scheduleTuesday ||
      formData.scheduleWednesday ||
      formData.scheduleThursday ||
      formData.scheduleFriday ||
      formData.scheduleSaturday ||
      formData.scheduleSunday
    );

    if (isNoScheduleSelected) {
      toast.error("수업 요일을 최소 한 개 이상 선택해야 합니다.");
      return;
    }

    // 수업 시작일 검증
    if (!formData.startDate) {
      toast.error("수업 시작일을 설정해야 합니다.");
      return;
    }

    // 시작일이 선택한 요일과 일치하는지 확인
    const startDayOfWeek = getDay(new Date(formData.startDate));
    const selectedDays = getSelectedDaysArray();

    if (!selectedDays.includes(startDayOfWeek)) {
      toast.error("시작일은 선택한 수업 요일 중 하나여야 합니다.");
      return;
    }

    // 분 값 검증
    const minutesValue = parseInt(formData.durationMinutes);
    if (minutesValue < 0 || minutesValue > 59) {
      toast.error("분은 0에서 59 사이의 값으로 설정해야 합니다.");
      return;
    }

    // 수업 날짜 리스트가 비어있으면 알림
    if (classDates.length === 0) {
      toast.error("수업 날짜가 계산되지 않았습니다.");
      return;
    }

    if (editingCourse) {
      updateCourseMutation.mutate({ id: editingCourse.id, data: formData });
    } else {
      createCourseMutation.mutate(formData);
    }
  };

  // 모달 열기
  const openModal = () => {
    resetForm();
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  // 요일 포맷팅 함수
  const formatSchedule = (course: Course) => {
    const days = [];
    if (course.scheduleMonday) days.push("월");
    if (course.scheduleTuesday) days.push("화");
    if (course.scheduleWednesday) days.push("수");
    if (course.scheduleThursday) days.push("목");
    if (course.scheduleFriday) days.push("금");
    if (course.scheduleSaturday) days.push("토");
    if (course.scheduleSunday) days.push("일");

    return days.length > 0 ? days.join(", ") : "없음";
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "미정";
    return format(new Date(dateString), "yyyy-MM-dd");
  };

  if (isLoading) return <LoadingPageSkeleton />;

  return (
    <div className="container mx-auto p-6">
      <h2 className="mb-6 text-2xl font-bold">강좌 관리</h2>

      {/* 강좌 추가 버튼 */}
      <div className="mb-6 flex justify-end">
        <button onClick={openModal} className="btn btn-primary gap-2">
          <Plus size={16} />새 강좌 추가
        </button>
      </div>

      {/* 강좌 목록 테이블 */}
      <div className="overflow-x-auto rounded-lg bg-white p-6 shadow-md">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : courses.length === 0 ? (
          <p className="py-8 text-center text-gray-500">등록된 강좌가 없습니다.</p>
        ) : (
          <table className="table-zebra table w-full">
            <thead>
              <tr>
                <th>강좌명</th>
                <th>강사</th>
                <th>연락처</th>
                <th>이메일</th>
                <th>수업 일정</th>
                <th>시작일</th>
                <th>시작 시간</th>
                <th>수업 진행 시간</th>
                <th>수업 종료 시간</th>
                <th>종료일</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course: Course) => (
                <tr key={course.id}>
                  <td className="font-medium">{course.title}</td>
                  <td>{course.teacher?.realName || "미지정"}</td>
                  <td>{course.teacher?.phone || "-"}</td>
                  <td>{course.teacher?.email || "-"}</td>
                  <td>{formatSchedule(course)}</td>
                  <td>{formatDate(course.startDate)}</td>
                  <td>{course.startTime || "-"}</td>
                  <td>{course.duration || "25분"}</td>
                  <td>{course.endTime || "-"}</td>
                  <td>{formatDate(course.endDate)}</td>
                  <td className="flex gap-2">
                    <button onClick={() => handleEditCourse(course)} className="btn btn-sm btn-ghost" aria-label="수정">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteCourse(course.id)} className="btn btn-sm btn-ghost text-error" aria-label="삭제">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* 강좌 생성/수정 모달 */}
      {isModalOpen && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-white p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold">{editingCourse ? "강좌 정보 수정" : "새 강좌 추가"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="btn btn-sm btn-circle">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 강좌명 */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">강좌명 *</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="input input-bordered w-full"
                  required
                />
              </div>

              {/* 강좌 설명 */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">강좌 설명</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered h-24 w-full"
                />
              </div>

              {/* 강사 선택 */}
              <div className="form-control md:col-span-2">
                <label className="label">
                  <span className="label-text font-medium">강사 *</span>
                </label>
                <select name="teacherId" value={formData.teacherId} onChange={handleInputChange} className="select select-bordered w-full" required>
                  <option value="">강사를 선택하세요</option>
                  {teachers
                    .filter((teacher: Teacher) => teacher.isActive)
                    .map((teacher: Teacher) => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.realName}
                      </option>
                    ))}
                </select>
              </div>

              {/* 요일 선택 필드 */}
              <div className="space-y-2">
                <p className="font-medium text-gray-700">수업 요일 선택</p>
                <div className="flex flex-wrap gap-4">
                  {[
                    { name: "scheduleMonday", label: "월" },
                    { name: "scheduleTuesday", label: "화" },
                    { name: "scheduleWednesday", label: "수" },
                    { name: "scheduleThursday", label: "목" },
                    { name: "scheduleFriday", label: "금" },
                    { name: "scheduleSaturday", label: "토" },
                    { name: "scheduleSunday", label: "일" },
                  ].map((day) => (
                    <label key={day.name} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name={day.name}
                        checked={(formData as any)[day.name]}
                        onChange={handleInputChange}
                        className="h-5 w-5 rounded border-gray-300 text-indigo-600"
                      />
                      <span>{day.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* 수업 횟수 필드 (신규 추가) */}
              <div className="space-y-2">
                <label htmlFor="classCount" className="block font-medium text-gray-700">
                  수업 횟수
                </label>
                <input
                  type="number"
                  id="classCount"
                  name="classCount"
                  value={formData.classCount}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* 시작일 필드 */}
              <div className="space-y-2">
                <label htmlFor="startDate" className="block font-medium text-gray-700">
                  수업 시작일 (선택한 요일에 맞는 날짜로 선택)
                </label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* 종료일 필드 (자동 계산됨, 읽기 전용) */}
              <div className="space-y-2">
                <label htmlFor="endDate" className="block font-medium text-gray-700">
                  수업 종료일 (자동 계산됨)
                </label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  readOnly
                  className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm"
                />
              </div>

              {/* 수업 날짜 목록 표시 (신규 추가) */}
              {classDates.length > 0 && (
                <div className="space-y-2">
                  <p className="font-medium text-gray-700">수업 날짜 목록</p>
                  <div className="max-h-60 overflow-y-auto rounded-md border border-gray-300 p-3">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="py-1 text-left">날짜</th>
                          <th className="py-1 text-left">요일</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classDates.map((date, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-1">{date.date}</td>
                            <td className="py-1">{date.dayOfWeek}요일</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 시작 시간 필드 */}
              <div className="space-y-2">
                <label htmlFor="startTime" className="block font-medium text-gray-700">
                  수업 시작 시간
                </label>
                <input
                  type="time"
                  id="startTime"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleInputChange}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              {/* 수업 진행 시간 필드 */}
              <div className="space-y-2">
                <label className="block font-medium text-gray-700">수업 진행 시간</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    id="durationHours"
                    name="durationHours"
                    value={formData.durationHours}
                    onChange={handleInputChange}
                    onDoubleClick={(e) => e.currentTarget.select()}
                    min="0"
                    max="10"
                    className="w-20 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span>시간</span>
                  <input
                    type="number"
                    id="durationMinutes"
                    name="durationMinutes"
                    value={formData.durationMinutes}
                    onChange={handleInputChange}
                    onDoubleClick={(e) => e.currentTarget.select()}
                    min="0"
                    max="59"
                    className="w-20 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  <span>분</span>
                </div>
              </div>

              {/* 수업 종료 시간 (자동 계산됨) */}
              {endTime && (
                <div className="space-y-2">
                  <label className="block font-medium text-gray-700">수업 종료 시간 (자동 계산됨)</label>
                  <input type="time" value={endTime} readOnly className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm" />
                </div>
              )}

              {/* 강사 선택 필드 */}

              <div className="mt-6 flex justify-end gap-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-outline">
                  취소
                </button>
                <button type="submit" className="btn btn-primary" disabled={createCourseMutation.isPending || updateCourseMutation.isPending}>
                  {(createCourseMutation.isPending || updateCourseMutation.isPending) && <span className="loading loading-spinner loading-xs"></span>}
                  {editingCourse ? "수정하기" : "추가하기"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
