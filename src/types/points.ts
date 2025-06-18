export type PointsDetail = {
  videoPoints: number;
  videoSeconds: number;
  audioPoints: number;
  audioAttempts: number;
  recordingPoints: number;
  recordingAttempts: number;
  quizAttemptPoints: number;
  quizAttempts: number;
  quizCorrectPoints: number;
  quizCorrect: number;
  attendancePoints: number;
  attendanceCount: number;
  voiceLikePoints: number;
  voiceLikesReceived: number;
  userVoiceLikePoints: number;
  userVoiceLikesGiven: number;
  myVoiceOpenPoints: number;
  myVoiceOpenCount: number;
};

export type PointsRate = {
  videoPointsRate: number;
  audioPointsRate: number;
  recordingPointsRate: number;
  quizPointsRate: number;
  attendancePointsRate: number;
  voiceLikePointsRate: number;
};

export type PointsDetailResponse = {
  studentInfo: {
    name: string;
    email: string;
    classNickName: string;
  };
  pointsDetail: PointsDetail;
  totalPoints: number;
  pointsRate: PointsRate;
};
