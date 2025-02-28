"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation"; // `useParams` 사용
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { GoEye } from "react-icons/go";
import { PiEyeClosed } from "react-icons/pi";

export default function ResetPasswordPage() {
  const router = useRouter();
  const params = useParams(); // 동적 경로 값 가져오기
  const [token, setToken] = useState(""); // 비밀번호 변경 토큰 저장

  useEffect(() => {
    if (params.token) {
      setToken(params.token as string);
    }
  }, [params.token]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isPasswordValid = /^(?=.*[A-Za-z]).{6,}$/.test(password);
  const isPasswordMatch = password === confirmPassword;

  const resetPassword = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/change-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }), // `token`을 안전하게 사용
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "비밀번호 변경 실패");
      }
      return data;
    },
    onSuccess: (data) => {
      setMessage(data.message || "비밀번호가 성공적으로 변경되었습니다.");
      setErrorMessage("");
      alert(data.message);
      router.push("/users/sign-in");
      // setTimeout(() => router.push("/users/sign-in"), 2000);
    },
    onError: (error: any) => {
      setMessage(""); // 성공 메시지 초기화
      setErrorMessage(error.message); // 오류 메시지 설정
      setTimeout(() => router.push("/users/sign-in"), 2000);
    },
  });

  return (
    <div className="mx-auto mt-10 w-full max-w-[375px] rounded-lg bg-white p-6 shadow-lg">
      <h1 className="mb-10 text-xl font-semibold">비밀번호 변경</h1>

      <div className="relative mb-4">
        <label htmlFor="password" className="mb-1 block">
          새로운 비밀 번호를 입력해 주세요.
        </label>
        <input
          id="password"
          type={showPassword ? "text" : "password"}
          placeholder="영문 포함 6자리 이상"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full border p-2 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className={clsx("absolute right-3 top-9 text-gray-600 hover:text-gray-800", { hidden: !password })}>
          {showPassword ? <GoEye size={25} /> : <PiEyeClosed size={25} />}
        </button>

        {!isPasswordValid && password && <p className="mb-3 mt-1 text-red-500">영문 포함하여 6자리 이상이어야 합니다.</p>}
      </div>

      <label htmlFor="confirmPassword" className="mb-1 block">
        새로운 비밀번호를 확인해 주세요.
      </label>
      <div className="relative mb-3">
        <input
          id="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          placeholder="비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="block w-full border p-2 pr-10"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className={clsx("absolute right-3 top-2 text-gray-600 hover:text-gray-800", { hidden: !confirmPassword })}>
          {showConfirmPassword ? <GoEye size={25} /> : <PiEyeClosed size={25} />}
        </button>

        <div className={clsx("", { hidden: !password || !confirmPassword })}>
          {!isPasswordMatch ? (
            <p className="mb-3 mt-1 animate-pulse text-red-500">비밀번호가 일치하지 않습니다.</p>
          ) : (
            <p className="mb-3 mt-1 text-green-500">비밀번호가 일치합니다.</p>
          )}
        </div>
      </div>

      <div className={"relative"}>
        <button
          onClick={() => resetPassword.mutate()}
          disabled={!isPasswordValid || !isPasswordMatch}
          className="w-full rounded-md bg-blue-600 p-2 text-white hover:bg-blue-400 disabled:opacity-80">
          {resetPassword.isPending ? "비밀번호 변경 중..." : "비밀번호 변경하기"}
        </button>
        {resetPassword.isPending && <AiOutlineLoading3Quarters className={"absolute left-10 top-3.5 animate-spin md:left-12"} />}
      </div>

      {/* 오류 메시지 표시 */}
      {errorMessage && <p className="mt-3 text-red-500">{errorMessage}</p>}

      {/*{message && <p className="mt-2 text-green-500">{message}</p>}*/}

      <div className={clsx("mt-10 flex justify-center hover:underline", { "pointer-events-none": resetPassword.isPending })}>
        <Link href="/">Back to Home</Link>
      </div>
    </div>
  );
}
