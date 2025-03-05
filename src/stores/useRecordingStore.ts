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

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.start();
      set({ isRecording: true });
      set({ isLoading: false });
    },
    stopRecording: () => {
      return new Promise((resolve) => {
        if (mediaRecorder) {
          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunks, { type: "audio/mp3" });
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
