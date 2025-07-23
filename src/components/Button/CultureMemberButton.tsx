"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function CultureMemberButton({ children, className, ...props }) {
  const router = useRouter();
  const { status } = useSession();

  const handleClick = () => {
    if (status === "authenticated") {
      router.replace("/users/my-courses");
    } else {
      // 로그인되지 않은 경우 callbackUrl과 함께 로그인 페이지로 이동
      router.replace("/users/sign-in?callbackUrl=" + encodeURIComponent("/users/my-courses"));
    }
  };

  return (
    <button className={`rounded-full bg-indigo-600 px-6 py-3 text-lg text-white hover:bg-indigo-700 ${className}`} {...props} onClick={handleClick}>
      {children}
    </button>
  );
}
