"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import clsx from "clsx";
import Link from "next/link";
import { GoEye } from "react-icons/go";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { PiEyeClosed } from "react-icons/pi";

export default function SignUp() {
  const router = useRouter();

  const [step, setStep] = useState<"inputEmail" | "verifyCode" | "inputPassword">("inputEmail");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmPassword, setConfirmPassword] = useState(""); // 비밀번호 확인 입력 상태 추가
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 이메일 유효성 검사
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // 비밀번호 유효성 검사 (영문 포함 6자리 이상)
  const isValidPassword = (password: string) => /^(?=.*[A-Za-z]).{6,}$/.test(password);

  const isPasswordMatch = password === confirmPassword; // 비밀번호 일치 여부 확인
  const isPasswordValid = isValidPassword(password); // 비밀번호 유효성 확인

  const sendVerification = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "오류가 발생했습니다.");
      }
      return data;
    },
    onSuccess: (data) => {
      setMessage(data.message || "Verification code sent to email.");
      setErrorMessage("");
      setStep("verifyCode");
    },
    onError: (error: any) => {
      setMessage(`Error: ${error.message}`);
      setErrorMessage(error.message);
    },
  });

  const validateCode = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/validate-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Invalid or expired token.");
      }
      return data;
    },
    onSuccess: (data) => {
      setStep("inputPassword");
      setMessage(data.message || "Email verified successfully!");
      setErrorMessage("");
    },
    onError: (error: any) => {
      setMessage(`Error: ${error.message}`);
      setErrorMessage(`${error.message}`);
    },
  });

  const registerUser = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    },
    onSuccess: (data) => {
      setMessage(data.message || "Registration successful!");
      setErrorMessage("");
      alert(`${data.message} 로그인 페이지로 이동합니다.`);
      // * 회원 가입에 성공하면 이동할 page
      router.push("/users/sign-in");
    },
    onError: (error: any) => {
      setMessage(`Error: ${error.message}`);
      setErrorMessage(`${error.message}`);
    },
  });

  return (
    <div className="mx-auto mt-10 w-full max-w-[375px] rounded-lg bg-white p-6 shadow-lg">
      <h1 className="mb-10 text-2xl font-semibold">회원 가입하기</h1>

      {step === "inputEmail" ? (
        <>
          <p className={"mb-4 border-b-4 border-blue-400 pb-1 text-xl"}>Step 1. 이메일 입력하기</p>

          <label htmlFor="email" className="mb-2 block">
            사용하실 이메일을 입력해 주세요.
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
              onClick={() => sendVerification.mutate()}
              disabled={!isValidEmail(email) || sendVerification.isPending}
              // disabled={true}
              className={clsx("w-full rounded-md bg-blue-600 p-2 text-white hover:bg-blue-400 disabled:opacity-80")}>
              {sendVerification.isPending ? "인증 코드 보내는 중..." : "이메일로 인증 코드 보내기"}
            </button>
            {sendVerification.isPending && <AiOutlineLoading3Quarters className={"absolute left-10 top-3.5 animate-spin md:left-11"} />}
          </div>
        </>
      ) : step === "verifyCode" ? (
        <>
          <p className={"mb-4 border-b-4 border-green-400 pb-1 text-xl"}>Step 2. 인증코드 입력하기</p>

          <div className={clsx("", { hidden: !message || message === "Error: 이미 가입된 이메일입니다." })}>
            <label htmlFor="token" className="mb-2 mt-2 block">
              인증코드를 입력해 주세요.
            </label>
            <input
              id="token"
              type="text"
              placeholder="6자리 인증코드"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="mb-1 block w-full border p-2"
            />
            <div className={"relative"}>
              <button
                onClick={() => validateCode.mutate()}
                disabled={!token || validateCode.isPending}
                className="mt-2 w-full rounded-md bg-green-600 p-2 text-white hover:bg-green-500 disabled:opacity-80">
                {validateCode.isPending ? "인증 중..." : "인증하기"}
              </button>
              {validateCode.isPending && <AiOutlineLoading3Quarters className={"absolute left-12 top-5 animate-spin"} />}
            </div>
          </div>
        </>
      ) : (
        <>
          <p className={"mb-4 border-b-4 border-blue-400 pb-1 text-xl"}>Step 3. 비밀번호 등록하기</p>
          <label htmlFor="password" className="mb-1 block">
            비밀 번호를 입력해 주세요.
          </label>
          <div className={"relative"}>
            <input
              id="password"
              type={showPassword ? "text" : "password"} // showPassword 상태에 따라 타입 변경
              placeholder="영문 포함 6자리 이상"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-3 block w-full border p-2"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={clsx("absolute right-3 top-2.5 text-gray-600 hover:text-gray-800", { hidden: !password })}>
              {showPassword ? <GoEye size={25} /> : <PiEyeClosed size={25} />}
            </button>
          </div>

          {!isPasswordValid && password && <p className="mb-3 text-red-500">비밀번호는 영문을 포함하여 6자리 이상이어야 합니다.</p>}

          <label htmlFor="confirmPassword" className="mb-1 block">
            비밀번호를 확인해 주세요.
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="비밀번호를 확인"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mb-3 block w-full border p-2"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className={clsx("absolute right-3 top-2.5 text-gray-600 hover:text-gray-800", {
                hidden: !password || !confirmPassword,
              })}>
              {showConfirmPassword ? <GoEye size={25} /> : <PiEyeClosed size={25} />}
            </button>
          </div>

          <div className={clsx("", { hidden: !password || !confirmPassword })}>
            {!isPasswordMatch ? (
              <p className="mb-3 animate-pulse text-red-500">비밀번호가 일치하지 않습니다.</p>
            ) : (
              <p className="mb-3 text-green-500">비밀번호가 일치합니다.</p>
            )}
          </div>

          <div className={"relative"}>
            <button
              disabled={!isPasswordMatch || !isPasswordMatch || registerUser.isPending || !password || !confirmPassword}
              onClick={() => registerUser.mutate()}
              className="w-full rounded-md bg-blue-600 p-2 text-white hover:bg-blue-400 disabled:opacity-80">
              {registerUser.isPending ? "회원 가입 중..." : "회원 가입 완료하기"}
            </button>
            {registerUser.isPending && <AiOutlineLoading3Quarters className={"absolute left-11 top-3.5 animate-spin md:left-12"} />}
          </div>
        </>
      )}

      {errorMessage && <p className="mt-2 animate-pulse text-center text-red-500">{errorMessage}</p>}
      {/*{message.startsWith("Error") && <p className={"mt-2 text-red-500"}>{message}</p>}*/}
      {/*{message && <p className={`mt-2 ${message.startsWith("Error") ? "text-red-500" : "text-green-500"}`}>{message}</p>}*/}

      <div
        className={clsx("mt-20 flex justify-center hover:underline", {
          "pointer-events-none": sendVerification.isPending || validateCode.isPending || registerUser.isPending,
        })}>
        <Link href={"/"}>Back to Home</Link>
      </div>
    </div>
  );
}
