import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useSession } from "next-auth/react";
import { createPortal } from "react-dom";
import { ImSpinner9 } from "react-icons/im";
import { FaRegThumbsUp, FaThumbsUp } from "react-icons/fa";
import { queryClient } from "@/app/providers";

type VoiceItem = {
  id: string;
  sentenceNo: number;
  sentenceEn: string;
  myVoiceUrl: string;
  userId: string;
  likeCount: number; // 좋아요 개수 필드 추가
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
  const [userLikes, setUserLikes] = useState<Record<string, boolean>>({});
  const [likePending, setLikePending] = useState<Record<string, boolean>>({});
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

      // 로그인 상태인 경우 좋아요 상태 가져오기
      if (session?.user) {
        fetchUserLikes(response.data);
      }
    } catch (error) {
      console.error("음성 파일 목록을 가져오는데 실패했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 사용자의 좋아요 상태 가져오기
  const fetchUserLikes = async (voices: VoiceItem[]) => {
    try {
      const likes: Record<string, boolean> = {};

      // 각 음성 파일에 대한 좋아요 상태 확인
      await Promise.all(
        voices.map(async (voice) => {
          const response = await axios.get(`/api/voice/like?voiceId=${voice.id}`);
          likes[voice.id] = response.data.liked;
        }),
      );

      setUserLikes(likes);
    } catch (error) {
      console.error("좋아요 상태를 가져오는데 실패했습니다:", error);
    }
  };

  // 좋아요 토글 처리
  const handleLikeToggle = async (voiceId: string) => {
    // 로그인 확인
    if (!session?.user) {
      alert("로그인 후 이용해주세요.");
      return;
    }

    // 중복 요청 방지
    if (likePending[voiceId]) return;

    try {
      setLikePending((prev) => ({ ...prev, [voiceId]: true }));

      const response = await axios.post("/api/voice/like", { voiceId });

      // 좋아요 상태 업데이트
      setUserLikes((prev) => ({
        ...prev,
        [voiceId]: response.data.liked,
      }));

      // 좋아요 카운트 업데이트
      setVoiceList((prev) =>
        prev.map((item) => {
          if (item.id === voiceId) {
            return {
              ...item,
              likeCount: response.data.liked ? item.likeCount + 1 : item.likeCount - 1,
            };
          }
          return item;
        }),
      );

      queryClient.invalidateQueries({ queryKey: ["voiceLikes"] });
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다:", error);
    } finally {
      setLikePending((prev) => ({ ...prev, [voiceId]: false }));
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
          <>
            {/* ✅ 데스크탑 전용 테이블 */}
            <div className="hidden max-h-[70vh] overflow-y-auto pr-2 md:block">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-gray-50">
                  <tr>
                    <th className="w-12 px-2 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase">번호</th>
                    <th className="px-2 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase">영어 문장</th>
                    <th className="w-14 px-2 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase">팀원명</th>
                    <th className="w-20 px-2 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase">듣기</th>
                    <th className="w-20 px-2 py-3 text-left text-sm font-medium tracking-wider text-gray-500 uppercase">좋아요</th>
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
                          <div className="ml-2 text-sm">{getUserDisplayName(item.user)}</div>
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <button
                          onClick={() => handlePlay(item.myVoiceUrl)}
                          disabled={currentAudioUrl === item.myVoiceUrl}
                          className="flex h-[28px] items-center justify-center rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
                          {currentAudioUrl === item.myVoiceUrl ? <ImSpinner9 className="animate-spin" /> : "▶"}
                        </button>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleLikeToggle(item.id)}
                            disabled={likePending[item.id]}
                            className="text-blue-500 hover:text-blue-700">
                            {likePending[item.id] ? (
                              <ImSpinner9 className="h-5 w-5 animate-spin" />
                            ) : userLikes[item.id] ? (
                              <FaThumbsUp className="h-5 w-5" />
                            ) : (
                              <FaRegThumbsUp className="h-5 w-5" />
                            )}
                          </button>
                          <span className="ml-2 text-sm text-gray-600">{item.likeCount || 0}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ 모바일 전용 카드형 */}
            <div className="block max-h-[70vh] space-y-4 overflow-y-auto pr-1 md:hidden">
              {voiceList.map((item) => (
                <div key={item.id} className="rounded-lg border bg-white p-4 shadow-sm">
                  <div className="mb-1 text-sm text-gray-500">문장 번호: {item.sentenceNo}</div>
                  <div className="mb-2 font-semibold text-gray-800">{item.sentenceEn}</div>
                  <div className="mb-2 flex items-center gap-2">
                    <Image
                      src={getUserImage(item.user)}
                      alt={getUserDisplayName(item.user)}
                      width={32}
                      height={32}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="text-sm">{getUserDisplayName(item.user)}</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => handlePlay(item.myVoiceUrl)}
                      disabled={currentAudioUrl === item.myVoiceUrl}
                      className="flex h-8 w-[68px] items-center justify-center rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
                      {currentAudioUrl === item.myVoiceUrl ? <ImSpinner9 className="animate-spin" /> : <div>▶ 듣기</div>}
                    </button>
                    <div className="flex items-center">
                      <button onClick={() => handleLikeToggle(item.id)} disabled={likePending[item.id]} className="text-blue-500 hover:text-blue-700">
                        {likePending[item.id] ? (
                          <ImSpinner9 className="h-5 w-5 animate-spin" />
                        ) : userLikes[item.id] ? (
                          <FaThumbsUp className="h-5 w-5" />
                        ) : (
                          <FaRegThumbsUp className="h-5 w-5" />
                        )}
                      </button>
                      <span className="ml-2 text-sm text-gray-600">{item.likeCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}
