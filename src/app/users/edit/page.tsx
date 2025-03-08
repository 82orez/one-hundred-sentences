"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner"; // ✅ Sonner 라이브러리 사용
import { Phone, User } from "lucide-react";
import { MdOutlinePhoneAndroid } from "react-icons/md";

const EditProfilePage = () => {
  const { data: session, status } = useSession();
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

  const [realName, setRealName] = useState(userInfo?.realName || "");
  const [phone, setPhone] = useState(userInfo?.phone || "");
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
      return axios.post("/api/user/update", { realName, phone });
    },
    onSuccess: () => {
      toast.success("프로필이 업데이트되었습니다.");
      router.push("/users/profile");
    },
    onError: () => {
      toast.error("❌ 업데이트 중 오류가 발생했습니다.");
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-40 w-80 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen justify-center bg-gradient-to-br from-blue-100 to-blue-300 p-4 md:p-6">
      <div>
        <Card className="w-full max-w-lg rounded-2xl border border-gray-300/50 bg-white/90 shadow-xl backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-center text-3xl font-semibold text-gray-800">프로필 수정</CardTitle>
            <p className={"mt-4 text-center"}>정확한 이름과 휴대폰 번호를 입력해 주세요.</p>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-xl">
              {/* 실제 이름 입력 */}
              <div>
                <Label htmlFor="realName" className="text-lg font-semibold text-gray-700">
                  실제 이름
                </Label>
                <div className="relative mt-2">
                  <User className="absolute top-3 left-5 text-gray-500" size={24} />
                  <input
                    id="realName"
                    type="text"
                    value={realName}
                    onChange={(e) => setRealName(e.target.value)}
                    className="h-12 w-full rounded-xl border border-gray-400 pl-14 text-lg shadow-md focus:ring-2 focus:ring-blue-400"
                    placeholder="홍길동"
                  />
                </div>
              </div>

              {/* 전화번호 입력 */}
              <div>
                <Label htmlFor="phone" className="text-lg font-semibold text-gray-700">
                  휴대폰 번호
                </Label>
                <div className="relative mt-2">
                  <MdOutlinePhoneAndroid className="absolute top-3 left-5 text-gray-500" size={24} />
                  <input
                    id="phone"
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                    className="h-12 w-full rounded-xl border border-gray-400 pl-14 text-lg shadow-md focus:ring-2 focus:ring-blue-400"
                    placeholder="010-1234-5678"
                    maxLength={13}
                  />
                </div>
              </div>

              {/* 에러 메시지 표시 */}
              {error && <p className="text-lg text-red-500">{error}</p>}

              {/* 저장 버튼 */}
              <Button
                type="submit"
                className="h-14 w-full rounded-xl bg-blue-500 text-xl font-semibold text-white shadow-lg hover:bg-blue-600 disabled:opacity-50"
                disabled={updateProfileMutation.isPending}>
                {updateProfileMutation.isPending ? "업데이트 중..." : "프로필 정보 수정하기"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfilePage;
