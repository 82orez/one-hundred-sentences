import { PrismaClient } from "@prisma/client";
import { calculateUserActivityPoints } from "./calculatePointsUtils";

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

    // 공통 유틸리티 함수를 사용하여 포인트 계산
    const { activities, points } = await calculateUserActivityPoints(studentId, courseId);

    const {
      totalVideoDuration,
      totalAudioAttempts,
      totalRecordingAttempts,
      totalQuizAttempts,
      totalQuizCorrect,
      attendanceData,
      voiceLikesData,
      userLikesData,
    } = activities;

    const {
      videoPoints,
      audioPoints,
      recordingPoints,
      quizAttemptPoints,
      quizCorrectPoints,
      attendancePoints,
      voiceLikePoints,
      userVoiceLikePoints,
      totalPoints,
    } = points;

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
        quizAttempts: totalQuizAttempts,
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
