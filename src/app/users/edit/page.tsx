"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { User, Link2 } from "lucide-react";
import { MdOutlinePhoneAndroid } from "react-icons/md";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import { queryClient } from "@/app/providers";
import Link from "next/link";
import clsx from "clsx";

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
  toast.className = "toast toast-bottom toast-center z-50";

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

  const [realName, setRealName] = useState("");
  const [phone, setPhone] = useState("");
  const [classNickName, setClassNickName] = useState("");
  const [isApplyForTeacher, setIsApplyForTeacher] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [isApplyVisible, setIsApplyVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [zoomInviteUrl, setZoomInviteUrl] = useState("");

  // ✅ 기존 사용자 정보 불러오기
  const { data: userInfo, isLoading } = useQuery({
    queryKey: ["userProfile", session?.user?.id],
    queryFn: async () => {
      const res = await axios.get("/api/user/profile");
      return res.data;
    },
    enabled: !!session?.user?.id,
  });

  // userInfo 가 로드된 후 상태 업데이트
  useEffect(() => {
    if (userInfo) {
      setRealName(userInfo.realName || "");
      setPhone(userInfo.phone || "");
      setIsApplyForTeacher(userInfo.isApplyForTeacher || false);
      setRole(userInfo.role || null);
      setZoomInviteUrl(userInfo.zoomInviteUrl || "");
      setClassNickName(userInfo.classNickName || "");
    }
  }, [userInfo]);

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

  // ✅ Zoom URL 유효성 검사
  const isValidZoomUrl = (url: string) => {
    if (!url) return true; // 빈 값은 유효함 (필수 아님)
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === "https:";
    } catch (e) {
      return false;
    }
  };

  // ✅ 정보 업데이트 Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      return axios.post("/api/user/update", {
        realName,
        phone,
        classNickName,
        isApplyForTeacher,
        ...(role === "teacher" ? { zoomInviteUrl } : {}),
      });
    },
    onSuccess: () => {
      update({ realName, phone }); // 세션 업데이트 추가
      showToast("✅ 프로필이 업데이트되었습니다.", "success");
      queryClient.invalidateQueries({ queryKey: ["userProfile", session?.user?.id] });
      // router.push("/users/profile");
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response) {
        const errorMessage = error.response.data?.error;

        if (error.response.status === 409) {
          if (errorMessage?.includes("전화번호")) {
            setError("이미 가입된 전화번호입니다.");
            showToast("❌ 이미 가입된 전화번호입니다.", "error");
          } else if (errorMessage?.includes("닉네임")) {
            setError("이미 사용 중인 닉네임입니다.");
            showToast("❌ 이미 사용 중인 닉네임입니다.", "error");
          } else {
            setError(errorMessage || "중복된 정보가 있습니다.");
            showToast(`❌ ${errorMessage || "중복된 정보가 있습니다."}`, "error");
          }
        } else if (errorMessage) {
          setError(errorMessage);
          showToast(`❌ ${errorMessage}`, "error");
        } else {
          setError("업데이트 중 오류가 발생했습니다.");
          showToast("❌ 업데이트 중 오류가 발생했습니다.", "error");
        }
      } else {
        setError("업데이트 중 오류가 발생했습니다.");
        showToast("❌ 업데이트 중 오류가 발생했습니다.", "error");
      }
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

    const trimmedRealName = realName.replace(/\s+/g, ""); // 중간 공백까지 모두 제거
    const trimmedPhone = phone.trim();
    const trimmedZoomUrl = zoomInviteUrl.trim();

    if (!trimmedRealName || !trimmedPhone) {
      setError("모든 정보를 입력해주세요.");
      return;
    }

    if (!isValidPhoneNumber(trimmedPhone)) {
      setError("전화번호 형식이 맞지 않습니다. (예: 010-1234-5678)");
      return;
    }

    // Zoom URL 유효성 검사 (강사인 경우)
    if (role === "teacher" && trimmedZoomUrl && !isValidZoomUrl(trimmedZoomUrl)) {
      setError("Zoom 초대 링크는 유효한 https URL 이어야 합니다.");
      return;
    }

    // 상태 반영
    setRealName(trimmedRealName);
    setPhone(trimmedPhone);
    setZoomInviteUrl(trimmedZoomUrl);

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
            <p className={"mt-4 text-center text-lg md:text-xl"}>결제 정보 및 본인 확인을 위해 반드시 정확한 이름과 휴대폰 번호를 입력해 주세요.</p>

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

              <div>
                <label htmlFor="classNickName" className="text-lg font-semibold text-gray-700">
                  닉네임
                </label>
                <div className="relative mt-2">
                  <User className="absolute top-3 left-5 text-gray-500" size={24} />
                  <input
                    id="classNickName"
                    type="text"
                    value={classNickName}
                    onChange={(e) => setClassNickName(e.target.value)}
                    className="h-12 w-full rounded-lg border border-gray-400 pl-14 text-lg shadow-md focus:ring-2 focus:ring-gray-400"
                    placeholder="수업에서 사용할 닉네임을 입력해 주세요."
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">수업 중 사용할 닉네임을 입력하세요. 입력하지 않으면 실제 이름이 사용됩니다.</p>
              </div>

              {/* 강사인 경우에만 Zoom 초대 링크 입력 필드 표시 */}
              {role === "teacher" && (
                <div>
                  <hr className="my-4 border-t border-gray-300" />

                  <label htmlFor="zoomInviteUrl" className="text-lg font-semibold text-gray-700">
                    Zoom Invite Link
                  </label>
                  <div className="relative mt-2">
                    <input
                      id="zoomInviteUrl"
                      type="url"
                      value={zoomInviteUrl}
                      onChange={(e) => setZoomInviteUrl(e.target.value)}
                      className="h-12 w-full rounded-lg border border-gray-400 p-2 text-sm shadow-md focus:ring-2 focus:ring-gray-400"
                      placeholder="https://"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">학생들에게 제공할 Zoom 미팅 초대 링크를 입력해주세요. https:// 로 시작해야 합니다.</p>
                </div>
              )}

              {/* 강사직 신청 중일 때만 보임 */}
              {userInfo?.isApplyForTeacher && (
                <div className="mt-4 flex items-center justify-between rounded-lg bg-blue-100 p-3">
                  <span className="text-lg font-medium text-blue-800">현재 강사직 자격 심사 중입니다.</span>
                  <button
                    onClick={() => {
                      const confirmed = window.confirm("정말로 신청 취소하시겠습니까?");
                      if (confirmed) {
                        cancelTeacherApplicationMutation.mutate();
                      }
                    }}
                    className="btn btn-error btn-sm text-white"
                    disabled={cancelTeacherApplicationMutation.isPending}
                    type="button">
                    {cancelTeacherApplicationMutation.isPending ? "취소 중..." : "신청 취소"}
                  </button>
                </div>
              )}

              {/* 강사 신청 여부 체크박스 - role이 student일 때와 강사직 신청 중이 아닐 때에만 표시 */}
              {role === "student" && !userInfo?.isApplyForTeacher && (
                <div className="form-control mt-8">
                  {/* 활성화 토글 체크박스 */}
                  <label className="label mb-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-primary"
                      checked={isApplyVisible}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const confirmed = window.confirm("다음 부분은 강사직 신청 관련 부분입니다. 강사 활동 중이신가요?");
                          if (confirmed) {
                            setIsApplyVisible(true);
                          }
                        } else {
                          setIsApplyVisible(false);
                        }
                      }}
                    />
                    <span className="label-text mr-2 text-base">강사 신청 옵션 보기</span>
                  </label>

                  {/* 테두리로 감싼 강사 신청 영역 */}
                  <fieldset
                    disabled={!isApplyVisible}
                    className={clsx("rounded-lg border border-gray-300 p-4 transition-opacity duration-300", { hidden: !isApplyVisible })}>
                    <label className="mb-2 text-lg font-semibold text-gray-700">강사직에 지원을 하시겠습니까?</label>
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
                  </fieldset>
                </div>
              )}

              {/* 에러 메시지 표시 */}
              {error && <p className="text-lg text-red-500">{error}</p>}

              {/* 저장 및 닫기 버튼 */}
              <button
                type="submit"
                className="h-12 min-w-36 rounded-lg bg-blue-700 text-xl font-semibold text-white shadow-lg hover:bg-blue-600 disabled:opacity-50"
                disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "업데이트 중..." : "프로필 등록 및 수정"}
              </button>

              <Link
                href="/users/profile"
                className="mx-auto inline-flex h-10 w-full max-w-sm items-center justify-center gap-2 rounded-lg border border-gray-300 bg-transparent text-lg font-medium text-gray-700 shadow-md transition-colors hover:bg-gray-100 md:w-40">
                닫 기
              </Link>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
