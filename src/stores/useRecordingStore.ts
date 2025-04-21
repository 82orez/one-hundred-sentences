import { create } from "zustand";

type RecordingState = {
  isRecording: boolean;
  isLoading: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
};

export const useRecordingStore = create<RecordingState>((set) => {
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];
  let mediaStream: MediaStream | null = null;

  return {
    isRecording: false,
    isLoading: false,

    startRecording: async () => {
      set({ isLoading: true });

      try {
        // 이전 녹음 세션이 있다면 정리
        if (mediaStream) {
          mediaStream.getTracks().forEach(track => track.stop());
          mediaStream = null;
        }

        // 새 스트림 요청
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false // 명시적으로 video: false 설정
        });

        mediaStream = stream;
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        // 데이터 수집 이벤트 리스너
        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        // 오류 처리 리스너 추가
        mediaRecorder.onerror = (event) => {
          console.error("MediaRecorder 오류:", event);
          set({ isRecording: false, isLoading: false });
        };

        // 녹음 시작
        mediaRecorder.start();
        console.log("녹음 시작됨");
        set({ isRecording: true, isLoading: false });
      } catch (error) {
        console.error("녹음 시작 실패:", error);
        set({ isRecording: false, isLoading: false });
        alert("마이크 접근에 실패했습니다. 마이크 권한을 허용해주세요.");
      }
    },

    stopRecording: () => {
      return new Promise((resolve) => {
        if (!mediaRecorder || mediaRecorder.state === 'inactive') {
          console.log("녹음기가 활성화되지 않았습니다.");
          set({ isRecording: false });
          resolve(null);
          return;
        }

        mediaRecorder.onstop = () => {
          try {
            if (audioChunks.length === 0) {
              console.warn("녹음된 오디오 데이터가 없습니다.");
              set({ isRecording: false });
              resolve(null);
              return;
            }

            // 오디오 Blob 생성
            const audioBlob = new Blob(audioChunks, { type: "audio/mpeg" });
            console.log("녹음 완료, Blob 크기:", audioBlob.size);

            // 미디어 트랙 중지
            if (mediaStream) {
              mediaStream.getTracks().forEach(track => track.stop());
            }

            // 상태 변경 및 결과 반환
            mediaRecorder = null;
            mediaStream = null;
            set({ isRecording: false });
            resolve(audioBlob);
          } catch (error) {
            console.error("녹음 중지 처리 중 오류:", error);
            set({ isRecording: false });
            resolve(null);
          }
        };

        // 오류 처리 추가
        try {
          mediaRecorder.stop();
          console.log("녹음 중지 요청됨");
        } catch (error) {
          console.error("녹음 중지 중 오류:", error);
          set({ isRecording: false });
          resolve(null);
        }
      });
    },
  };
});