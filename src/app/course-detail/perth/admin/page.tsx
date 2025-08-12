"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface PerthQuestion {
  id: string;
  name: string;
  phone: string;
  email?: string;
  message: string;
  consultationContent?: string;
  consultedAt?: string;
  consultedBy?: string;
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
  const [consultationContent, setConsultationContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

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
    setConsultationContent(question.consultationContent || "");
    setIsModalOpen(true);
  };

  // 모달 닫기 핸들러
  const closeModal = () => {
    setSelectedQuestion(null);
    setConsultationContent("");
    setIsModalOpen(false);
  };

  // 상담 내용 저장 핸들러
  const handleSaveConsultation = async () => {
    if (!selectedQuestion || !consultationContent.trim()) {
      toast.error("상담 내용을 입력해주세요.");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/perth-questions", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedQuestion.id,
          consultationContent: consultationContent.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("상담 내용 저장에 실패했습니다.");
      }

      const result = await response.json();

      // 로컬 상태 업데이트
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === selectedQuestion.id ? { ...q, consultationContent: consultationContent.trim(), consultedAt: new Date().toISOString() } : q,
        ),
      );

      setSelectedQuestion((prev) =>
        prev
          ? {
              ...prev,
              consultationContent: consultationContent.trim(),
              consultedAt: new Date().toISOString(),
            }
          : null,
      );

      toast.success("상담 내용이 저장되었습니다.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
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
                    <th className="text-left">상담상태</th>
                    <th className="text-left">작성일</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-gray-500">
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
                        <td>
                          {question.consultationContent ? (
                            <span className="badge badge-success text-white">상담완료</span>
                          ) : (
                            <span className="badge badge-warning text-white">대기중</span>
                          )}
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

          {/* 문의 상세보기 및 상담 등록 모달 */}
          <input type="checkbox" id="question-modal" className="modal-toggle" checked={isModalOpen} readOnly />
          <div className="modal">
            <div className="modal-box max-w-4xl">
              <h3 className="mb-4 text-lg font-bold">문의 상세 정보 및 상담 관리</h3>

              {selectedQuestion && (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {/* 문의 정보 */}
                  <div className="space-y-4">
                    <h4 className="text-md border-b pb-2 font-semibold text-gray-800">문의 정보</h4>

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

                    {selectedQuestion.consultedAt && (
                      <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">상담 완료일</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedQuestion.consultedAt)}</p>
                      </div>
                    )}
                  </div>

                  {/* 상담 내용 */}
                  <div className="space-y-4">
                    <h4 className="text-md border-b pb-2 font-semibold text-gray-800">상담 내용</h4>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        상담 내용 {selectedQuestion.consultationContent ? "(수정)" : "(신규 등록)"}
                      </label>
                      <textarea
                        className="h-40 w-full resize-none rounded-lg border border-gray-300 p-3 focus:border-transparent focus:ring-2 focus:ring-blue-500"
                        placeholder="상담한 내용을 상세히 입력해주세요..."
                        value={consultationContent}
                        onChange={(e) => setConsultationContent(e.target.value)}
                      />
                    </div>

                    <button className="btn btn-primary w-full" onClick={handleSaveConsultation} disabled={isSaving || !consultationContent.trim()}>
                      {isSaving ? (
                        <>
                          <span className="loading loading-spinner loading-sm"></span>
                          저장 중...
                        </>
                      ) : selectedQuestion.consultationContent ? (
                        "상담 내용 수정"
                      ) : (
                        "상담 내용 등록"
                      )}
                    </button>

                    {selectedQuestion.consultationContent && (
                      <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
                        <label className="mb-2 block text-sm font-medium text-green-800">기존 상담 내용</label>
                        <p className="text-sm whitespace-pre-wrap text-green-700">{selectedQuestion.consultationContent}</p>
                      </div>
                    )}
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
