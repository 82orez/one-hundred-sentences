"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";

const EditProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  // ✅ 로그인되지 않은 경우 로그인 페이지로 리디렉트
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
    enabled: !!session?.user?.id, // 세션이 있는 경우만 실행
  });

  // ✅ 입력 상태 관리
  const [realName, setRealName] = useState(userInfo?.realName || "");
  const [phone, setPhone] = useState(userInfo?.phone || "");
  const [error, setError] = useState<string | null>(null); // ✅ 에러 메시지 상태 추가

  // ✅ 전화번호 자동 변환 (마지막 4자리 기준)
  const formatPhoneNumber = (value: string) => {
    const numbersOnly = value.replace(/\D/g, ""); // 숫자만 남기기

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
      return axios.post("/api/user/update", { realName, phone });
    },
    onSuccess: () => {
      alert("프로필이 업데이트되었습니다.");
      router.push("/users/profile");
    },
    onError: (error) => {
      console.error("업데이트 실패:", error);
      alert("업데이트 중 오류가 발생했습니다.");
    },
  });

  // ✅ 저장 버튼 클릭 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // 이전 에러 메시지 초기화

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

  if (isLoading) return <p className="text-center">Loading...</p>;

  return (
    <div className="mx-auto max-w-md p-6">
      <h1 className="mb-6 text-xl font-bold">프로필 수정</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* 실제 이름 입력 */}
        <label className="flex flex-col">
          <span className="font-semibold">실제 이름</span>
          <input
            type="text"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            className="mt-1 rounded border p-2"
            placeholder="홍길동"
          />
        </label>

        {/* 전화번호 입력 */}
        <label className="flex flex-col">
          <span className="font-semibold">전화번호</span>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
            className="mt-1 rounded border p-2"
            placeholder="숫자만 입력해 주세요."
            maxLength={13} // ✅ 최대 13자리 (하이픈 포함)
          />
        </label>

        {/* 에러 메시지 표시 */}
        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          className="mt-4 w-full rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          disabled={updateProfileMutation.isPending}>
          {updateProfileMutation.isPending ? "업데이트 중..." : "프로필 정보 수정하기"}
        </button>
      </form>
    </div>
  );
};

export default EditProfilePage;
