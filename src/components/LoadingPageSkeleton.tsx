export default function LoadingPageSkeleton() {
  return (
    <div className="mx-auto mt-10 flex max-w-xl flex-col gap-4 p-8">
      {/* 타이틀 로딩 */}
      <div className="skeleton h-16"></div>

      {/* 프로필 로딩 */}
      <div className="flex items-center gap-4">
        <div className="skeleton h-16 w-16 rounded-full"></div>
        <div className="flex-1 space-y-2">
          <div className="skeleton h-6 w-1/2"></div>
          <div className="skeleton h-6 w-1/3"></div>
        </div>
      </div>

      {/* 카드 형태 로딩 */}
      <div className="skeleton h-40 w-full rounded-lg"></div>

      {/* 버튼 로딩 */}
      <div className="skeleton h-10 w-32 self-end rounded-lg"></div>
    </div>
  );
}
