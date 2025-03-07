"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Navbar() {
  const router = useRouter();
  const { status, data: session } = useSession();

  return (
    <nav className="sticky top-0 z-10 flex w-full items-center justify-between bg-white px-6 py-4 shadow-md">
      <h1 className="text-2xl font-bold">
        <Link href="/" className={"block md:hidden"}>
          Friending
        </Link>
        <Link href="/" className={"hidden md:block"}>
          Friending Academy
        </Link>
      </h1>

      <div className="flex items-center gap-6">
        {status === "authenticated" ? (
          <>
            <div className="hidden text-gray-700">{session?.user?.email}</div>
            <Link href="/users/edit" className={"hidden"}>
              회원 정보 수정
            </Link>
            <Link href="/users/profile" className={"hover:underline"}>
              My Page
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="cursor-pointer rounded-md bg-gray-900 p-2 text-white transition hover:bg-red-600">
              로그 아웃
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/users/sign-up")}
              className="cursor-pointer rounded-md border border-blue-500 px-4 py-2 text-blue-500 transition hover:bg-blue-500 hover:text-white">
              회원가입
            </button>
            <button
              onClick={() => router.push("/users/sign-in")}
              className="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white transition hover:bg-blue-600">
              로그인
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
