"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import clsx from "clsx";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const sendResetLink = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "비밀번호 재설정 요청 실패");
      }
      return data;
    },
    onSuccess: (data) => {
      setMessage(data.message || "비밀번호 재설정 링크가 이메일로 전송되었습니다.");
      setErrorMessage("");
      setIsEmailSent(true);
    },
    onError: (error: any) => {
      setMessage(""); // 성공 메시지 초기화
      setErrorMessage(error.message); // 오류 메시지 설정
    },
  });

  return (
    <div className="mx-auto mt-10 w-full max-w-[375px] rounded-lg bg-white p-6 shadow-lg">
      <h1 className="mb-10 text-xl font-semibold">비밀번호 재설정</h1>

      {!isEmailSent ? (
        <>
          <label htmlFor="email" className="mb-2 block">
            등록된 이메일을 입력하세요.
          </label>
          <input
            id="email"
            type="email"
            placeholder="abc@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mb-3 block w-full border p-2"
          />
          <div className={"relative"}>
            <button
              onClick={() => sendResetLink.mutate()}
              disabled={!email || sendResetLink.isPending}
              className="w-full rounded-md bg-blue-600 p-2 text-white hover:bg-blue-400 disabled:opacity-80">
              {sendResetLink.isPending ? "링크 보내는 중..." : "비밀번호 재설정 링크 보내기"}
            </button>
            {sendResetLink.isPending && <AiOutlineLoading3Quarters className={"absolute left-10 top-3.5 animate-spin md:left-12"} />}
          </div>
        </>
      ) : (
        <p className="text-green-500">{message}</p>
      )}

      {/* 오류 메시지 표시 */}
      {errorMessage && <p className="mt-3 text-center text-red-500">{errorMessage}</p>}

      <div className={clsx("mt-10 flex justify-center hover:underline", { "pointer-events-none": sendResetLink.isPending })}>
        <Link href="/">Back to Home</Link>
      </div>
    </div>
  );
}
