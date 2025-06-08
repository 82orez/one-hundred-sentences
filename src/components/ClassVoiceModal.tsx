// components/ClassVoiceModal.tsx
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useSession } from "next-auth/react";
import { createPortal } from "react-dom";
import { ImSpinner9 } from "react-icons/im";

type VoiceItem = {
  id: string;
  sentenceNo: number; // int를 number로 수정했습니다
  sentenceEn: string;
  myVoiceUrl: string;
  userId: string;
  user: {
    name: string;
    classNickName: string;
    image: string;
    customImageUrl: string;
  };
};

export default function ClassVoiceModal({ isOpen, closeModal, courseId }: { isOpen: boolean; closeModal: () => void; courseId: string }) {
  const [voiceList, setVoiceList] = useState<VoiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();
  const modalRef = useRef<HTMLDivElement>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchVoiceList();
    }

    // 모달 외부 클릭 시 닫기 기능
    const handleOutsideClick = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      // 모달 열릴 때 스크롤 방지
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      // 모달 닫힐 때 스크롤 복원
      document.body.style.overflow = "";
    };
  }, [isOpen, courseId, closeModal]);

  const fetchVoiceList = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/voice/open-list?courseId=${courseId}`);
      setVoiceList(response.data);
    } catch (error) {
      console.error("음성 파일 목록을 가져오는데 실패했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자 프로필 이미지 URL 가져오기
  const getUserImage = (user: VoiceItem["user"]) => {
    if (user.customImageUrl) return user.customImageUrl;
    if (user.image) return user.image;
    return "/images/default-avatar.png"; // 기본 이미지
  };

  // 사용자 표시 이름 가져오기
  const getUserDisplayName = (user: VoiceItem["user"]) => {
    return user.classNickName || user.name || "익명";
  };

  const handlePlay = (url: string) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setCurrentAudioUrl(url);

    // ✅ 재생이 끝나면 상태 초기화
    audio.onended = () => {
      setCurrentAudioUrl(null);
    };

    audio.play().catch((err) => {
      console.error("오디오 재생 실패:", err);
      setCurrentAudioUrl(null); // 재생 실패 시에도 상태 초기화
    });
  };

  if (!isOpen) return null;

  // createPortal을 사용하여 모달을 body에 직접 렌더링
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 백그라운드 오버레이 */}
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />

      {/* 모달 패널 */}
      <div
        ref={modalRef}
        className="relative z-10 mx-auto w-full max-w-2xl rounded-lg bg-white p-6"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title">
        <div className="mb-6 flex items-center justify-between">
          <h2 id="modal-title" className="text-lg font-medium">
            우리 팀원들의 발음 듣기
          </h2>
          <button onClick={closeModal} className="rounded-full p-1 transition-colors hover:bg-gray-200" aria-label="닫기">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-700"></div>
          </div>
        ) : voiceList.length === 0 ? (
          <div className="py-8 text-center text-gray-500">공개된 녹음 파일이 없습니다.</div>
        ) : (
          <div className="max-h-[70vh] overflow-y-auto pr-2">
            <table className="w-full">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  <th className="w-12 px-2 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">번호</th>
                  <th className="px-2 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">영어 문장</th>
                  <th className="w-14 px-2 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">팀원명</th>
                  <th className="w-20 px-2 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">듣기</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {voiceList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-2 py-3 text-sm whitespace-nowrap text-gray-500">{item.sentenceNo}</td>
                    <td className="px-2 py-3 text-sm">{item.sentenceEn}</td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full">
                          <Image
                            src={getUserImage(item.user)}
                            alt={getUserDisplayName(item.user)}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="ml-2 text-xs">{getUserDisplayName(item.user)}</div>
                      </div>
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      <button
                        onClick={() => handlePlay(item.myVoiceUrl)}
                        disabled={currentAudioUrl === item.myVoiceUrl} // 같은 파일 중복 재생 방지
                        className="flex items-center justify-center rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
                        {currentAudioUrl === item.myVoiceUrl ? <ImSpinner9 className="animate-spin" /> : "▶"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
