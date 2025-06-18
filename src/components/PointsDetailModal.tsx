import { PointsDetailResponse } from "@/types/points";

interface PointsDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName: string | null;
  pointsDetail: PointsDetailResponse | null;
  isLoading: boolean;
  error: Error | null;
}

export function PointsDetailModal({ isOpen, onClose, userName, pointsDetail, isLoading, error }: PointsDetailModalProps) {
  if (!isOpen) return null;

  return (
    <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 p-4">
      <div className="my-4 max-h-[90vh] w-11/12 max-w-3xl overflow-y-auto rounded-lg bg-white p-6 pt-0 shadow-lg md:pt-6">
        <h2 className="sticky top-0 z-10 mb-4 border-b bg-white p-4 pb-2 text-xl font-semibold">{userName}님의 포인트 상세 내역</h2>

        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
            <p className="ml-2">포인트 상세 정보를 불러오는 중...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg bg-red-100 p-4 text-red-700">
            <p>포인트 상세 정보를 불러오는 중 오류가 발생했습니다.</p>
          </div>
        ) : pointsDetail ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-medium">영상 시청</h3>
                <p>포인트: {pointsDetail.pointsDetail.videoPoints}점</p>
                <p>
                  시청 시간: {Math.round(pointsDetail.pointsDetail.videoSeconds / 60)}분 {pointsDetail.pointsDetail.videoSeconds % 60}초
                </p>
                <p className="mt-1 text-sm text-gray-500">전체 포인트의 {pointsDetail.pointsRate.videoPointsRate}%</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-medium">원어민 음성 듣기</h3>
                <p>포인트: {pointsDetail.pointsDetail.audioPoints}점</p>
                <p>듣기 횟수: {pointsDetail.pointsDetail.audioAttempts}회</p>
                <p className="mt-1 text-sm text-gray-500">전체 포인트의 {pointsDetail.pointsRate.audioPointsRate}%</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-medium">녹음 제출</h3>
                <p>포인트: {pointsDetail.pointsDetail.recordingPoints}점</p>
                <p>녹음 횟수: {pointsDetail.pointsDetail.recordingAttempts}회</p>
                <p className="mt-1 text-sm text-gray-500">전체 포인트의 {pointsDetail.pointsRate.recordingPointsRate}%</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-medium">퀴즈</h3>
                <p>
                  시도 포인트: {pointsDetail.pointsDetail.quizAttemptPoints}점 (시도 {pointsDetail.pointsDetail.quizAttempts}회)
                </p>
                <p>
                  정답 포인트: {pointsDetail.pointsDetail.quizCorrectPoints}점 (정답 {pointsDetail.pointsDetail.quizCorrect}개)
                </p>
                <p className="mt-1 text-sm text-gray-500">전체 포인트의 {pointsDetail.pointsRate.quizPointsRate}%</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-medium">출석</h3>
                <p>포인트: {pointsDetail.pointsDetail.attendancePoints}점</p>
                <p>출석 횟수: {pointsDetail.pointsDetail.attendanceCount}회</p>
                <p className="mt-1 text-sm text-gray-500">전체 포인트의 {pointsDetail.pointsRate.attendancePointsRate}%</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <h3 className="mb-2 font-medium">음성 좋아요</h3>
                <p>
                  내 발음 공개 포인트: {pointsDetail.pointsDetail.myVoiceOpenPoints}점 (받은 좋아요 {pointsDetail.pointsDetail.myVoiceOpenCount}개)
                </p>
                <p>
                  받은 좋아요 포인트: {pointsDetail.pointsDetail.voiceLikePoints}점 (받은 좋아요 {pointsDetail.pointsDetail.voiceLikesReceived}개)
                </p>
                <p>
                  준 좋아요 포인트: {pointsDetail.pointsDetail.userVoiceLikePoints}점 (준 좋아요 {pointsDetail.pointsDetail.userVoiceLikesGiven}개)
                </p>
                <p className="mt-1 text-sm text-gray-500">전체 포인트의 {pointsDetail.pointsRate.voiceLikePointsRate}%</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg bg-green-50 p-4 text-center">
              <p className="text-lg font-bold">총 포인트: {pointsDetail.totalPoints}점</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">포인트 상세 정보가 없습니다.</p>
        )}

        <div className="mt-6 text-right">
          <button onClick={onClose} className="rounded bg-gray-500 px-4 py-2 text-white hover:bg-gray-600">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
