export default function CoursePage() {
  return (
    <div className="container mx-auto p-6">
      <h2 className="mb-6 text-2xl font-bold">강좌 관리</h2>
      <div className="rounded-lg bg-white p-6 shadow-md">
        <p className="text-gray-600">강좌 관리 페이지입니다. 여기에서 강좌를 추가, 수정, 삭제할 수 있습니다.</p>
        {/* 강좌 목록 또는 관리 UI를 여기에 추가할 수 있습니다 */}
        <div className="mt-4">
          <button className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600">새 강좌 추가</button>
        </div>
      </div>
    </div>
  );
}
