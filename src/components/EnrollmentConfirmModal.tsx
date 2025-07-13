import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface UserInfo {
  realName: string;
  phone: string;
}

interface EnrollmentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: UserInfo;
  courseId: string;
  courseTitle: string;
  selectedDate: Date;
  remainingClasses: number;
  totalFee: number;
}

const EnrollmentConfirmModal: React.FC<EnrollmentConfirmModalProps> = ({
  isOpen,
  onClose,
  userInfo,
  courseId,
  courseTitle,
  selectedDate,
  remainingClasses,
  totalFee,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleEnrollment = async () => {
    if (isProcessing) return;

    // 확인 메시지 표시
    const userConfirmed = confirm("수강 관련 정보를 모두 확인하셨습니까? (신청자 정보, 수강료, 유의 사항 등)");

    if (!userConfirmed) {
      return; // 사용자가 취소를 누르면 함수 종료
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/payment/wait-for-purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: courseId,
          courseTitle: courseTitle,
          startDate: selectedDate.toISOString(),
          classCount: remainingClasses,
          totalFee: totalFee,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "수강 신청이 완료되었습니다!");
        onClose();
        // 필요시 페이지 리로드 또는 다른 페이지로 이동
        alert("수강 신청이 완료되었습니다. 결제 대기 화면으로 이동합니다.");
        router.push(`/purchase/waiting-courses`);
        // window.location.reload();
      } else {
        toast.error(data.error || "수강 신청 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("수강 신청 처리 중 오류:", error);
      toast.error("수강 신청 처리 중 오류가 발생했습니다.");
    } finally {
      setIsProcessing(false);
    }
  };

  // 현재 날짜 계산을 위한 함수 추가
  const getTomorrowDeadlineText = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const month = tomorrow.getMonth() + 1;
    const date = tomorrow.getDate();

    return `${month}/${date}일 오후 5시`;
  };

  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="relative mx-4 flex h-[90vh] w-full max-w-md flex-col rounded-lg bg-white shadow-xl">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-gray-200 px-3 py-4 md:px-6">
          <h2 className="text-xl font-bold text-gray-900">수강 신청 확인</h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* 스크롤 가능한 콘텐츠 영역 */}
        <div className="flex-1 overflow-y-auto px-3 py-4 md:px-6">
          <div className="space-y-4">
            {/* 신청자 정보 */}
            <div className="rounded-lg bg-gray-100 p-4">
              <h3 className="mb-3 text-lg font-medium text-gray-900">신청자 정보</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-800">이름 :</span>
                  <span className="font-medium">{userInfo.realName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-800">전화번호 :</span>
                  <span className="font-medium">{userInfo.phone}</span>
                </div>
              </div>
              <p className={"mt-4 text-center text-gray-500"}>
                이름과 전화번호가 틀리다면,{" "}
                <Link href={"/users/edit"} className={"underline"}>
                  수정하기!
                </Link>
              </p>
            </div>

            {/* 강좌 정보 */}
            <div className="rounded-lg bg-blue-50 p-4">
              <h3 className="mb-3 text-lg font-medium text-blue-900">강좌 정보</h3>
              <div className="space-y-2 text-sm md:text-base">
                <div className="flex justify-between">
                  <span className="text-blue-700">강좌명 :</span>
                  <span className="font-medium text-blue-900">{courseTitle}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">수강 시작일 :</span>
                  <span className="font-medium text-blue-900">{format(selectedDate, "yyyy년 MM월 dd일 (E)", { locale: ko })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">수업 횟수 :</span>
                  <span className="font-medium text-blue-900">{remainingClasses}회</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">수강료 :</span>
                  <span className="text-lg font-bold text-blue-900">{totalFee.toLocaleString()}원</span>
                </div>
              </div>
            </div>

            {/* 무통장 입금 안내 */}
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <h3 className="mb-3 text-lg font-medium text-yellow-900">무통장 입금 안내</h3>
              <div className="space-y-2 text-sm md:text-base">
                <div className="flex justify-between">
                  <span className="text-yellow-700">예금주 :</span>
                  <span className="font-medium text-yellow-900">(주)프렌딩</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-yellow-700">계좌 번호 :</span>
                  <span className="font-medium text-yellow-900">국민은행 / 680401-00-111448</span>
                </div>
              </div>

              <div className="my-4 border border-yellow-800"></div>

              <p></p>
              <div className="mt-0 space-y-3 text-yellow-700">
                <p>• 아래의 '수강 신청' 버튼을 클릭하시면 결제 대기 상태로 전환됩니다.</p>
                <p>• 수강 신청 및 결제 대기 중인 강의 리스트는 '결제 대기 강의 보기' 메뉴에서 확인하실 수 있습니다.</p>
                <p>
                  • 반드시 내일 <span className={"font-semibold underline"}>{getTomorrowDeadlineText()}</span>까지 입금 부탁드립니다.
                </p>
                <p>• 해당 시간까지 입금 정보가 확인이 되지 않을 경우 자동으로 수강 신청 내역이 취소점 양해 부탁드립니다.</p>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 고정 버튼 */}
        <div className="border-t border-gray-200 px-3 py-4 md:px-6">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50">
              취소
            </button>
            <button
              onClick={handleEnrollment}
              disabled={isProcessing}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
              {isProcessing ? "처리 중..." : "수강 신청"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentConfirmModal;
