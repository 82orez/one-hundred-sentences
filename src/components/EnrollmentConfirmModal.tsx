import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { X } from "lucide-react";
import Link from "next/link";

interface UserInfo {
  realName: string;
  phone: string;
}

interface EnrollmentConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  userInfo: UserInfo;
  courseTitle: string;
  selectedDate: Date;
  remainingClasses: number;
  totalFee: number;
}

const EnrollmentConfirmModal: React.FC<EnrollmentConfirmModalProps> = ({
  isOpen,
  onClose,
  userInfo,
  courseTitle,
  selectedDate,
  remainingClasses,
  totalFee,
}) => {
  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
      <div className="relative mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white px-3 py-6 shadow-xl md:p-6">
        {/* 헤더 */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">수강 신청 확인</h2>
          <button onClick={onClose} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* 신청 내역 */}
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
            <div className="mt-4 space-y-1 text-sm text-yellow-700">
              <p>• 금일 중으로 입금 부탁드립니다.</p>
              <p>• 결제 대기 중인 강의 리스트는 '결제 대기 강의 보기' 메뉴에서 확인하실 수 있습니다.</p>
            </div>
          </div>
        </div>

        {/* 버튼 */}
        <div className="mt-6 flex space-x-3">
          <button onClick={onClose} className="flex-1 rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700">
            취소
          </button>
          <button
            onClick={() => {
              // 여기에 실제 수강 신청 로직을 추가하세요
              console.log("수강 신청 처리");
              onClose();
            }}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
            신청하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrollmentConfirmModal;
