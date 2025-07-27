import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import * as PortOne from "@portone/browser-sdk/v2";

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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer" | null>(null);
  const [isTransferConfirmed, setIsTransferConfirmed] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const router = useRouter();
  const scrollableRef = useRef<HTMLDivElement>(null);

  // 무통장 입금 선택 시 자동 스크롤
  useEffect(() => {
    if (paymentMethod === "transfer" && scrollableRef.current) {
      // 약간의 지연을 두어 DOM이 업데이트된 후 스크롤
      setTimeout(() => {
        if (scrollableRef.current) {
          scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
        }
      }, 100);
    }
  }, [paymentMethod]);

  const handleCardPayment = async () => {
    try {
      setIsPurchasing(true);

      // * 카드 결제 처리 로직
      const response = await PortOne.requestPayment({
        // Store ID 설정
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        // 채널 키 설정
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        paymentId: `payment-${crypto.randomUUID()}`,
        // courseId를 orderName에 포함시켜 나중에 파싱할 수 있도록 함
        orderName: `${courseTitle}|${courseId}`,
        totalAmount: totalFee,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
        redirectUrl: `${window.location.origin}/api/payment/complete`,
      });

      console.log("Purchase-response: ", response);

      if (response?.code !== undefined) {
        alert(response.message);
      } else {
        // 리디렉션 URL 로 바로 이동
        window.location.href = `${window.location.origin}/api/payment/complete?paymentId=${response.paymentId}`;
      }
    } catch (error) {
      console.error("구매 중 오류 발생:", error);
      alert("구매 처리 중 문제가 발생했습니다.");
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleEnrollment = async () => {
    if (isProcessing) return;

    // 지불 방법 선택 확인
    if (!paymentMethod) {
      toast.error("지불 방법을 선택해주세요.");
      return;
    }

    // 무통장 입금 선택 시 체크박스 확인
    if (paymentMethod === "transfer" && !isTransferConfirmed) {
      toast.error("무통장 입금 안내 내용을 확인해주세요.");
      return;
    }

    // 확인 메시지 표시
    const userConfirmed = confirm("수강 관련 정보를 모두 확인하셨습니까? (신청자 정보, 수강료, 유의 사항 등)");

    if (!userConfirmed) {
      return; // 사용자가 취소를 누르면 함수 종료
    }

    setIsProcessing(true);

    try {
      if (paymentMethod === "card") {
        // 카드 결제 로직 실행
        await handleCardPayment();
        return; // 카드 결제의 경우 여기서 함수 종료
      }

      // 무통장 입금의 경우 기존 로직 실행
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
          // ! 서버 코드 수정 필요
          paymentMethod: paymentMethod, // 선택된 지불 방법 추가
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "수강 신청이 완료되었습니다!");
        onClose();

        // 무통장 입금의 경우 결제 대기 화면으로 이동
        alert("수강 신청이 완료되었습니다. 결제 대기 화면으로 이동합니다.");
        router.push(`/purchase/waiting-courses`);
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

  const handlePaymentMethodChange = (method: "card" | "transfer") => {
    setPaymentMethod(paymentMethod === method ? null : method);
    // 무통장 입금이 아닌 경우 체크박스 상태 초기화
    if (method !== "transfer") {
      setIsTransferConfirmed(false);
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
        <div ref={scrollableRef} className="flex-1 overflow-y-auto px-3 py-4 md:px-6">
          <div className="space-y-4">
            {/* 신청자 정보 */}
            <div className="rounded-lg bg-gray-100 p-4">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">신청자 정보</h3>
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
              <h3 className="mb-3 text-lg font-semibold text-blue-900">강좌 정보</h3>
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

            {/* 결제 방법 선택 영역 */}
            <div className="rounded-lg bg-green-50 p-4">
              <h3 className="mb-3 text-lg font-semibold text-green-900">결제 방법 선택</h3>
              <div className="space-y-3">
                {/* 카드 결제 옵션 */}
                <label className="flex cursor-not-allowed items-center opacity-50">
                  <input
                    type="checkbox"
                    checked={paymentMethod === "card"}
                    onChange={() => handlePaymentMethodChange("card")}
                    className="mr-3 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    disabled
                  />
                  <div className="flex-1">
                    <span className="font-medium text-green-700">카드 결제</span>
                    <p className="mt-1 text-sm text-green-600">즉시 결제 후 수강 신청이 완료됩니다.</p>
                  </div>
                </label>

                {/* 무통장 입금 옵션 */}
                <label className="flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={paymentMethod === "transfer"}
                    onChange={() => handlePaymentMethodChange("transfer")}
                    className="mr-3 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div className="flex-1">
                    <span className="font-medium text-green-700">무통장 입금</span>
                    <p className="mt-1 text-sm text-green-600">아래 계좌로 입금 후 확인까지 시간이 소요됩니다.</p>
                  </div>
                </label>
              </div>
            </div>

            {/* 무통장 입금 안내 */}
            {paymentMethod === "transfer" && (
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

                <div className="mt-0 space-y-3 text-yellow-700">
                  <p>• 아래의 '수강 신청' 버튼을 클릭하시면 결제 대기 상태로 전환됩니다.</p>
                  <p>• 수강 신청 및 결제 대기 중인 강의 리스트는 '결제 대기 강의 보기' 메뉴에서 확인하실 수 있습니다.</p>
                  <p>
                    • 반드시 내일 <span className={"font-semibold underline"}>{getTomorrowDeadlineText()}</span>까지 입금 부탁드립니다.
                  </p>
                  <p>• 해당 시간까지 입금 정보가 확인이 되지 않을 경우 자동으로 수강 신청 내역이 취소점 양해 부탁드립니다.</p>
                </div>

                {/* 확인 체크박스 */}
                <div className="mt-4 flex justify-center border-t border-yellow-300 pt-4">
                  <label className="flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={isTransferConfirmed}
                      onChange={(e) => setIsTransferConfirmed(e.target.checked)}
                      className="mr-3 h-4 w-4 rounded border-yellow-300 text-yellow-600 focus:ring-yellow-500"
                    />
                    <span className="font-medium text-yellow-800">위 내용을 확인하였습니다.</span>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 하단 고정 버튼 */}
        <div className="border-t border-gray-200 px-3 py-4 md:px-6">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isProcessing || isPurchasing}
              className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 disabled:opacity-50">
              이전 단계
            </button>
            <button
              onClick={handleEnrollment}
              disabled={isProcessing || isPurchasing || !paymentMethod || (paymentMethod === "transfer" && !isTransferConfirmed)}
              className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50">
              {isProcessing || isPurchasing ? "처리 중..." : paymentMethod === "card" ? "카드 결제" : "수강 신청"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentConfirmModal;
