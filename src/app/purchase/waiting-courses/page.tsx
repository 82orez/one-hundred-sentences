"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Clock, User, Phone, Mail, Calendar, BookOpen, DollarSign, AlertCircle } from "lucide-react";

interface WaitForPurchaseItem {
  id: string;
  courseId: string;
  courseTitle: string;
  userName: string;
  userPhone: string;
  startDate: string;
  classCount: number;
  totalFee: number;
  status: "pending" | "paid" | "cancelled" | "expired";
  createdAt: string;
  expiresAt?: string;
  user: {
    id: string;
    realName: string;
    phone: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    location: string;
    price: number;
  };
}

interface ApiResponse {
  success: boolean;
  data: WaitForPurchaseItem[];
  userRole: "admin" | "semiAdmin" | "teacher" | "student";
}

export default function WaitingCoursesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [waitingCourses, setWaitingCourses] = useState<WaitForPurchaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchWaitingCourses();
    }
  }, [status, selectedStatus]);

  const fetchWaitingCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/payment/wait-for-purchase?status=${selectedStatus}`);

      if (!response.ok) {
        throw new Error("데이터를 불러올 수 없습니다.");
      }

      const data: ApiResponse = await response.json();

      if (data.success) {
        setWaitingCourses(data.data);
        setUserRole(data.userRole);
      } else {
        toast.error("데이터를 불러오는 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("결제 대기 목록 조회 중 오류:", error);
      toast.error("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "결제 대기";
      case "paid":
        return "결제 완료";
      case "cancelled":
        return "취소됨";
      case "expired":
        return "만료됨";
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expireDate = new Date(expiresAt);
    const today = new Date();
    const diffTime = expireDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2;
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">결제 대기 강좌 목록</h1>
          <p className="text-gray-600">
            {userRole === "admin" || userRole === "semiAdmin" ? "전체 결제 대기 강좌 목록입니다." : "신청하신 결제 대기 강좌 목록입니다."}
          </p>
        </div>

        {/* 상태 필터 */}
        <div className="mb-6">
          <div className="flex space-x-2">
            {[
              { value: "pending", label: "결제 대기" },
              { value: "paid", label: "결제 완료" },
              { value: "cancelled", label: "취소됨" },
              { value: "expired", label: "만료됨" },
            ].map((status) => (
              <button
                key={status.value}
                onClick={() => setSelectedStatus(status.value)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  selectedStatus === status.value ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                }`}>
                {status.label}
              </button>
            ))}
          </div>
        </div>

        {/* 결제 대기 목록 */}
        {waitingCourses.length === 0 ? (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gray-100">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">결제 대기 강좌가 없습니다</h3>
            <p className="text-gray-500">
              {selectedStatus === "pending" ? "현재 결제 대기 중인 강좌가 없습니다." : `${getStatusText(selectedStatus)} 상태의 강좌가 없습니다.`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {waitingCourses.map((course) => (
              <div key={course.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                {/* 상태 및 만료 경고 */}
                <div className="mb-4 flex items-center justify-between">
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusColor(course.status)}`}>
                    {getStatusText(course.status)}
                  </span>
                  {course.expiresAt && course.status === "pending" && isExpiringSoon(course.expiresAt) && (
                    <div className="flex items-center text-red-600">
                      <AlertCircle className="mr-1 h-4 w-4" />
                      <span className="text-xs">만료 임박</span>
                    </div>
                  )}
                </div>

                {/* 강좌 정보 */}
                <div className="space-y-3">
                  <div>
                    <h3 className="mb-1 font-semibold text-gray-900">{course.courseTitle}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <BookOpen className="mr-1 h-4 w-4" />
                      <span>{course.course.location}</span>
                    </div>
                  </div>

                  {/* 신청자 정보 (관리자만 보임) */}
                  {(userRole === "admin" || userRole === "semiAdmin") && (
                    <div className="border-t pt-3">
                      <h4 className="mb-2 text-sm font-medium text-gray-900">신청자 정보</h4>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="mr-2 h-4 w-4" />
                          <span>{course.user.realName}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Phone className="mr-2 h-4 w-4" />
                          <span>{course.user.phone}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="mr-2 h-4 w-4" />
                          <span>{course.user.email}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 수강 정보 */}
                  <div className="border-t pt-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <Calendar className="mr-2 h-4 w-4" />
                          <span>수강 시작일</span>
                        </div>
                        <span className="font-medium">{format(new Date(course.startDate), "yyyy년 MM월 dd일", { locale: ko })}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <Clock className="mr-2 h-4 w-4" />
                          <span>수업 횟수</span>
                        </div>
                        <span className="font-medium">{course.classCount}회</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center text-gray-600">
                          <DollarSign className="mr-2 h-4 w-4" />
                          <span>수강료</span>
                        </div>
                        <span className="font-bold text-blue-600">{course.totalFee.toLocaleString()}원</span>
                      </div>
                    </div>
                  </div>

                  {/* 신청일 및 만료일 */}
                  <div className="border-t pt-3">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>신청일</span>
                        <span>{format(new Date(course.createdAt), "yyyy.MM.dd HH:mm", { locale: ko })}</span>
                      </div>
                      {course.expiresAt && (
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>만료일</span>
                          <span className={course.status === "pending" && isExpiringSoon(course.expiresAt) ? "font-medium text-red-600" : ""}>
                            {format(new Date(course.expiresAt), "yyyy.MM.dd HH:mm", { locale: ko })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 결제 안내 (결제 대기 상태이고 student인 경우) */}
        {selectedStatus === "pending" && userRole === "student" && waitingCourses.length > 0 && (
          <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <h3 className="mb-3 text-lg font-medium text-yellow-900">무통장 입금 안내</h3>
            <div className="space-y-2 text-sm text-yellow-800">
              <div className="flex justify-between">
                <span>예금주:</span>
                <span className="font-medium">(주)프렌딩</span>
              </div>
              <div className="flex justify-between">
                <span>계좌번호:</span>
                <span className="font-medium">국민은행 680401-00-111448</span>
              </div>
            </div>
            <div className="mt-4 space-y-1 text-sm text-yellow-700">
              <p>• 입금자명은 신청자명과 동일하게 입금해 주세요.</p>
              <p>• 입금 확인 후 결제 완료 상태로 변경됩니다.</p>
              <p>• 결제 대기 만료일 이후에는 자동으로 취소됩니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
