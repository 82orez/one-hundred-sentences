"use client";

import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import ErrorHelpModal from "@/components/ErrorHelpModal";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { status, data: session } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const isSemiAdmin = session?.user?.role === "semiAdmin";
  const isTeacher = session?.user?.role === "teacher";
  const isStudent = session?.user?.role === "student";
  // 로딩 상태 추가
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  // 드롭다운 메뉴 상태 추가
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 경로가 변경될 때마다 로딩 상태 초기화 - 로그인 페이지에서는 로딩 상태 false
  useEffect(() => {
    setIsLoading(false);
    console.log(`pathname: ${pathname}`);
  }, [pathname]);

  // 로그인 페이지로 이동하는 함수
  const handleLoginClick = () => {
    setIsLoading(true);
    router.push("/users/sign-in");
  };

  // 외부 클릭 시 드롭다운 메뉴 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-10 flex w-full items-center justify-between bg-white px-6 py-2 shadow-md md:py-4">
      <h1 className="text-2xl font-bold">
        <Link href="/" className={"block md:hidden"}>
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
            {/* 이 부분은 navbar 메뉴 영역*/}
            {isAdmin && (
              <>
                <Link
                  href="/users/admin"
                  className="hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:block"
                  onClick={() => setMenuOpen(false)}>
                  Admin-Dashboard
                </Link>

                <Link
                  href="/users/admin/courses"
                  className="hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:block"
                  onClick={() => setMenuOpen(false)}>
                  강좌 관리
                </Link>

                <Link
                  href="/users/admin/teachers"
                  className="hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:block"
                  onClick={() => setMenuOpen(false)}>
                  강사 관리
                </Link>

                <Link
                  href="/purchase/courses"
                  className="hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:block"
                  onClick={() => setMenuOpen(false)}>
                  Purchase
                </Link>

                <Link
                  href="/course-detail/phil-video-one-to-one"
                  className="hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:block"
                  onClick={() => setMenuOpen(false)}>
                  필리핀
                </Link>
              </>
            )}

            {isTeacher && (
              <>
                <Link
                  href="/users/teacher"
                  className={clsx("hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:block", {})}
                  onClick={() => setMenuOpen(false)}>
                  강사 페이지
                </Link>
              </>
            )}

            {!isTeacher && (
              <Link
                href="/users/my-courses"
                className="hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:block"
                onClick={() => setMenuOpen(false)}>
                내 강의실 입장
              </Link>
            )}

            <Link
              href="/users/profile"
              className="hidden px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 md:block"
              onClick={() => setMenuOpen(false)}>
              회원 정보
            </Link>

            {/* 아래는 드롭다운 버튼 영역 */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-md bg-white px-4 py-2 text-gray-800 hover:bg-gray-100">
                <div className="flex items-center justify-center">
                  <div>❤️ {session.user?.realName ? session.user.realName : session.user.email} 님</div>
                  {menuOpen ? <ChevronUp className="ml-2" size={18} /> : <ChevronDown className="ml-2" size={18} />}
                  {/*<ChevronDown className="ml-2" size={18} />*/}
                </div>
              </button>

              {/* 드롭다운 메뉴 */}
              {menuOpen && (
                <div className="ring-opacity-5 absolute right-0 mt-2 w-56 rounded-md bg-white py-2 shadow-lg ring-1 ring-black">
                  {isAdmin && (
                    <>
                      <Link
                        href="/users/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}>
                        Admin-Dashboard
                      </Link>

                      <Link
                        href="/users/admin/courses"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}>
                        강좌 관리
                      </Link>

                      <Link
                        href="/users/admin/teachers"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}>
                        강사 관리
                      </Link>

                      <Link href="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
                        대시보드
                      </Link>

                      <Link
                        href="/course-detail/phil-video-one-to-one"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}>
                        필리핀
                      </Link>

                      <Link href="/learn" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
                        기존 Learn
                      </Link>

                      <Link
                        href="/purchase/courses"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}>
                        Purchase
                      </Link>
                    </>
                  )}

                  {(isTeacher || isAdmin) && (
                    <>
                      <Link
                        href="/users/teacher"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}>
                        강사 페이지
                      </Link>

                      <Link
                        href="/users/teacher/teacher-courses"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setMenuOpen(false)}>
                        teacher-courses
                      </Link>
                    </>
                  )}

                  {(isAdmin || isSemiAdmin || isStudent) && (
                    <Link
                      href="/purchase/waiting-courses"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setMenuOpen(false)}>
                      결제 대기 강의 보기
                    </Link>
                  )}

                  <Link
                    href="/users/my-courses"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setMenuOpen(false)}>
                    내 강의실 입장
                  </Link>

                  <Link href="/users/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setMenuOpen(false)}>
                    회원 정보
                  </Link>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      setIsErrorModalOpen(true);
                    }}
                    className="block w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100">
                    오류 대처 방법
                  </button>

                  <div className="my-1 border-t border-gray-200"></div>

                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100">
                    로그아웃
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <button
              onClick={handleLoginClick}
              disabled={isLoading}
              className={clsx("btn flex items-center gap-2", { hidden: pathname === "/users/sign-in" })}>
              {isLoading && <AiOutlineLoading3Quarters className="animate-spin" />}
              로그인
            </button>
          </>
        )}
      </div>

      {/* 오류 대처 방법 모달 */}
      <ErrorHelpModal isOpen={isErrorModalOpen} onClose={() => setIsErrorModalOpen(false)} />
    </nav>
  );
}
