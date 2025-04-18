"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { User } from "lucide-react";
import { MdOutlinePhoneAndroid } from "react-icons/md";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import { queryClient } from "@/app/providers";

// * DaisyUI Toast 를 위한 함수
const showToast = (message: string, type: "success" | "error" = "success") => {
  // 이미 있는 toast 제거
  const existingToast = document.getElementById("custom-toast");
  if (existingToast) {
    document.body.removeChild(existingToast);
  }

  // 새로운 toast 생성
  const toast = document.createElement("div");
  toast.id = "custom-toast";
  toast.className = "toast toast-bottom toast-end z-50";

  const alert = document.createElement("div");
  alert.className = `alert ${type === "success" ? "alert-neutral" : "alert-error"}`;
  alert.innerText = message;

  toast.appendChild(alert);
  document.body.appendChild(toast);

  // 3초 후 제거
  setTimeout(() => {
    if (document.body.contains(toast)) {
      document.body.removeChild(toast);
    }
  }, 3000);
};

const EditProfilePage = () => {
  const { data: session, status, update } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.replace("/users/sign-in");
    return null;
  }

  // ✅ 기존 사용자 정보 불러오기
  const { data: userInfo, isLoading } = useQuery({
    queryKey: ["userProfile", session?.user?.id],
    queryFn: async () => {
      const res = await axios.get("/api/user/profile");
      return res.data;
    },
    enabled: !!session?.user?.id,
  });

  // 수정 후:
  const [realName, setRealName] = useState("");
  const [phone, setPhone] = useState("");
  const [isApplyForTeacher, setIsApplyForTeacher] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  // userInfo 가 로드된 후 상태 업데이트
  useEffect(() => {
    if (userInfo) {
      setRealName(userInfo.realName || "");
      setPhone(userInfo.phone || "");
      setIsApplyForTeacher(userInfo.isApplyForTeacher || false);
      setRole(userInfo.role || null);
    }
  }, [userInfo]);

  const [error, setError] = useState<string | null>(null);

  // ✅ 전화번호 자동 변환 (마지막 4자리 기준)
  const formatPhoneNumber = (value: string) => {
    const numbersOnly = value.replace(/\D/g, "");

    if (numbersOnly.length <= 3) {
      return numbersOnly;
    } else if (numbersOnly.length <= 6) {
      return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3)}`;
    } else if (numbersOnly.length === 7) {
      return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, 7)}`;
    } else if (numbersOnly.length === 8) {
      return `${numbersOnly.slice(0, 4)}-${numbersOnly.slice(4, 8)}`;
    } else if (numbersOnly.length === 9) {
      return `${numbersOnly.slice(0, 2)}-${numbersOnly.slice(2, 5)}-${numbersOnly.slice(5, 9)}`;
    } else {
      return `${numbersOnly.slice(0, 3)}-${numbersOnly.slice(3, numbersOnly.length - 4)}-${numbersOnly.slice(-4)}`;
    }
  };

  // ✅ 전화번호 유효성 검사
  const isValidPhoneNumber = (value: string) => {
    const phoneRegex = /^\d{3}-\d{3,4}-\d{4}$/; // 000-000-0000 또는 000-0000-0000 형식
    return phoneRegex.test(value);
  };

  // ✅ 정보 업데이트 Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      return axios.post("/api/user/update", { realName, phone, isApplyForTeacher });
    },
    onSuccess: () => {
      update({ realName, phone }); // 세션 업데이트 추가
      showToast("✅ 프로필이 업데이트되었습니다.", "success");
      router.push("/users/profile");
    },
    onError: () => {
      showToast("❌ 업데이트 중 오류가 발생했습니다.", "error");
    },
  });

  // ✅ 강사 신청 취소 Mutation
  const cancelTeacherApplicationMutation = useMutation({
    mutationFn: async () => {
      return axios.post("/api/user/cancel-teacher-application");
    },
    onSuccess: () => {
      setIsApplyForTeacher(false); // 로컬 상태 업데이트
      showToast("✅ 강사직 신청이 취소되었습니다.", "success");

      // 사용자 정보를 다시 가져오기 위해 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ["userProfile", session?.user?.id] });
    },
    onError: () => {
      showToast("❌ 신청 취소 중 오류가 발생했습니다.", "error");
    },
  });

  // ✅ 저장 버튼 클릭 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!realName.trim() || !phone.trim()) {
      setError("모든 정보를 입력해주세요.");
      return;
    }

    if (!isValidPhoneNumber(phone)) {
      setError("전화번호 형식이 맞지 않습니다. (예: 010-1234-5678)");
      return;
    }

    updateProfileMutation.mutate();
  };

  if (isLoading) return <LoadingPageSkeleton />;

  return (
    <div className="flex min-h-screen justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4 md:p-6">
      <div className={"mt-4"}>
        {/* daisyUI 카드로 교체 */}
        <div className="card w-full max-w-md rounded-2xl border border-gray-300/50 bg-white/90 shadow-xl backdrop-blur-md">
          <div className="card-body px-4 py-6 md:p-8">
            <h2 className="card-title justify-center text-center text-3xl font-semibold text-gray-800">프로필 등록 및 수정</h2>
            <p className={"mt-2 text-center text-lg md:text-xl"}>결제 정보 확인을 위해 반드시 정확한 이름과 휴대폰 번호를 입력해 주세요.</p>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-6 text-xl">
              {/* 실제 이름 입력 */}
              <div>
                <label htmlFor="realName" className="text-lg font-semibold text-gray-700">
                  실제 이름
                </label>
                <div className="relative mt-2">
                  <User className="absolute top-3 left-5 text-gray-500" size={24} />
                  <input
                    id="realName"
                    type="text"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    className="h-12 w-full rounded-lg border border-gray-400 pl-14 text-lg shadow-md focus:ring-2 focus:ring-gray-400"
                    placeholder="이름을 입력해 주세요."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="text-lg font-semibold text-gray-700">
                  휴대폰 번호
                </label>
                <div className="relative mt-2">
                  <MdOutlinePhoneAndroid className="absolute top-3 left-5 text-gray-500" size={24} />
                  <input
                    id="phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    className="h-12 w-full rounded-lg border border-gray-400 pl-14 text-lg shadow-md focus:ring-2 focus:ring-gray-400"
                    placeholder="숫자만 입력해 주세요."
                    maxLength={13}
                  />
                </div>
              </div>

              {/* 강사 신청 여부 체크박스 - role이 student일 때만 표시 */}
              {role === "student" && (
                <div className="form-control mt-8">
                  <label className="mb-2 text-lg font-semibold text-gray-700">강사직 지원을 하시겠습니까?</label>
                  {userInfo?.isApplyForTeacher ? (
                    <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-100 p-3">
                      <span className="text-lg font-medium text-blue-800">현재 강사직 자격 심사 중입니다.</span>
                      <button
                        onClick={() => cancelTeacherApplicationMutation.mutate()}
                        className="btn btn-error btn-sm"
                        disabled={cancelTeacherApplicationMutation.isPending}
                        type="button">
                        {cancelTeacherApplicationMutation.isPending ? "취소 중..." : "신청 취소"}
                      </button>
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-4">
                      <label className="label cursor-pointer">
                        <span className="label-text mr-2 text-lg">예</span>
                        <input
                          type="radio"
                          name="isApplyForTeacher"
                          className="radio radio-primary"
                          checked={isApplyForTeacher === true}
                          onChange={() => setIsApplyForTeacher(true)}
                        />
                      </label>
                      <label className="label cursor-pointer">
                        <span className="label-text mr-2 text-lg">아니오</span>
                        <input
                          type="radio"
                          name="isApplyForTeacher"
                          className="radio radio-primary"
                          checked={isApplyForTeacher === false}
                          onChange={() => setIsApplyForTeacher(false)}
                        />
                      </label>
                    </div>
                  )}
                </div>
              )}

              {/* 에러 메시지 표시 */}
              {error && <p className="text-lg text-red-500">{error}</p>}

              {/* 저장 버튼 */}
              <button
                type="submit"
                className="h-12 w-full rounded-lg bg-blue-700 text-xl font-semibold text-white shadow-lg hover:bg-blue-600 disabled:opacity-50"
                disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "업데이트 중..." : "프로필 정보 수정하기"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
