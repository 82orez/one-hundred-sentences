"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function MoveToPurchaseCourseButton({ children, className, ...props }) {
  const router = useRouter();
  const { status } = useSession();

  const handleClick = () => {
    if (status === "authenticated") {
      router.replace("/purchase/courses");
    } else {
      // 로그인되지 않은 경우 callbackUrl과 함께 로그인 페이지로 이동
      router.replace("/users/sign-in?callbackUrl=" + encodeURIComponent("/purchase/courses"));
    }
  };

  return (
    <button className={`${className}`} {...props} onClick={handleClick}>
      {children}
    </button>
  );
}
