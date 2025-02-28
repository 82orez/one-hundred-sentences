"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { GoEye } from "react-icons/go";
import clsx from "clsx";
import { TbMinusVertical } from "react-icons/tb";
import { PiEyeClosed } from "react-icons/pi";
import { BiSolidMessageRounded } from "react-icons/bi";

export default function SignIn() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // 비밀번호 표시 상태 추가

  // * 클라이언트 컴포넌트에서 로그인 session 정보 가져오기 : useSession()
  const { status, data } = useSession();
  console.log("status: ", status);
  console.log("data: ", data);

  // * 로그인이 되어 있을 때 이 페이지로 접근하면 루트 페이지 '/' 로 되돌림.
  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/todos");
    }
  }, [status, router]);

  // * auth.ts 파일에서 반환한 에러 관련 query 문들을  처리하기 위한 상태 설정.
  const [errorSocialLogIn, setErrorSocialLogIn] = useState<null | string>(null);
  const [existEmail, setExistEmail] = useState("");

  useEffect(() => {
    // ? 오류 방지를 위해 아래 코드를 클라이언트 환경에서만 실행할 수 있도록 설정.
    if (typeof window !== "undefined") {
      // * auth.ts 파일에서 반환한 에러 관련 query 문들을 처리.
      const params = new URLSearchParams(window.location.search);
      setErrorSocialLogIn(params.get("emailExistsError"));
      setExistEmail(params.get("existEmail"));
    }
  }, []);

  const [isKakaoLoading, setIsKakaoLoading] = useState(false);

  const handleClickKakao = async () => {
    setIsKakaoLoading(true);
    await signIn("kakao", { callbackUrl: "/todos" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error || "An error occurred during sign in.");
        setIsLoading(false); // 에러 발생 시 로딩 상태 해제
      } else {
        // 로그인 성공 후 로딩 화면을 유지
        setIsLoading(true);
        // * 로그인에 성공하면 '/' 로 이동.
        router.push("/");
      }
    } catch (error) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto mt-10 w-full max-w-[375px] rounded-lg bg-white p-6 shadow-lg">
      {/*UI 기반 오류 메세지 부분*/}
      {errorSocialLogIn === "EmailExists" && existEmail && (
        <div className="mb-4 animate-pulse rounded-md bg-cyan-200 px-5 py-2 text-center text-red-800">
          Email 로그인으로 다시 시도해주세요. 계정은 <span className={"font-bold"}>{existEmail}</span> 입니다.
        </div>
      )}

      <h1 className="mb-10 text-xl font-semibold">로그인 하기</h1>

      <div className="relative">
        <button
          type="button"
          onClick={handleClickKakao}
          disabled={isKakaoLoading || isLoading}
          className="flex w-full items-center rounded-md border bg-yellow-300 px-10 py-2 text-center font-semibold hover:bg-yellow-400 disabled:opacity-50 md:px-11">
          {isKakaoLoading ? <AiOutlineLoading3Quarters className={"animate-spin"} /> : <BiSolidMessageRounded size={22} />}
          <div className={"grow"} style={{ color: "rgba(0, 0, 0, 0.85)" }}>
            카카오로 시작하기
          </div>
        </button>
      </div>

      <div className="my-6 flex items-center">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="px-3 text-sm text-gray-500">또는 이메일로 로그인</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            placeholder="abc@example.com"
          />
        </div>

        <div className="relative">
          <label htmlFor="password" className="block text-sm font-medium">
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"} // showPassword 상태에 따라 타입 변경
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border border-gray-300 p-2"
            placeholder="비밀 번호를 입력해주세요."
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={clsx("absolute right-3 top-[2.1rem] text-gray-600 hover:text-gray-800", { hidden: !formData.password })}>
            {showPassword ? <GoEye size={25} /> : <PiEyeClosed size={25} />}
          </button>
        </div>

        <div className={"relative"}>
          <button
            type="submit"
            className={clsx(
              "flex h-10 w-full items-center justify-center rounded-md bg-blue-600 px-4 font-medium text-white hover:bg-blue-700 disabled:opacity-80",
              {
                "opacity-100": isLoading,
              },
            )}
            disabled={!formData.email || !formData.password || isLoading || isKakaoLoading}>
            {isLoading ? "로그인 중..." : "Email 로그인"}
          </button>
          {isLoading && <AiOutlineLoading3Quarters className={"absolute left-12 top-3.5 animate-spin md:left-14"} />}
        </div>
      </form>

      {error && <p className="mt-2 animate-pulse text-center text-red-500">{error}</p>}

      <div className={clsx("mt-3 flex justify-around", { "pointer-events-none": isLoading })}>
        <Link href={"/users/sign-up"} className={"min-w-32 text-center hover:underline"}>
          이메일 회원 가입
        </Link>
        <div className={"flex items-center justify-center"}>
          <TbMinusVertical className={"h-full"} />
        </div>
        <Link href={"/users/reset-password"} className={"min-w-32 text-center hover:underline"}>
          비밀번호 재설정
        </Link>
      </div>

      <div className={clsx("mt-10 flex justify-center hover:underline", { "pointer-events-none": isLoading || isKakaoLoading })}>
        <Link href={"/"}>Back to Home</Link>
      </div>
    </div>
  );
}
