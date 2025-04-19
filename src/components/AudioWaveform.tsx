// src/components/AudioWaveform.tsx 개선 버전
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";

interface AudioWaveformProps {
  isActive: boolean;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ isActive }) => {
  const [levels, setLevels] = useState<number[]>(Array(8).fill(1));
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (isActive) {
      let audioContext: AudioContext | null = null;
      let analyser: AnalyserNode | null = null;
      let microphone: MediaStreamAudioSourceNode | null = null;

      // 마이크 접근 및 오디오 분석 설정
      navigator.mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then((stream) => {
          audioContext = new AudioContext();
          analyser = audioContext.createAnalyser();
          microphone = audioContext.createMediaStreamSource(stream);

          // 분석기 설정
          analyser.fftSize = 32;
          analyser.smoothingTimeConstant = 0.8;
          microphone.connect(analyser);

          // 분석 데이터용 배열 생성
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          dataArrayRef.current = dataArray;
          analyserRef.current = analyser;

          // 주기적으로 레벨 업데이트
          const updateLevels = () => {
            if (!analyser || !dataArray) return;

            analyser.getByteFrequencyData(dataArray);

            // 8개의 레벨로 리샘플링 (데이터 요약)
            const newLevels = Array(8)
              .fill(0)
              .map((_, i) => {
                const start = Math.floor((i * bufferLength) / 8);
                const end = Math.floor(((i + 1) * bufferLength) / 8);
                let sum = 0;
                for (let j = start; j < end; j++) {
                  sum += dataArray[j];
                }
                // 평균값을 1-10 범위로 정규화
                return Math.max(1, Math.min(10, Math.floor(sum / (end - start) / 25)));
              });

            setLevels(newLevels);
            animationRef.current = requestAnimationFrame(updateLevels);
          };

          animationRef.current = requestAnimationFrame(updateLevels);
        })
        .catch((err) => {
          console.error("마이크 접근 오류:", err);
          // 실패 시 가짜 애니메이션으로 폴백
          const interval = setInterval(() => {
            setLevels(Array.from({ length: 8 }, () => Math.floor(Math.random() * 10) + 1));
          }, 150);
          return () => clearInterval(interval);
        });

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (audioContext) {
          audioContext.close();
        }
      };
    } else {
      setLevels(Array(8).fill(1));
    }
  }, [isActive]);

  // 파형을 좌우대칭으로 생성
  const symmetricLevels = [...levels.slice().reverse(), ...levels];

  // 중앙으로 갈수록 높아지는 가중치 적용
  const getWeightedHeight = (level: number, index: number) => {
    const centerIndex = symmetricLevels.length / 2;
    const distanceFromCenter = Math.abs(index - centerIndex);
    const maxDistance = centerIndex;

    // 중앙에 가까울수록 가중치 증가
    const centerWeight = 1.5 - (distanceFromCenter / maxDistance) * 0.5;

    return level * centerWeight;
  };

  return (
    <div className="flex h-16 items-center justify-center gap-1">
      {symmetricLevels.map((level, index) => (
        <motion.div
          key={index}
          animate={{ height: `${getWeightedHeight(level, index) * 6}px` }}
          transition={{ duration: 0.1 }}
          className="w-1 rounded-full bg-white"
        />
      ))}
    </div>
  );
};

export default AudioWaveform;
