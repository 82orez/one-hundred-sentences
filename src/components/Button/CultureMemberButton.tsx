"use client";

import { useRouter } from "next/navigation";

export function CultureMemberButton({ children, className, ...props }) {
  const router = useRouter();
  return (
    <button
      className={`rounded-full bg-indigo-600 px-6 py-3 text-lg text-white hover:bg-indigo-700 ${className}`}
      {...props}
      onClick={() => {
        router.replace("/users/my-courses");
      }}>
      {children}
    </button>
  );
}
