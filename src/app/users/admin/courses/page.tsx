"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format } from "date-fns";
import { Calendar, CheckSquare, Edit, Trash2, Plus, X } from "lucide-react";
import toast from "react-hot-toast";

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
  });

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
    mutationFn: async (data: typeof formData) => {
      return axios.post("/api/admin/courses", data);
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
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      return axios.put(`/api/admin/courses?id=${id}`, data);
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
    });
  };

  // 강좌 편집 모드 시작
  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
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
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // 폼 제출 핸들러
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
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
                <div className="form-control">
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
                    <span className="label-text font-medium">시작일 *</span>
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
                    <span className="btn btn-square btn-ghost">
                      <Calendar size={16} />
                    </span>
                  </div>
                </div>

                {/* 종료일 */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-medium">종료일 *</span>
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
                    <span className="btn btn-square btn-ghost">
                      <Calendar size={16} />
                    </span>
                  </div>
                </div>

                {/* 수업 요일 선택 */}
                <div className="form-control md:col-span-2">
                  <label className="label">
                    <span className="label-text font-medium">수업 요일</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        name="scheduleMonday"
                        checked={formData.scheduleMonday}
                        onChange={handleInputChange}
                        className="checkbox checkbox-primary"
                      />
                      <span className="label-text">월</span>
                    </label>
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        name="scheduleTuesday"
                        checked={formData.scheduleTuesday}
                        onChange={handleInputChange}
                        className="checkbox checkbox-primary"
                      />
                      <span className="label-text">화</span>
                    </label>
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        name="scheduleWednesday"
                        checked={formData.scheduleWednesday}
                        onChange={handleInputChange}
                        className="checkbox checkbox-primary"
                      />
                      <span className="label-text">수</span>
                    </label>
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        name="scheduleThursday"
                        checked={formData.scheduleThursday}
                        onChange={handleInputChange}
                        className="checkbox checkbox-primary"
                      />
                      <span className="label-text">목</span>
                    </label>
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        name="scheduleFriday"
                        checked={formData.scheduleFriday}
                        onChange={handleInputChange}
                        className="checkbox checkbox-primary"
                      />
                      <span className="label-text">금</span>
                    </label>
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        name="scheduleSaturday"
                        checked={formData.scheduleSaturday}
                        onChange={handleInputChange}
                        className="checkbox checkbox-primary"
                      />
                      <span className="label-text">토</span>
                    </label>
                    <label className="label cursor-pointer gap-2">
                      <input
                        type="checkbox"
                        name="scheduleSunday"
                        checked={formData.scheduleSunday}
                        onChange={handleInputChange}
                        className="checkbox checkbox-primary"
                      />
                      <span className="label-text">일</span>
                    </label>
                  </div>
                </div>
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
