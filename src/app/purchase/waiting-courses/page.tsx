"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Clock, User, Phone, Mail, Calendar, BookOpen, DollarSign, AlertCircle, X, Trash2 } from "lucide-react";
import { FaWonSign } from "react-icons/fa6";
import Timer from "@/components/Timer";

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
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [isDeletingExpired, setIsDeletingExpired] = useState(false);
  const [confirmingPaymentId, setConfirmingPaymentId] = useState<string | null>(null);

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

  const handleCancelWaitForPurchase = async (waitForPurchaseId: string, courseTitle: string) => {
    if (!confirm(`${courseTitle} 강좌의 수강 신청을 취소하시겠습니까?`)) {
      return;
    }

    try {
      setCancellingId(waitForPurchaseId);
      const response = await fetch("/api/payment/wait-for-purchase", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ waitForPurchaseId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        // 목록 새로고침
        fetchWaitingCourses();
      } else {
        toast.error(data.error || "취소 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("결제 대기 취소 중 오류:", error);
      toast.error("취소 처리 중 오류가 발생했습니다.");
    } finally {
      setCancellingId(null);
    }
  };

  const handleDeleteExpiredCourses = async () => {
    if (!confirm("만료된 모든 결제 대기 정보를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      setIsDeletingExpired(true);
      const response = await fetch("/api/payment/wait-for-purchase", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "deleteExpired" }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        // 목록 새로고침
        fetchWaitingCourses();
      } else {
        toast.error(data.error || "삭제 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("만료된 결제 대기 정보 삭제 중 오류:", error);
      toast.error("삭제 처리 중 오류가 발생했습니다.");
    } finally {
      setIsDeletingExpired(false);
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

  // 한국 시간으로 현재 시간과 만료 시간 비교
  const isExpired = (expiresAt: string) => {
    const now = new Date();
    const expireDate = new Date(expiresAt);

    // 한국 시간 기준으로 비교 (UTC+9)
    const koreaOffset = 9 * 60 * 60 * 1000; // 9시간을 밀리초로 변환
    const nowKorea = new Date(now.getTime() + koreaOffset);
    const expireDateKorea = new Date(expireDate.getTime() + koreaOffset);

    return nowKorea > expireDateKorea;
  };

  const isExpiringSoon = (expiresAt: string) => {
    const expireDate = new Date(expiresAt);
    const now = new Date();

    // 한국 시간 기준으로 계산
    const koreaOffset = 9 * 60 * 60 * 1000;
    const nowKorea = new Date(now.getTime() + koreaOffset);
    const expireDateKorea = new Date(expireDate.getTime() + koreaOffset);

    const diffTime = expireDateKorea.getTime() - nowKorea.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 2 && diffDays > 0;
  };

  // 결제 확인 처리 함수 추가
  const handleConfirmPayment = async (waitForPurchaseId: string, courseId: string, courseTitle: string, userName: string) => {
    if (!confirm(`${userName}님이 신청하신 ${courseTitle} 강좌의 결제를 확인하시겠습니까?`)) {
      return;
    }

    try {
      setConfirmingPaymentId(waitForPurchaseId);
      const response = await fetch("/api/payment/wait-for-purchase/confirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ waitForPurchaseId, courseId }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        // 목록 새로고침
        fetchWaitingCourses();
      } else {
        toast.error(data.error || "결제 확인 처리 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("결제 확인 처리 중 오류:", error);
      toast.error("결제 확인 처리 중 오류가 발생했습니다.");
    } finally {
      setConfirmingPaymentId(null);
    }
  };

  // 타이머 만료 시 호출되는 함수
  const handleTimerExpire = () => {
    // 목록을 새로고침하여 만료된 상태를 반영
    fetchWaitingCourses();
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

        {/* 상태 필터 및 관리자 버튼 */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

          {/* 관리자 전용 버튼 */}
          {userRole === "admin" && selectedStatus === "expired" && waitingCourses.length > 0 && (
            <button
              onClick={handleDeleteExpiredCourses}
              disabled={isDeletingExpired}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50">
              {isDeletingExpired ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  <span>삭제 중...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  <span>전체 삭제</span>
                </>
              )}
            </button>
          )}
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
            {waitingCourses.map((course) => {
              // 만료 여부 확인
              const courseExpired = course.expiresAt && isExpired(course.expiresAt);
              const courseExpiringSoon = course.expiresAt && !courseExpired && isExpiringSoon(course.expiresAt);

              return (
                <div key={course.id} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                  {/* 상태 및 만료 경고 */}
                  <div className="mb-4 flex items-center justify-between">
                    <span className={`rounded-full px-3 py-1 text-sm font-medium ${getStatusColor(courseExpired ? "expired" : course.status)}`}>
                      {courseExpired ? "만료됨" : getStatusText(course.status)}
                    </span>
                    {course.expiresAt && course.status === "pending" && (
                      <>
                        {courseExpired && (
                          <div className="flex items-center text-red-600">
                            <AlertCircle className="mr-1 h-4 w-4" />
                            <span className="text-sm font-semibold">만료됨</span>
                          </div>
                        )}
                        {courseExpiringSoon && (
                          <div className="flex items-center text-red-600">
                            <AlertCircle className="mr-1 h-4 w-4" />
                            <span className="text-sm">마감 임박</span>
                          </div>
                        )}
                      </>
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
                        <h4 className="mb-2 font-medium text-gray-900">신청자 정보</h4>
                        <div className="space-y-1">
                          <div className="flex items-center text-gray-600">
                            <User className="mr-2 h-4 w-4" />
                            <span>{course.user.realName}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Phone className="mr-2 h-4 w-4" />
                            <span>{course.user.phone}</span>
                          </div>
                          <div className="flex items-center text-gray-600">
                            <Mail className="mr-2 h-4 w-4" />
                            <span>{course.user.email}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* 수강 정보 */}
                    <div className="border-t pt-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="mr-2 h-4 w-4" />
                            <span>수강 시작일</span>
                          </div>
                          <span className="font-medium">{format(new Date(course.startDate), "yyyy년 MM월 dd일", { locale: ko })}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-600">
                            <Clock className="mr-2 h-4 w-4" />
                            <span>수업 횟수</span>
                          </div>
                          <span className="font-medium">{course.classCount}회</span>
                        </div>
                        <div className="flex items-center justify-between font-semibold text-blue-500">
                          <div className="flex items-center">
                            <FaWonSign className="mr-2 h-4 w-4" />
                            <span>총 수강료</span>
                          </div>
                          <span className="">{course.totalFee.toLocaleString()}원</span>
                        </div>
                        {course.expiresAt && (
                          <div className="flex items-center justify-between text-sm font-semibold md:text-base">
                            <div className="flex items-center text-gray-600">
                              <AlertCircle className="mr-2 h-4 w-4" />
                              <span>마감 시한</span>
                            </div>
                            <span className={` ${courseExpired ? "text-red-600" : courseExpiringSoon ? "text-orange-600" : "text-gray-900"}`}>
                              {format(new Date(course.expiresAt), "yy년 MM월 dd일 a h시", { locale: ko })}
                            </span>
                          </div>
                        )}

                        {/* 마감 시간까지의 타이머 */}
                        {course.expiresAt && course.status === "pending" && (
                          <div className="mt-3 rounded-lg border bg-gray-50 p-3">
                            <div className="flex items-center justify-center">
                              <Timer expiresAt={course.expiresAt} onExpire={handleTimerExpire} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="border-t pt-3">
                      <div className="flex flex-col gap-2">
                        {(userRole === "admin" || userRole === "student") && course.status === "pending" && (
                          <button
                            onClick={() => handleCancelWaitForPurchase(course.id, course.courseTitle)}
                            disabled={cancellingId === course.id}
                            className="flex flex-1 items-center justify-center gap-1 rounded-md bg-red-600 px-3 py-2 font-medium text-white hover:bg-red-700 disabled:opacity-50">
                            {cancellingId === course.id ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <span>취소 중...</span>
                              </>
                            ) : (
                              <>
                                <X className="h-4 w-4" />
                                <span>수강 신청 취소</span>
                              </>
                            )}
                          </button>
                        )}

                        {(userRole === "admin" || userRole === "semiAdmin") && selectedStatus === "pending" && (
                          <button
                            onClick={() => handleConfirmPayment(course.id, course.courseId, course.courseTitle, course.userName)}
                            disabled={confirmingPaymentId === course.id}
                            className="mt-2 flex flex-1 items-center justify-center gap-1 rounded-md bg-green-600 px-3 py-2 font-medium text-white hover:bg-green-700 disabled:opacity-50">
                            {confirmingPaymentId === course.id ? (
                              <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                <span>확인 중...</span>
                              </>
                            ) : (
                              <>
                                <span>결제 확인</span>
                              </>
                            )}
                          </button>
                        )}
                        {course.status === "paid" && (
                          <div className="flex flex-1 items-center justify-center rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-800">
                            결제 완료
                          </div>
                        )}
                        {course.status === "cancelled" && (
                          <div className="flex flex-1 items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800">
                            취소됨
                          </div>
                        )}
                        {course.status === "expired" && (
                          <div className="flex flex-1 items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-800">
                            만료됨
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 결제 안내 (결제 대기 상태이고 student인 경우) */}
        {selectedStatus === "pending" && (userRole === "student" || userRole === "admin") && waitingCourses.length > 0 && (
          <div className="mx-auto mt-8 w-full rounded-lg border border-yellow-200 bg-yellow-50 p-6 md:max-w-xl">
            <h3 className="mb-3 text-lg font-medium text-yellow-900">무통장 입금 안내</h3>
            <div className="space-y-2 text-yellow-800">
              <div className="flex justify-between">
                <span>예금주:</span>
                <span className="font-medium">(주)프렌딩</span>
              </div>
              <div className="flex justify-between">
                <span>계좌번호:</span>
                <span className="font-medium">국민은행 680401-00-111448</span>
              </div>
            </div>

            <div className="my-4 border border-yellow-800"></div>

            <div className="mt-4 space-y-3 text-yellow-700">
              <p>• 입금자명은 신청자명과 동일하게 입금해 주세요.</p>
              <p>• 관리자가 입금 확인을 한 후에는 '내 강의실 입장' 메뉴에서 해당 수업 수강이 가능합니다.</p>
              <p className={"font-semibold"}>• 반드시 마감 시한까지 수강료 입금 부탁드립니다.</p>
              <p>• 해당 시간까지 입금 정보가 확인이 되지 않을 경우 자동으로 수강 신청 내역이 취소점 양해 부탁드립니다.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
