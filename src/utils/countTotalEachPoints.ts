import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 특정 강좌의 특정 학생의 항목별 포인트와 합계를 계산하여 반환하는 함수
 * @param courseId 강좌 ID
 * @param studentId 학생 ID
 * @returns 학생의 항목별 포인트와 총합계
 */
export async function calculateStudentDetailPoints(courseId: string, studentId: string) {
  if (!courseId) {
    throw new Error("강좌 ID가 필요합니다.");
  }

  if (!studentId) {
    throw new Error("학생 ID가 필요합니다.");
  }

  try {
    // 해당 강좌에 학생이 등록되어 있는지 확인
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId: courseId,
          studentId: studentId,
        },
      },
    });

    if (!enrollment || enrollment.status !== "active") {
      throw new Error("해당 강좌에 등록된 활성 상태의 학생이 아닙니다.");
    }

    // 영상 시청 시간 조회
    const videoData = await prisma.youTubeViewAttempt.aggregate({
      where: {
        userId: studentId,
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
        userId: studentId,
        courseId: courseId,
      },
      _count: true,
    });
    const totalAudioAttempts = audioData._count;

    // 녹음 제출 횟수 조회
    const recordingsData = await prisma.recordings.aggregate({
      where: {
        userId: studentId,
        courseId: courseId,
      },
      _sum: {
        attemptCount: true,
      },
    });
    const totalRecordingAttempts = recordingsData._sum.attemptCount || 0;

    // 퀴즈 관련 데이터 조회
    const quizAttemptsData = await prisma.quizAttempt.count({
      where: {
        userId: studentId,
        courseId: courseId,
      },
    });

    const quizCorrectData = await prisma.quizAttempt.aggregate({
      where: {
        userId: studentId,
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
        userId: studentId,
        courseId: courseId,
      },
    });

    // 음성 좋아요 받은 수 조회
    const voiceLikesData = await prisma.voiceLike.count({
      where: {
        myVoiceOpenList: {
          userId: studentId,
          courseId: courseId,
        },
      },
    });

    // 다른 학생 음성에 좋아요 누른 수 조회
    const userLikesData = await prisma.voiceLike.count({
      where: {
        userId: studentId,
        myVoiceOpenList: {
          courseId: courseId,
        },
      },
    });

    // 포인트 계산 로직
    const VIDEO_POINT_PER_SECOND = 0.5;
    const AUDIO_POINT_PER_ATTEMPT = 1;
    const RECORDING_POINT_PER_ATTEMPT = 20;
    const QUIZ_ATTEMPT_POINT = 3;
    const QUIZ_CORRECT_POINT = 3;
    const ATTENDANCE_POINT = 50;
    const VOICE_LIKE_POINT = 100;
    const USER_VOICE_LIKE_POINT = 20;

    // 각 항목별 포인트 계산
    const videoPoints = totalVideoDuration * VIDEO_POINT_PER_SECOND;
    const audioPoints = totalAudioAttempts * AUDIO_POINT_PER_ATTEMPT;
    const recordingPoints = totalRecordingAttempts * RECORDING_POINT_PER_ATTEMPT;
    const quizAttemptPoints = quizAttemptsData * QUIZ_ATTEMPT_POINT;
    const quizCorrectPoints = totalQuizCorrect * QUIZ_CORRECT_POINT;
    const attendancePoints = attendanceData * ATTENDANCE_POINT;
    const voiceLikePoints = voiceLikesData * VOICE_LIKE_POINT;
    const userVoiceLikePoints = userLikesData * USER_VOICE_LIKE_POINT;

    // 총 포인트 계산
    const totalPoints = Math.round(
      videoPoints + audioPoints + recordingPoints + quizAttemptPoints + quizCorrectPoints + attendancePoints + voiceLikePoints + userVoiceLikePoints,
    );

    // 학생 정보 조회
    const student = await prisma.user.findUnique({
      where: {
        id: studentId,
      },
      select: {
        name: true,
        email: true,
        classNickName: true,
      },
    });

    // 결과 반환
    return {
      studentInfo: student,
      pointsDetail: {
        videoPoints: Math.round(videoPoints),
        videoSeconds: totalVideoDuration,
        audioPoints: Math.round(audioPoints),
        audioAttempts: totalAudioAttempts,
        recordingPoints: Math.round(recordingPoints),
        recordingAttempts: totalRecordingAttempts,
        quizAttemptPoints: Math.round(quizAttemptPoints),
        quizAttempts: quizAttemptsData,
        quizCorrectPoints: Math.round(quizCorrectPoints),
        quizCorrect: totalQuizCorrect,
        attendancePoints: Math.round(attendancePoints),
        attendanceCount: attendanceData,
        voiceLikePoints: Math.round(voiceLikePoints),
        voiceLikesReceived: voiceLikesData,
        userVoiceLikePoints: Math.round(userVoiceLikePoints),
        userVoiceLikesGiven: userLikesData,
      },
      totalPoints: totalPoints,
      pointsRate: {
        videoPointsRate: Math.round((videoPoints / totalPoints) * 100) || 0,
        audioPointsRate: Math.round((audioPoints / totalPoints) * 100) || 0,
        recordingPointsRate: Math.round((recordingPoints / totalPoints) * 100) || 0,
        quizPointsRate: Math.round(((quizAttemptPoints + quizCorrectPoints) / totalPoints) * 100) || 0,
        attendancePointsRate: Math.round((attendancePoints / totalPoints) * 100) || 0,
        voiceLikePointsRate: Math.round(((voiceLikePoints + userVoiceLikePoints) / totalPoints) * 100) || 0,
      },
    };
  } catch (error) {
    console.error("학생 포인트 계산 중 오류 발생:", error);
    throw new Error("학생 포인트 계산 중 오류가 발생했습니다.");
  }
}
