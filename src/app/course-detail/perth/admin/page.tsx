"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface PerthQuestion {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ApiResponse {
  data: PerthQuestion[];
  pagination: PaginationInfo;
}

export default function PerthQuestionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [questions, setQuestions] = useState<PerthQuestion[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<PerthQuestion | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 권한 확인
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    const userRole = (session.user as any)?.role;
    if (userRole !== "admin" && userRole !== "semiAdmin") {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  // 데이터 로드
  const fetchQuestions = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/perth-questions?page=${page}&limit=${pagination.limit}`);

      if (!response.ok) {
        throw new Error("문의 목록을 불러오는데 실패했습니다.");
      }

      const data: ApiResponse = await response.json();
      setQuestions(data.data);
      setPagination(data.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session && ((session.user as any)?.role === "admin" || (session.user as any)?.role === "semiAdmin")) {
      fetchQuestions();
    }
  }, [session]);

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchQuestions(newPage);
    }
  };

  // 문의 상세보기 핸들러
  const handleQuestionClick = (question: PerthQuestion) => {
    setSelectedQuestion(question);
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const closeModal = () => {
    setSelectedQuestion(null);
    setIsModalOpen(false);
  };

  // 날짜 포맷 함수
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (!session || ((session.user as any)?.role !== "admin" && (session.user as any)?.role !== "semiAdmin")) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">퍼스 투어 문의 관리</h1>
        <div className="text-sm text-gray-600">총 {pagination.total}건의 문의</div>
      </div>

      {error && (
        <div className="alert alert-error mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="loading loading-spinner loading-lg"></div>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg bg-white shadow">
            <div className="overflow-x-auto">
              <table className="table w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left">번호</th>
                    <th className="text-left">이름</th>
                    <th className="text-left">연락처</th>
                    <th className="text-left">이메일</th>
                    <th className="text-left">문의내용</th>
                    <th className="text-left">작성일</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        등록된 문의가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    questions.map((question, index) => (
                      <tr key={question.id} className="hover:bg-gray-50">
                        <td className="font-medium">{(pagination.page - 1) * pagination.limit + index + 1}</td>
                        <td>{question.name}</td>
                        <td>{question.phone}</td>
                        <td>{question.email ? question.email : <span className="text-gray-400">-</span>}</td>
                        <td className="max-w-xs cursor-pointer transition-colors hover:bg-blue-50" onClick={() => handleQuestionClick(question)}>
                          <div className="truncate" title="클릭하여 전체 내용 보기">
                            {question.message}
                          </div>
                        </td>
                        <td className="text-sm text-gray-600">{formatDate(question.createdAt)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 페이지네이션 */}
          {pagination.totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="join">
                <button className="join-item btn btn-sm" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1}>
                  이전
                </button>

                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    className={`join-item btn btn-sm ${pageNum === pagination.page ? "btn-active" : ""}`}
                    onClick={() => handlePageChange(pageNum)}>
                    {pageNum}
                  </button>
                ))}

                <button
                  className="join-item btn btn-sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}>
                  다음
                </button>
              </div>
            </div>
          )}

          {/* 문의 상세보기 모달 */}
          <input type="checkbox" id="question-modal" className="modal-toggle" checked={isModalOpen} readOnly />
          <div className="modal">
            <div className="modal-box max-w-2xl">
              <h3 className="mb-4 text-lg font-bold">문의 상세 정보</h3>

              {selectedQuestion && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">이름</label>
                    <p className="text-sm text-gray-900">{selectedQuestion.name}</p>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">연락처</label>
                    <p className="text-sm text-gray-900">
                      <a href={`tel:${selectedQuestion.phone}`} className="text-blue-600 hover:underline">
                        {selectedQuestion.phone}
                      </a>
                    </p>
                  </div>

                  {selectedQuestion.email && (
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">이메일</label>
                      <p className="text-sm text-gray-900">
                        <a href={`mailto:${selectedQuestion.email}`} className="text-blue-600 hover:underline">
                          {selectedQuestion.email}
                        </a>
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">문의 내용</label>
                    <div className="rounded-lg bg-gray-50 p-3">
                      <textarea
                        className="h-32 w-full resize-none border-none bg-transparent text-sm whitespace-pre-wrap text-gray-900 focus:outline-none"
                        value={selectedQuestion.message}
                        readOnly
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">작성일</label>
                    <p className="text-sm text-gray-900">{formatDate(selectedQuestion.createdAt)}</p>
                  </div>
                </div>
              )}

              <div className="modal-action">
                <button className="btn" onClick={closeModal}>
                  닫기
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
