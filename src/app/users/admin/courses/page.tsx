"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { format, addDays, getDay, isValid } from "date-fns";
import { Calendar, CheckSquare, Edit, Trash2, Plus, X, Clock } from "lucide-react";
import { RiArrowGoBackFill } from "react-icons/ri";
import { FaList } from "react-icons/fa6";
import toast from "react-hot-toast";
import clsx from "clsx";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import DatePickerCalendar from "@/components/DatePickerCalendar";
import DatePickerCalendarAddOrRemove from "@/components/DatePickerCalendarAddOrRemove";
import TeacherSelector from "@/components/TeacherSelector";
import EnrollmentModal from "@/components/EnrollmentModal";
import StudentListModal from "@/components/StudentListModal";

// 타입 정의 확장
interface Teacher {
  id: string;
  isActive: boolean;
  // User 모델에서 가져오는 정보
  user: {
    email: string;
    phone: string;
    realName: string;
  };
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
  classCount: number;
  classDates: ClassDate[]; // 문자열 대신 객체 배열로 변경
  status: "대기 중" | "진행 중" | "완료"; // 상태 필드 추가

  createdAt: string;
  updatedAt: string;
}

// ClassDate 인터페이스 추가
interface ClassDate {
  id: string;
  courseId: string;
  date: string;
  dayOfWeek: string;
  startTime: string | null; // 시작 시간 추가
  endTime: string | null; // 종료 시간 추가

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
    durationHours: "0",
    durationMinutes: "25",
    classCount: 1, // 수업 횟수 추가
  });

  // 수업 종료 시간 계산
  const [endTime, setEndTime] = useState<string>("");

  // 달력 표시 상태 관리
  const [showStartDateCalendar, setShowStartDateCalendar] = useState(false);
  const [showClassDateCalendar, setShowClassDateCalendar] = useState(false);

  // 달력 보기 상태
  const [showCalendarView, setShowCalendarView] = useState(false);

  // 수업 날짜 목록 상태 추가
  const [classDates, setClassDates] = useState<ClassDate[]>([]);

  // 수업 추가 관련 상태 변수
  const [showAddClassDateForm, setShowAddClassDateForm] = useState(false);
  const [newClassDate, setNewClassDate] = useState("");

  const [statusFilter, setStatusFilter] = useState<string>("전체 보기");

  // 선택된 강사의 일정 충돌 상태를 관리하는 상태 변수 추가
  const [hasTeacherConflict, setHasTeacherConflict] = useState(false);

  // 코스 페이지에 모달 상태 관리를 위한 코드 추가
  const [isEnrollmentModalOpen, setIsEnrollmentModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // 버튼 부분 수정 (해당 페이지 컴포넌트 내에서)
  const [isStudentListModalOpen, setIsStudentListModalOpen] = useState(false);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<Course | null>(null);

  // 수강생 관리 버튼 클릭 핸들러
  const handleManageStudentsClick = (course: Course) => {
    setSelectedCourseForStudents(course);
    setIsStudentListModalOpen(true);
  };

  // 등록 버튼 클릭 핸들러
  const handleEnrollmentClick = (course: Course) => {
    setSelectedCourse(course);
    setIsEnrollmentModalOpen(true);
  };

  // 수업 날짜 목록이 변경될 때마다 종료일 업데이트
  useEffect(() => {
    // 수업 일자가 하나 이상 있는 경우에만 처리
    if (classDates.length > 0) {
      // 날짜 문자열을 Date 객체로 변환하여 가장 마지막 날짜 찾기
      const dates = classDates.map((classDate) => new Date(classDate.date));
      const latestDate = new Date(Math.max(...dates.map((date) => date.getTime())));

      // 종료일 업데이트
      setFormData((prev) => ({
        ...prev,
        endDate: format(latestDate, "yyyy-MM-dd"),
      }));
    }
  }, [classDates]);

  // 날짜 선택 핸들러
  const handleStartDateSelect = (date: Date) => {
    setFormData((prev) => ({ ...prev, startDate: format(date, "yyyy-MM-dd") }));
    setShowStartDateCalendar(false);
  };

  const handleClassDateSelect = (date: Date) => {
    setNewClassDate(format(date, "yyyy-MM-dd"));
    setShowClassDateCalendar(false);
  };

  // 목록 보기 모드에서 특정 수업 일자 삭제 함수
  const handleDeleteClassDateByDate = (dateToDelete: string) => {
    // 시작일은 삭제할 수 없음
    if (dateToDelete === formData.startDate) {
      toast.error("수업 시작일은 삭제할 수 없습니다.");
      return;
    }
    setClassDates((prev) => prev.filter((d) => d.date !== dateToDelete));
  };

  // 수업 일자 추가 함수
  const handleAddClassDate = () => {
    if (!newClassDate) {
      toast.error("추가할 수업 날짜를 선택해주세요.");
      return;
    }

    // 날짜 유효성 검사
    const dateToAdd = new Date(newClassDate);
    if (!isValid(dateToAdd)) {
      toast.error("유효한 날짜를 선택해주세요.");
      return;
    }

    // 이미 있는 날짜인지 확인
    const dateString = format(dateToAdd, "yyyy-MM-dd");
    const isDuplicate = classDates.some((d) => d.date === dateString);
    if (isDuplicate) {
      toast.error("이미 등록된 수업 날짜입니다.");
      return;
    }

    // 새 수업 일자 추가
    // @ts-ignore
    setClassDates((prev) => [
      ...prev,
      {
        date: dateString,
        dayOfWeek: getDayOfWeekName(getDay(dateToAdd)),
      },
    ]);

    // 입력 필드 초기화
    setNewClassDate("");
    setShowAddClassDateForm(false);
    toast.success("수업이 추가되었습니다.");
  };

  // 원래 수업 일정 불러오기 함수
  const loadOriginalClassDates = async () => {
    if (!editingCourse) return;

    try {
      const response = await axios.get(`/api/admin/courses?id=${editingCourse.id}`);
      const course = response.data.course;

      if (course.classDates && course.classDates.length > 0) {
        // @ts-ignore
        setClassDates(
          course.classDates.map((date: any) => ({
            date: format(new Date(date.date), "yyyy-MM-dd"), // 🔽 이 부분 수정
            dayOfWeek: date.dayOfWeek,
          })),
        );
        toast.success("원래 수업 일정을 불러왔습니다.");
      } else {
        toast.error("불러올 수업 일정이 없습니다.");
      }
    } catch (error) {
      console.error("수업 일정 불러오기 오류:", error);
      toast.error("수업 일정을 불러오는데 실패했습니다.");
    }
  };

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
    // 수정 모드일 때는 수업 날짜를 자동 생성하지 않음
    if (editingCourse) return;

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
          // @ts-ignore
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
      if (!editingCourse) {
        // 편집 모드가 아닐 때만 classDates 초기화
        setClassDates([]);
      }
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
    editingCourse,
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

    // 수업 날짜 설정 (서버에서 가져온 실제 데이터 사용)
    if (course.classDates && course.classDates.length > 0) {
      setClassDates(
        // @ts-ignore
        course.classDates.map((date) => ({
          date: new Date(date.date).toISOString().split("T")[0], // 'YYYY-MM-DD' 형식으로 변환
          dayOfWeek: date.dayOfWeek,
        })),
      );
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
      // 🔽 여기 수정
      startDate: course.startDate ? format(new Date(course.startDate), "yyyy-MM-dd") : "",
      endDate: course.endDate ? format(new Date(course.endDate), "yyyy-MM-dd") : "",
      startTime: course.startTime || "",
      durationHours,
      durationMinutes,
      classCount: course.classCount || 1,
    });

    setEndTime(course.endTime || "");
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

    if (!formData.title) {
      toast.error("강좌 제목을 입력해주세요.");
      return;
    }

    if (!formData.teacherId) {
      toast.error("강사를 선택해주세요.");
      return;
    }

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

  // 상태에 따른 필터링 된 강좌 목록
  const filteredCourses = courses.filter((course) => statusFilter === "전체 보기" || course.status === statusFilter);

  const isReadyToSelectStartDateAndTeacher = getSelectedDaysArray().length > 0 && formData.classCount > 0 && formData.startTime.trim() !== "";

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

      {/* 상태 필터 추가 */}
      <div className="flex items-center space-x-4">
        <div className="flex space-x-3">
          {["전체 보기", "대기 중", "진행 중", "완료"].map((status) => {
            const isActive = statusFilter === status;
            const baseClasses =
              "min-w-[82px] rounded px-3 py-1 text-sm border transition-colors duration-200 hover:brightness-105 focus:outline-none cursor-pointer focus:ring-2 focus:ring-offset-2";

            const colorClasses = {
              "전체 보기": isActive
                ? "bg-gray-600 text-white font-semibold border-gray-700 shadow focus:ring-gray-500"
                : "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 focus:ring-gray-300",
              "대기 중": isActive
                ? "bg-blue-600 text-white font-semibold border-blue-700 shadow focus:ring-blue-500"
                : "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 focus:ring-blue-300",
              "진행 중": isActive
                ? "bg-green-600 text-white font-semibold border-green-700 shadow focus:ring-green-500"
                : "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 focus:ring-green-300",
              완료: isActive
                ? "bg-gray-400 text-white font-semibold border-gray-700 shadow focus:ring-gray-500"
                : "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 focus:ring-gray-300",
            };

            return (
              <button key={status} onClick={() => setStatusFilter(status)} className={clsx(baseClasses, colorClasses[status])}>
                {status}
              </button>
            );
          })}
        </div>
      </div>

      {/* 강좌 목록 테이블 */}
      <div className="mt-3 overflow-x-auto rounded-lg border bg-white p-4 shadow-md">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : filteredCourses.length === 0 ? (
          <p className="py-8 text-center text-gray-500">등록된 강좌가 없습니다.</p>
        ) : (
          <table className="table-zebra table w-full">
            <thead>
              <tr>
                <th>강좌명</th>
                <th>강사</th>
                <th>수업 일정</th>
                <th>시작일</th>
                <th>수업 시작</th>
                <th>진행 시간</th>
                <th>종료일</th>
                <th>수강생 관리</th>
                <th>상태</th>
                <th>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((course: Course) => (
                <tr key={course.id}>
                  <td className="font-medium">{course.title}</td>
                  <td>{course.teacher?.user.realName || "미지정"}</td>
                  <td>{formatSchedule(course)}</td>
                  <td>{formatDate(course.startDate)}</td>
                  <td>{course.startTime || "-"}</td>
                  <td>{course.duration || "-"}</td>
                  <td>{formatDate(course.endDate)}</td>
                  <td className="flex gap-2">
                    <button onClick={() => handleEnrollmentClick(course)} className="rounded bg-indigo-500 p-2 text-white hover:bg-indigo-600">
                      등록
                    </button>
                    <button onClick={() => handleManageStudentsClick(course)} className="rounded bg-indigo-500 p-2 text-white hover:bg-indigo-600">
                      관리
                    </button>
                  </td>
                  <td>
                    <span
                      className={clsx(
                        "rounded px-2 py-1 text-sm",
                        course.status === "대기 중" && "bg-blue-100 text-blue-800",
                        course.status === "진행 중" && "bg-green-100 text-green-800",
                        course.status === "완료" && "bg-gray-100 text-gray-800",
                      )}>
                      {course.status}
                    </span>
                  </td>
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

      {/* 수강생 등록 모달 */}
      {selectedCourse && (
        <EnrollmentModal
          isOpen={isEnrollmentModalOpen}
          onClose={() => setIsEnrollmentModalOpen(false)}
          courseId={selectedCourse.id}
          courseTitle={selectedCourse.title}
        />
      )}

      {/* 수강생 관리 모달 */}
      {selectedCourseForStudents && (
        <StudentListModal
          isOpen={isStudentListModalOpen}
          onClose={() => setIsStudentListModalOpen(false)}
          courseId={selectedCourseForStudents.id}
          courseTitle={selectedCourseForStudents.title}
        />
      )}

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
                  <span className="label-text font-medium">강좌 설명 및 참고 사항</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="textarea textarea-bordered h-24 w-full"
                />
              </div>

              {/* 요일 선택 필드 */}
              <div
                className={clsx("space-y-2 rounded-md border border-gray-300 px-3 py-2 shadow-sm", {
                  "pointer-events-none opacity-50": !!editingCourse,
                })}>
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

              {/* 수업 횟수 필드 */}
              <div className={clsx("flex items-center gap-4", { "pointer-events-none opacity-50": !!editingCourse })}>
                <label htmlFor="classCount" className="block font-medium text-gray-700">
                  전체 수업 횟수 선택 :
                </label>
                <input
                  type="number"
                  id="classCount"
                  name="classCount"
                  value={formData.classCount}
                  onChange={handleInputChange}
                  onDoubleClick={(e) => e.currentTarget.select()}
                  min="1"
                  className="max-w-[80px] rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
                <div>회</div>
              </div>

              {/* 수업 시작 시간 필드 */}
              <div className={clsx("space-y-2", { "pointer-events-none opacity-50": !!editingCourse })}>
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

              <div className={clsx("flex items-center gap-32", { "pointer-events-none opacity-50": !!editingCourse })}>
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
                    <input
                      type="time"
                      value={endTime}
                      readOnly
                      className="w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 shadow-sm"
                    />
                  </div>
                )}
              </div>

              {/* 시작일 필드 */}
              <div className={clsx("space-y-2", { "pointer-events-none opacity-50": !!editingCourse })}>
                <label htmlFor="startDate" className="block font-medium text-gray-700">
                  수업 시작일 (선택한 요일에 맞는 날짜로 선택)
                </label>
                <div className="relative">
                  <div
                    className={clsx("flex items-center rounded border border-gray-300 p-2 shadow-sm", {
                      "cursor-pointer": isReadyToSelectStartDateAndTeacher,
                      "pointer-events-none opacity-50": !isReadyToSelectStartDateAndTeacher,
                      "cursor-not-allowed": !isReadyToSelectStartDateAndTeacher,
                    })}
                    onClick={() => {
                      if (isReadyToSelectStartDateAndTeacher) {
                        setShowStartDateCalendar(!showStartDateCalendar);
                      }
                    }}>
                    <Calendar className="mr-2 h-5 w-5" />
                    {formData.startDate || "시작일을 선택하세요"}
                  </div>

                  {!isReadyToSelectStartDateAndTeacher && (
                    <p className="mt-1 text-sm text-red-500">수업 요일, 수업 횟수, 시작 시간을 먼저 입력해야 시작일을 선택할 수 있습니다.</p>
                  )}

                  {showStartDateCalendar && (
                    <div className="absolute z-10 mt-1">
                      <DatePickerCalendar
                        selectedDate={formData.startDate ? new Date(formData.startDate) : undefined}
                        onDateSelect={handleStartDateSelect}
                        minDate={new Date()} // 오늘 이후 날짜만 선택 가능
                        onCancel={() => setShowStartDateCalendar(false)}
                      />
                    </div>
                  )}
                </div>
              </div>
              {editingCourse && (
                <p className={"text-red-400"}>⚠️ 수업 요일, 횟수, 시간, 시작일 등은 수정할 수 없습니다. 강좌 삭제 후 새로 생성바랍니다.</p>
              )}

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

              {/* 수업 날짜 목록 표시 */}
              <div
                className={clsx("mb-4 rounded border p-4", {
                  "pointer-events-none opacity-50": !isReadyToSelectStartDateAndTeacher,
                  "cursor-not-allowed": !isReadyToSelectStartDateAndTeacher,
                })}>
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center space-x-8">
                    <h3 className="text-lg font-semibold">수업 일자 목록</h3>
                    {/* 리스트/달력 보기 토글 버튼 */}
                    <button
                      type="button"
                      onClick={() => setShowCalendarView(!showCalendarView)}
                      className={clsx(
                        "flex items-center rounded-md border px-3 py-1 text-sm",
                        {
                          "bg-blue-50 text-blue-600 hover:bg-blue-100": showCalendarView,
                        },
                        { "bg-amber-50 text-amber-600 hover:bg-amber-100": !showCalendarView },
                      )}>
                      {showCalendarView ? (
                        <>
                          <FaList className="mr-1 h-4 w-4" /> 목록으로 보기
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-1 h-4 w-4" /> 달력으로 보기
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      type="button"
                      className={clsx("flex items-center rounded bg-blue-500 px-3 py-1 text-sm text-white", { hidden: showCalendarView })}
                      onClick={() => setShowAddClassDateForm(!showAddClassDateForm)}>
                      <Plus className="mr-1 h-4 w-4" /> 수업 추가
                    </button>

                    {editingCourse && (
                      <button
                        type="button"
                        className="flex items-center rounded bg-gray-200 px-3 py-1 text-sm text-gray-800"
                        onClick={loadOriginalClassDates}>
                        <RiArrowGoBackFill className="mr-1 h-4 w-4" /> 되돌리기
                      </button>
                    )}
                  </div>
                </div>

                {/* 목록 보기 모드에서 수업일 추가 폼 */}
                {showAddClassDateForm && (
                  <div className="mb-4 rounded bg-gray-50 p-3">
                    <div className="flex flex-col">
                      <div className="relative">
                        <div
                          className="mb-2 flex cursor-pointer items-center rounded border p-2"
                          onClick={() => setShowClassDateCalendar(!showClassDateCalendar)}>
                          <Calendar className="mr-2 h-5 w-5" />
                          {newClassDate || "추가할 날짜를 선택하세요"}
                        </div>

                        {showClassDateCalendar && (
                          <div className="absolute z-10">
                            <DatePickerCalendar
                              selectedDate={newClassDate ? new Date(newClassDate) : undefined}
                              onDateSelect={handleClassDateSelect}
                              minDate={new Date()} // 오늘 이후 날짜만 선택 가능
                              onCancel={() => setShowClassDateCalendar(false)}
                            />
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2">
                        <button type="button" className="rounded bg-green-500 px-3 py-1 text-white" onClick={handleAddClassDate}>
                          추가하기
                        </button>
                        <button
                          type="button"
                          className="rounded bg-gray-300 px-3 py-1 text-gray-800"
                          onClick={() => {
                            setShowAddClassDateForm(false);
                            setNewClassDate("");
                            setShowStartDateCalendar(false);
                            setShowClassDateCalendar(false);
                          }}>
                          취소
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* 달력 보기 모드 */}
                <div>
                  {showCalendarView ? (
                    <div className="rounded-md border border-gray-200 p-2">
                      <DatePickerCalendarAddOrRemove
                        selectedDates={classDates.map((cd) => new Date(cd.date))}
                        onAddDate={async (date) => {
                          const dateString = format(date, "yyyy-MM-dd");
                          const isDuplicate = classDates.some((d) => d.date === dateString);
                          if (!isDuplicate) {
                            setClassDates((prev) => [
                              ...prev,
                              {
                                id: "", // 기본값
                                courseId: "", // 기본값
                                date: dateString,
                                dayOfWeek: getDayOfWeekName(date.getDay()),
                                startTime: null, // 기본값
                                endTime: null, // 기본값
                                createdAt: "", // 기본값
                                updatedAt: "", // 기본값
                              },
                            ]);
                          }
                        }}
                        onRemoveDate={(date) => {
                          const dateString = format(date, "yyyy-MM-dd");
                          setClassDates((prev) => prev.filter((d) => d.date !== dateString));
                        }}
                        minDate={formData.startDate ? new Date(formData.startDate) : undefined}
                        onCancel={() => setShowCalendarView(false)}
                        getDayOfWeekName={getDayOfWeekName}
                        startDate={formData.startDate ? new Date(formData.startDate) : undefined}
                        endDate={formData.endDate ? new Date(formData.endDate) : undefined}
                        startTime={formData.startTime}
                        endTime={endTime}
                        teacherId={formData.teacherId}
                        checkScheduleConflict={async (dates, newDate) => {
                          // 임시 수업 목록 생성
                          const tempClassDates = [
                            ...classDates,
                            {
                              id: "",
                              courseId: "",
                              date: format(newDate, "yyyy-MM-dd"),
                              dayOfWeek: getDayOfWeekName(newDate.getDay()),
                              startTime: formData.startTime || null,
                              endTime: endTime || null,
                              createdAt: "",
                              updatedAt: "",
                            },
                          ];

                          // 강사 ID가 없으면 충돌 검사를 건너뜀
                          if (!formData.teacherId) return false;

                          try {
                            // 강사의 다른 수업 일정과 충돌 여부 확인
                            const response = await axios.post("/api/admin/check-teacher-schedule-conflict", {
                              teacherId: formData.teacherId,
                              courseId: editingCourse?.id || null, // 편집 중인 경우 해당 강좌 ID
                              date: format(newDate, "yyyy-MM-dd"),
                              startTime: formData.startTime,
                              endTime: endTime,
                            });

                            return response.data.hasConflict;
                          } catch (error) {
                            console.error("강사 일정 충돌 검사 오류:", error);
                            toast.error("강사 일정 충돌 검사 중 오류가 발생했습니다");
                            return true; // 오류 발생 시 충돌로 간주
                          }
                        }}
                      />
                    </div>
                  ) : (
                    // 리스트 보기 모드 (기존 코드)
                    <div className="max-h-48 overflow-y-auto">
                      {classDates.length > 0 ? (
                        <ul className="">
                          {[...classDates]
                            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                            .map((classDate, index) => (
                              <li key={classDate.date} className="flex items-center justify-between py-2">
                                <span>
                                  <span className="mr-2 text-gray-500">{index + 1}.</span>
                                  {classDate.date} ({classDate.dayOfWeek}요일)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteClassDateByDate(classDate.date)}
                                  className="text-red-500 hover:text-red-700">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p className="py-2 text-center text-gray-500">등록된 수업 일자가 없습니다.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* 강사 선택 필드 */}
              {classDates.length > 0 && formData.startTime && endTime && (
                <div className="mt-4 border-t pt-4">
                  <h3 className={clsx("mb-4 text-lg font-semibold", { hidden: editingCourse?.status !== "대기 중" })}>강사 선택</h3>
                  <TeacherSelector
                    classDates={classDates}
                    selectedTeacherId={formData.teacherId}
                    onChange={(teacherId) => setFormData((prev) => ({ ...prev, teacherId }))}
                    startTime={formData.startTime}
                    endTime={endTime}
                    currentCourseId={editingCourse?.id}
                    onConflictChange={setHasTeacherConflict}
                    courseStatus={editingCourse?.status}
                  />
                </div>
              )}

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setShowStartDateCalendar(false);
                    setShowClassDateCalendar(false);
                    setShowAddClassDateForm(false);
                    setShowCalendarView(false);
                  }}
                  className="btn btn-outline">
                  취소
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={createCourseMutation.isPending || updateCourseMutation.isPending || hasTeacherConflict}>
                  {(createCourseMutation.isPending || updateCourseMutation.isPending) && <span className="loading loading-spinner loading-xs"></span>}
                  {editingCourse ? "수정하기" : "추가하기"}
                </button>

                {hasTeacherConflict && (
                  <p className="mt-2 text-sm text-red-500">강의 충돌이 발생했습니다. 다른 강사를 선택하거나 강의 일정을 변경해주세요.</p>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
