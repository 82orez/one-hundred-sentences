// src/hooks/useAudioResources.ts
import { useEffect, useRef, useState } from 'react';

type AudioResourceOptions = {
  autoReleaseOnUnmount?: boolean;
};

export function useAudioResources(options: AudioResourceOptions = {}) {
  const { autoReleaseOnUnmount = true } = options;
  const [isAudioBusy, setIsAudioBusy] = useState(false);
  const activeStreamsRef = useRef<MediaStream[]>([]);
  const activeContextsRef = useRef<AudioContext[]>([]);
  
  // 모든 리소스 해제
  const releaseAllResources = async () => {
    // 1. 모든 활성 스트림 종료
    activeStreamsRef.current.forEach(stream => {
      stream.getTracks().forEach(track => {
        if (track.readyState === 'live') {
          track.stop();
        }
      });
    });
    activeStreamsRef.current = [];
    
    // 2. 모든 오디오 컨텍스트 종료
    const closePromises = activeContextsRef.current.map(context => {
      if (context.state !== 'closed') {
        return context.close().catch(e => console.error('오디오 컨텍스트 닫기 오류:', e));
      }
      return Promise.resolve();
    });
    
    await Promise.all(closePromises);
    activeContextsRef.current = [];
    
    // 3. SpeechRecognition 객체가 있다면 정리 시도
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || 
                               (window as any).webkitSpeechRecognition;
      if (SpeechRecognition && SpeechRecognition._instances) {
        SpeechRecognition._instances.forEach((instance: any) => {
          if (instance && typeof instance.abort === 'function') {
            instance.abort();
          }
        });
      }
    } catch (e) {
      console.error('SpeechRecognition 정리 오류:', e);
    }
    
    // 4. 모바일 장치에서 마이크 해제를 위한 추가 작업
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      tempStream.getTracks().forEach(track => track.stop());
    } catch (e) {
      console.error('마이크 강제 해제 오류:', e);
    }
    
    setIsAudioBusy(false);
  };
  
  // 새 미디어 스트림 요청 및 관리
  const requestMediaStream = async (constraints: MediaStreamConstraints) => {
    try {
      setIsAudioBusy(true);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      activeStreamsRef.current.push(stream);
      return stream;
    } catch (error) {
      console.error('미디어 스트림 요청 오류:', error);
      setIsAudioBusy(false);
      throw error;
    }
  };
  
  // 오디오 컨텍스트 생성 및 관리
  const createAudioContext = () => {
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    activeContextsRef.current.push(context);
    return context;
  };
  
  // 특정 스트림 해제
  const releaseStream = (stream: MediaStream) => {
    stream.getTracks().forEach(track => track.stop());
    activeStreamsRef.current = activeStreamsRef.current.filter(s => s !== stream);
    
    if (activeStreamsRef.current.length === 0 && activeContextsRef.current.length === 0) {
      setIsAudioBusy(false);
    }
  };
  
  // 특정 컨텍스트 해제
  const releaseContext = async (context: AudioContext) => {
    if (context.state !== 'closed') {
      await context.close().catch(e => console.error('오디오 컨텍스트 닫기 오류:', e));
    }
    
    activeContextsRef.current = activeContextsRef.current.filter(c => c !== context);
    
    if (activeStreamsRef.current.length === 0 && activeContextsRef.current.length === 0) {
      setIsAudioBusy(false);
    }
  };
  
  // 컴포넌트 언마운트 시 리소스 해제
  useEffect(() => {
    return () => {
      if (autoReleaseOnUnmount) {
        releaseAllResources();
      }
    };
  }, [autoReleaseOnUnmount]);
  
  return {
    isAudioBusy,
    requestMediaStream,
    createAudioContext,
    releaseStream,
    releaseContext,
    releaseAllResources,
  };
}