import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * 특정 강좌를 수강하는 전체 학생들의 개별 포인트를 합산하여 반환하는 함수
 * @param courseId 강좌 ID
 * @returns 강좌에 속한 학생들의 총 포인트 합계
 */
export async function calculateTotalTeamPoints(courseId: string) {
  if (!courseId) {
    throw new Error("강좌 ID가 필요합니다.");
  }

  try {
    // 1. 해당 강좌에 등록된 모든 학생 조회
    const enrollments = await prisma.enrollment.findMany({
      where: {
        courseId: courseId,
        status: "active", // 활성 상태인 등록만 고려
      },
      select: {
        studentId: true,
      },
    });

    // 학생 ID 목록 추출
    const studentIds = enrollments.map((enrollment) => enrollment.studentId).filter((id): id is string => id !== null); // null 값 제거

    if (studentIds.length === 0) {
      return { totalTeamPoints: 0, studentCount: 0 };
    }

    // 2. 각 학생의 포인트 데이터 조회
    const pointsData = await Promise.all(
      studentIds.map(async (studentId) => {
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
        const quizAttemptsData = await prisma.quizAttempt.aggregate({
          where: {
            userId: studentId,
            courseId: courseId,
          },
          _sum: {
            attemptQuiz: true,
          },
        });
        const totalQuizAttempts = quizAttemptsData._sum.attemptQuiz || 0;

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

        const videoPoints = totalVideoDuration * VIDEO_POINT_PER_SECOND;
        const audioPoints = totalAudioAttempts * AUDIO_POINT_PER_ATTEMPT;
        const recordingPoints = totalRecordingAttempts * RECORDING_POINT_PER_ATTEMPT;
        const quizAttemptPoints = totalQuizAttempts * QUIZ_ATTEMPT_POINT;
        const quizCorrectPoints = totalQuizCorrect * QUIZ_CORRECT_POINT;
        const attendancePoints = attendanceData * ATTENDANCE_POINT;
        const voiceLikePoints = voiceLikesData * VOICE_LIKE_POINT;
        const userVoiceLikePoints = userLikesData * USER_VOICE_LIKE_POINT;

        const totalPoints = Math.round(
          videoPoints +
            audioPoints +
            recordingPoints +
            quizAttemptPoints +
            quizCorrectPoints +
            attendancePoints +
            voiceLikePoints +
            userVoiceLikePoints,
        );

        return totalPoints;
      }),
    );

    // 3. 모든 학생의 포인트 합산
    const totalTeamPoints = pointsData.reduce((sum, points) => sum + points, 0);

    return {
      totalTeamPoints,
      studentCount: studentIds.length,
    };
  } catch (error) {
    console.error("팀 포인트 계산 중 오류 발생:", error);
    throw new Error("팀 포인트 계산 중 오류가 발생했습니다.");
  }
}
