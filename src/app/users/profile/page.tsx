"use client";

import { useSession } from "next-auth/react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axios from "axios";
import Link from "next/link";
import { Mail, User, Edit, Home, Upload, Link2 } from "lucide-react";
import { MdOutlinePhoneAndroid } from "react-icons/md";
import LoadingPageSkeleton from "@/components/LoadingPageSkeleton";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { queryClient } from "@/app/providers";

const ProfilePage = () => {
  const { data: session, update } = useSession();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  // user 정보 불러오기
  const {
    data: userInfo,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userProfile", session?.user?.id],
    queryFn: async () => {
      const res = await axios.get("/api/user/profile");
      return res.data;
    },
    enabled: !!session?.user?.id, // 여기서 조건부 실행 제어
  });

  // 이미지 업로드 mutation
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await axios.post("/api/user/upload-image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: async (data) => {
      // 세션 업데이트
      await update({ image: data.imageUrl });

      // 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["userProfile", session?.user?.id],
      });
      toast.success("프로필 이미지가 업데이트 되었습니다.");
    },
    onError: () => {
      toast.error("이미지 업로드 중 오류가 발생했습니다.");
    },
    onSettled: () => {
      setIsUploading(false);
    },
  });

  // 이미지 리셋 mutation
  const resetImageMutation = useMutation({
    mutationFn: async () => {
      return await axios.post("/api/user/reset-image");
    },
    onSuccess: async () => {
      // 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["userProfile", session?.user?.id],
      });
      toast.success("프로필 이미지가 초기화되었습니다.");
    },
    onError: () => {
      toast.error("이미지 초기화 중 오류가 발생했습니다.");
    },
  });

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("파일 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 파일 업로드 실행
    uploadMutation.mutate(file);
  };

  const handleResetImage = () => {
    resetImageMutation.mutate();
  };

  if (isLoading) return <LoadingPageSkeleton />;

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center text-center text-red-500">
        <p>프로필 정보를 불러오는 중 오류가 발생했습니다.</p>
        <Link
          href="/users/sign-in"
          className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none">
          다시 시도하기
        </Link>
      </div>
    );
  }

  // 프로필 이미지 URL 결정 로직
  const profileImageUrl = userInfo?.customImageUrl || session?.user?.image || "/images/anon-user-1.jpg";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-blue-200 p-4 md:justify-between md:p-12">
      <div className="w-full max-w-md rounded-3xl border border-gray-300/50 bg-white/80 px-2 py-8 shadow-xl backdrop-blur-lg md:px-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className={"flex items-center justify-center"}>
            <h2 className="text-3xl font-bold text-gray-800">My Profile</h2>
          </div>

          <h3 className="mt-4 text-xl font-semibold text-gray-800">{userInfo?.realName || "등록되지 않음"}</h3>

          {/* 프로필 이미지 */}
          <div className="relative mt-4">
            <div
              className="relative h-36 w-36 cursor-pointer overflow-hidden rounded-full shadow-md ring-2 ring-blue-300 md:h-44 md:w-44"
              onClick={handleImageClick}>
              <img src={profileImageUrl} alt="Profile Image" className="h-full w-full object-cover object-center" />
              {isUploading && (
                <div className="bg-opacity-50 absolute inset-0 flex items-center justify-center bg-black">
                  <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
                </div>
              )}
              {/*<div className="absolute right-0 bottom-0 rounded-full bg-blue-600 p-2 shadow-md">*/}
              {/*  <Upload size={16} className="text-white" />*/}
              {/*</div>*/}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>

          {/* ✅ 추가된 버튼 그룹 */}
          <div className="mt-4 flex w-full max-w-xs justify-center gap-6 text-sm md:flex-row">
            <button
              onClick={handleImageClick}
              className="inline-flex w-20 items-center justify-center rounded-lg bg-blue-500 px-3 py-2 text-white hover:bg-blue-600">
              Change
            </button>
            <button
              onClick={handleResetImage}
              className="inline-flex w-20 items-center justify-center rounded-lg border border-gray-400 bg-white px-3 py-2 text-gray-800 hover:bg-gray-100">
              Reset
            </button>
          </div>

          <div className="mt-8 w-full space-y-4 overflow-auto text-gray-700">
            <div className="flex items-center gap-4 px-2">
              <User size={22} className="text-gray-500" />
              <span className="text-lg">{userInfo?.realName || "등록되지 않음"}</span>
            </div>
            <div className="flex items-center gap-4 px-2">
              <Mail size={22} className="text-gray-500" />
              <span className="text-sm md:text-lg">{session?.user?.email || "등록되지 않음"}</span>
            </div>
            <div className="flex items-center gap-4 px-2">
              <MdOutlinePhoneAndroid size={22} className="text-gray-500" />
              <span className="text-lg">{userInfo?.phone || "등록되지 않음"}</span>
            </div>

            {session.user.role !== "student" && (
              <div className="flex items-center gap-4 px-2">
                <Link2 size={22} className="min-h-[22px] min-w-[22px] text-gray-500" />
                <span className="text-left break-all whitespace-normal">{userInfo?.zoomInviteUrl || "등록되지 않음"}</span>
              </div>
            )}

            <div className="mt-8 flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
              <Link
                href="/users/edit"
                className="inline-flex h-10 w-full max-w-sm items-center justify-center gap-2 rounded-lg bg-blue-700 text-lg font-medium text-white shadow-md transition-colors hover:bg-blue-600 md:w-40">
                <Edit size={20} />
                회원 정보 수정
              </Link>

              <Link
                href="/"
                className="inline-flex h-10 w-full max-w-sm items-center justify-center gap-2 rounded-lg border border-gray-300 bg-transparent text-lg font-medium text-gray-700 shadow-md transition-colors hover:bg-gray-100 md:w-40">
                <Home size={20} />
                홈으로
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
