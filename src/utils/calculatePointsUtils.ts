import { POINT_CONSTANTS } from "@/lib/pointConstants";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 사용자의 활동 데이터와 포인트를 계산하는 함수
 * @param userId 사용자 ID
 * @param courseId 강좌 ID
 * @returns 계산된 활동 데이터와 포인트
 */
export async function calculateUserActivityPoints(userId: string, courseId: string) {
  // 영상 시청 시간 조회
  const videoData = await prisma.youTubeViewAttempt.aggregate({
    where: {
      userId: userId,
      courseId: courseId,
    },
    _sum: {
      duration: true,
    },
  });
  const totalVideoDuration = videoData._sum.duration || 0;

  // 원어민 음성 듣기 횟수 조회
  const audioData = await prisma.nativeAudioAttempt.aggregate({
    where: {
      userId: userId,
      courseId: courseId,
    },
    _count: true,
  });
  const totalAudioAttempts = audioData._count;

  // 녹음 제출 횟수 조회
  const recordingsData = await prisma.recordings.aggregate({
    where: {
      userId: userId,
      courseId: courseId,
    },
    _sum: {
      attemptCount: true,
    },
  });
  const totalRecordingAttempts = recordingsData._sum.attemptCount || 0;

  // 퀴즈 관련 데이터 조회
  const quizAttemptsData = await prisma.quizAttempt.aggregate({
    where: {
      userId: userId,
      courseId: courseId,
    },
    _sum: {
      attemptQuiz: true,
    },
  });
  const totalQuizAttempts = quizAttemptsData._sum.attemptQuiz || 0;

  const quizCorrectData = await prisma.quizAttempt.aggregate({
    where: {
      userId: userId,
      courseId: courseId,
    },
    _sum: {
      correctCount: true,
    },
  });
  const totalQuizCorrect = quizCorrectData._sum.correctCount || 0;

  // 출석 정보 조회
  const attendanceData = await prisma.attendance.count({
    where: {
      userId: userId,
      courseId: courseId,
    },
  });

  // !  사용자가 공개한 음성 파일 갯수 조회
  const myVoiceOpenData = await prisma.myVoiceOpenList.count({
    where: {
      userId: userId,
      courseId: courseId,
    },
  });

  // 음성 좋아요 받은 수 조회
  const voiceLikesData = await prisma.voiceLike.count({
    where: {
      myVoiceOpenList: {
        userId: userId,
        courseId: courseId,
      },
    },
  });

  // 다른 학생 음성에 좋아요 누른 수 조회
  const userLikesData = await prisma.voiceLike.count({
    where: {
      userId: userId,
      myVoiceOpenList: {
        courseId: courseId,
      },
    },
  });

  // 각 항목별 포인트 계산
  const videoPoints = totalVideoDuration * POINT_CONSTANTS.VIDEO_POINT_PER_SECOND;
  const audioPoints = totalAudioAttempts * POINT_CONSTANTS.AUDIO_POINT_PER_ATTEMPT;
  const recordingPoints = totalRecordingAttempts * POINT_CONSTANTS.RECORDING_POINT_PER_ATTEMPT;
  const quizAttemptPoints = totalQuizAttempts * POINT_CONSTANTS.QUIZ_ATTEMPT_POINT;
  const quizCorrectPoints = totalQuizCorrect * POINT_CONSTANTS.QUIZ_CORRECT_POINT;
  const attendancePoints = attendanceData * POINT_CONSTANTS.ATTENDANCE_POINT;
  const myVoiceOpenPoints = myVoiceOpenData * POINT_CONSTANTS.MY_VOICE_OPEN_POINT;
  const voiceLikePoints = voiceLikesData * POINT_CONSTANTS.VOICE_LIKE_POINT;
  const userVoiceLikePoints = userLikesData * POINT_CONSTANTS.USER_VOICE_LIKE_POINT;

  // 총 포인트 계산
  const totalPoints = Math.round(
    videoPoints +
      audioPoints +
      recordingPoints +
      quizAttemptPoints +
      quizCorrectPoints +
      attendancePoints +
      myVoiceOpenPoints +
      voiceLikePoints +
      userVoiceLikePoints,
  );

  return {
    activities: {
      totalVideoDuration,
      totalAudioAttempts,
      totalRecordingAttempts,
      totalQuizAttempts,
      totalQuizCorrect,
      attendanceData,
      myVoiceOpenData,
      voiceLikesData,
      userLikesData,
    },
    points: {
      videoPoints,
      audioPoints,
      recordingPoints,
      quizAttemptPoints,
      quizCorrectPoints,
      attendancePoints,
      myVoiceOpenPoints,
      voiceLikePoints,
      userVoiceLikePoints,
      totalPoints,
    },
  };
}
