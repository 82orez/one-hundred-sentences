"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IoHomeOutline } from "react-icons/io5";
import clsx from "clsx";

export default function Navbar() {
  const router = useRouter();
  const { status, data: session } = useSession();

  return (
    <nav className="sticky top-0 z-10 flex w-full items-center justify-between bg-white px-6 py-2 shadow-md md:py-4">
      <h1 className="text-2xl font-bold">
        <Link href="/" className={"block md:hidden"}>
          {/*<IoHomeOutline size={"30"} className={clsx("", { hidden: status !== "authenticated" })} />*/}
          <div className={clsx("", { hidden: status !== "authenticated" })}>Home</div>
          <div className={clsx("", { hidden: status === "authenticated" })}>Friending</div>
        </Link>
        <Link href="/" className={"hidden md:block"}>
          Friending Academy
        </Link>
      </h1>

      <Link href="/purchase" className={"hover:underline"}>
        Purchase
      </Link>

      <div className="flex items-center gap-3">
        {status === "authenticated" ? (
          <>
            <div className="hidden text-gray-700">{session?.user?.email}</div>

            <Link href="/users/profile" className={"hover:underline"}>
              회원 정보
            </Link>
            <Button variant={"outline"} onClick={() => signOut({ callbackUrl: "/" })} className="text-md cursor-pointer rounded-md hover:underline">
              로그아웃
            </Button>
          </>
        ) : (
          <>
            <button
              onClick={() => router.push("/users/sign-up")}
              className="hidden cursor-pointer rounded-md border border-blue-500 px-4 py-2 text-blue-500 transition hover:bg-blue-500 hover:text-white">
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
