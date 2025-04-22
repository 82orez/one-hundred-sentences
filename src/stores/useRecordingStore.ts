import { create } from "zustand";

type RecordingState = {
  isRecording: boolean;
  isLoading: boolean;
  startRecording: () => void;
  stopRecording: () => Promise<Blob | null>;
};

export const useRecordingStore = create<RecordingState>((set) => {
  let mediaRecorder: MediaRecorder | null = null;
  let audioChunks: Blob[] = [];

  return {
    isRecording: false,
    isLoading: false,

    startRecording: async () => {
      set({ isLoading: true });

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];

        mediaRecorder.ondataavailable = (event) => {
          audioChunks.push(event.data);
        };

        mediaRecorder.start();
        set({ isRecording: true, isLoading: false });
      } catch (error) {
        console.error("Recording failed:", error);
        set({ isRecording: false, isLoading: false });
      }
    },

    stopRecording: () => {
      return new Promise((resolve) => {
        if (mediaRecorder) {
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });

            // ✅ 모든 트랙 명시적으로 중지
            if (mediaRecorder.stream) {
              mediaRecorder.stream.getTracks().forEach((track) => track.stop());
            }

            mediaRecorder = null; // 녹음기 초기화
            set({ isRecording: false });
            resolve(audioBlob);
          };
          mediaRecorder.stop();
        } else {
          resolve(null);
        }
      });
    },
  };
});
