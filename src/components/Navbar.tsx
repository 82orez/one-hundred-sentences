"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
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

      <div className="flex items-center gap-5 md:gap-8">
        {status === "authenticated" ? (
          <>
            <div className="hidden text-gray-700">{session?.user?.email}</div>

            <Link href="/users/profile" className={"hover:underline"}>
              회원 정보
            </Link>
            <button onClick={() => signOut({ callbackUrl: "/" })} className={"btn"}>
              로그아웃
            </button>
          </>
        ) : (
          <>
            <button onClick={() => router.push("/users/sign-in")} className="btn">
              로그인
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
