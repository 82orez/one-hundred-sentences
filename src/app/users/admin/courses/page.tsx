"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { Calendar, CheckSquare, Edit, Trash2, Plus, X, Clock } from "lucide-react";
import toast from "react-hot-toast";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";

// 타입 정의
interface Teacher {
  id: string;
  realName: string;
  email: string;
  phone: string;
  isActive: boolean; // isActive 속성 추가
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
  duration: string; // 추가: 수업 진행 시간
  endTime: string; // 추가: 수업 종료 시간
  createdAt: string;
  updatedAt: string;
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
    durationHours: "0", // 추가: 시간 부분
    durationMinutes: "25", // 추가: 분 부분
  });

  // 수업 종료 시간 계산
  const [endTime, setEndTime] = useState<string>("");

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

  // 강좌 수정 mutation
  const updateCourseMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      // 수업 진행 시간과 종료 시간 형식 설정
      const formattedData = {
        ...data,
        duration: parseInt(data.durationHours) > 0 ? `${data.durationHours}시간 ${data.durationMinutes}분` : `${data.durationMinutes}분`,
        endTime: endTime,
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
    });
  };

  // 강좌 편집 모드 시작
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);

    // duration에서 시간과 분 추출
    let durationHours = "0";
    let durationMinutes = "25";

    if (course.duration) {
      const durationMatch = course.duration.match(/(\d+)시간\s+(\d+)분/);
      if (durationMatch) {
        durationHours = durationMatch[1];
        durationMinutes = durationMatch[2];
      }
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
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 폼 제출 핸들러
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

    // 분 값 검증
    const minutesValue = parseInt(formData.durationMinutes);
    if (minutesValue < 0 || minutesValue > 59) {
      toast.error("분은 0에서 59 사이의 값으로 설정해야 합니다.");
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

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                {/* 시작일 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">수업 시작일 *</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>
                </div>

                {/* 종료일 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">수업 종료일 *</span>
                  </label>
                  <div className="input-group">
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      className="input input-bordered w-full"
                      required
                    />
                  </div>
                </div>

                {/* 수업 요일 선택 */}
                <div className="form-control mt-4 rounded-md border border-gray-300 p-3 md:col-span-2">
                  <label className="label">
                    <span className="label-text font-medium">수업 요일을 선택하세요. *</span>
                  </label>
                  <div className={""}>
                    <div className="mt-4 flex flex-wrap gap-8">
                      <label className="label flex cursor-pointer flex-col items-center justify-center gap-2">
                        <span className="label-text">월요일</span>
                        <input
                          type="checkbox"
                          name="scheduleMonday"
                          checked={formData.scheduleMonday}
                          onChange={handleInputChange}
                          className="checkbox checkbox-primary"
                        />
                      </label>
                      <label className="label flex cursor-pointer flex-col items-center justify-center gap-2">
                        <span className="label-text">화요일</span>
                        <input
                          type="checkbox"
                          name="scheduleTuesday"
                          checked={formData.scheduleTuesday}
                          onChange={handleInputChange}
                          className="checkbox checkbox-primary"
                        />
                      </label>
                      <label className="label flex cursor-pointer flex-col items-center justify-center gap-2">
                        <span className="label-text">수요일</span>
                        <input
                          type="checkbox"
                          name="scheduleWednesday"
                          checked={formData.scheduleWednesday}
                          onChange={handleInputChange}
                          className="checkbox checkbox-primary"
                        />
                      </label>
                      <label className="label flex cursor-pointer flex-col items-center justify-center gap-2">
                        <span className="label-text">목요일</span>
                        <input
                          type="checkbox"
                          name="scheduleThursday"
                          checked={formData.scheduleThursday}
                          onChange={handleInputChange}
                          className="checkbox checkbox-primary"
                        />
                      </label>
                      <label className="label flex cursor-pointer flex-col items-center justify-center gap-2">
                        <span className="label-text">금요일</span>
                        <input
                          type="checkbox"
                          name="scheduleFriday"
                          checked={formData.scheduleFriday}
                          onChange={handleInputChange}
                          className="checkbox checkbox-primary"
                        />
                      </label>
                      <label className="label flex cursor-pointer flex-col items-center justify-center gap-2">
                        <span className="label-text">토요일</span>
                        <input
                          type="checkbox"
                          name="scheduleSaturday"
                          checked={formData.scheduleSaturday}
                          onChange={handleInputChange}
                          className="checkbox checkbox-primary"
                        />
                      </label>
                      <label className="label flex cursor-pointer flex-col items-center justify-center gap-2">
                        <span className="label-text">일요일</span>
                        <input
                          type="checkbox"
                          name="scheduleSunday"
                          checked={formData.scheduleSunday}
                          onChange={handleInputChange}
                          className="checkbox checkbox-primary"
                        />
                      </label>
                    </div>
                  </div>
                </div>

                {/* 시작 시간 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">수업 시작 시간 *</span>
                  </label>
                  <select name="startTime" value={formData.startTime} onChange={handleInputChange} className="select select-bordered w-full" required>
                    <option value="">시작 시간을 선택하세요</option>
                    {Array.from({ length: 48 }).map((_, i) => {
                      const hour = Math.floor(i / 2);
                      const minute = i % 2 === 0 ? "00" : "30";
                      const time = `${hour.toString().padStart(2, "0")}:${minute}`;
                      return (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 수업 진행 시간 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">수업 진행 시간 *</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <input
                        type="number"
                        name="durationHours"
                        value={formData.durationHours}
                        onChange={handleInputChange}
                        onDoubleClick={(e) => e.currentTarget.select()}
                        className="input input-bordered w-full"
                        min="0"
                        required
                      />
                      <label className="label">
                        <span className="label-text">시간</span>
                      </label>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        name="durationMinutes"
                        value={formData.durationMinutes}
                        onChange={handleInputChange}
                        onDoubleClick={(e) => e.currentTarget.select()}
                        className="input input-bordered w-full"
                        min="0"
                        max="59"
                        required
                      />
                      <label className="label">
                        <span className="label-text">분 (0-59)</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* 수업 종료 시간 (계산됨) */}
                {formData.startTime && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">계산된 수업 종료 시간</span>
                    </label>
                    <div className="flex h-12 items-center rounded-lg border border-gray-300 bg-gray-100 px-4">
                      <Clock size={18} className="mr-2 text-gray-500" />
                      <span>{endTime}</span>
                    </div>
                  </div>
                )}
              </div>

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
