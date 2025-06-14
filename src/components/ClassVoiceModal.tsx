import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { useSession } from "next-auth/react";
import { createPortal } from "react-dom";
import { ImSpinner9 } from "react-icons/im";
import { FaRegThumbsUp, FaThumbsUp } from "react-icons/fa";
import { queryClient } from "@/app/providers";
import toast from "react-hot-toast";
import { useVoiceListenedStatus } from "@/hooks/useVoiceListenedStatus";
import clsx from "clsx";

type VoiceItem = {
  id: string;
  sentenceNo: number;
  sentenceEn: string;
  myVoiceUrl: string;
  userId: string;
  likeCount: number;
  user: {
    name: string;
    realName: string;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCriterion, setSearchCriterion] = useState<"sentenceNo" | "sentenceEn" | "nickname">("sentenceNo");
  const [sortKey, setSortKey] = useState<"sentenceNo" | "nickname" | "listened" | "likes">("sentenceNo");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [showMobileSearchSort, setShowMobileSearchSort] = useState(false);

  const { data: session } = useSession();
  const modalRef = useRef<HTMLDivElement>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentAudioUrl, setCurrentAudioUrl] = useState<string | null>(null);

  // 음성 파일 ID 목록 추출
  const voiceIds = voiceList.map((item) => item.id);

  // 음성 파일 청취 상태 훅 사용
  const { listenedStatus, markAsListened } = useVoiceListenedStatus(voiceIds);

  useEffect(() => {
    if (isOpen && courseId) {
      fetchVoiceList();
    }

    // 모달 외부 클릭 시 닫기 기능
    // const handleOutsideClick = (e: MouseEvent) => {
    //   if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
    //     closeModal();
    //   }
    // };
    //
    // if (isOpen) {
    //   document.addEventListener("mousedown", handleOutsideClick);
    //   // 모달 열릴 때 스크롤 방지
    //   document.body.style.overflow = "hidden";
    // }
    //
    // return () => {
    //   document.removeEventListener("mousedown", handleOutsideClick);
    //   // 모달 닫힐 때 스크롤 복원
    //   document.body.style.overflow = "";
    // };
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

    // 해당 음성의 작성자 ID 찾기
    const voiceItem = voiceList.find((item) => item.id === voiceId);
    if (!voiceItem) return;

    // 자신의 음성인지 확인
    const isOwnVoice = voiceItem.userId === session.user.id;

    // 자신의 음성에 좋아요를 시도할 경우 알림 (선택적)
    if (isOwnVoice) {
      toast.error("자신의 음성에는 좋아요를 누를 수 없습니다.");
      return;
    }

    // 청취하지 않은 음성일 경우 금지
    if (!listenedStatus[voiceId]) {
      toast.error("먼저 음성을 들어야 좋아요를 누를 수 있습니다.");
      return;
    }

    try {
      setLikePending((prev) => ({ ...prev, [voiceId]: true }));

      // 낙관적 UI 업데이트 - 서버 응답 전에 먼저 UI 업데이트
      const currentLiked = userLikes[voiceId] || false;

      // 즉시 UI 업데이트
      setUserLikes((prev) => ({
        ...prev,
        [voiceId]: !currentLiked,
      }));

      // 좋아요 카운트도 즉시 업데이트
      setVoiceList((prev) =>
        prev.map((item) => {
          if (item.id === voiceId) {
            return {
              ...item,
              likeCount: !currentLiked ? item.likeCount + 1 : item.likeCount - 1,
            };
          }
          return item;
        }),
      );

      // 서버에 API 요청
      const response = await axios.post("/api/voice/like", { voiceId });

      // 서버 응답과 예상 결과가 다르면 롤백 (드물게 발생)
      if (response.data.liked !== !currentLiked) {
        // 상태 롤백
        setUserLikes((prev) => ({
          ...prev,
          [voiceId]: response.data.liked,
        }));

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
      }
    } catch (error) {
      console.error("좋아요 처리 중 오류가 발생했습니다:", error);
      // 오류 발생 시 원래 상태로 복원
      setUserLikes((prev) => ({
        ...prev,
        [voiceId]: userLikes[voiceId] || false,
      }));

      // 좋아요 카운트도 복원
      setVoiceList((prev) =>
        prev.map((item) => {
          if (item.id === voiceId) {
            const originalLiked = userLikes[voiceId] || false;
            return {
              ...item,
              likeCount: originalLiked ? item.likeCount : item.likeCount,
            };
          }
          return item;
        }),
      );
    } finally {
      setLikePending((prev) => ({ ...prev, [voiceId]: false }));
    }
  };

  // closeModal 이벤트 핸들러에 쿼리 무효화 추가
  const handleCloseModal = () => {
    // 모달 닫을 때 쿼리 무효화
    queryClient.invalidateQueries({ queryKey: ["voiceLikes"] });
    queryClient.invalidateQueries({ queryKey: ["userVoiceLikes"] });
    queryClient.invalidateQueries({ queryKey: ["voiceListened"] });
    queryClient.invalidateQueries({ queryKey: ["unlistenedVoice"] });

    setSearchTerm("");

    closeModal();
  };

  // 사용자 프로필 이미지 URL 가져오기
  const getUserImage = (user: VoiceItem["user"]) => {
    if (user.customImageUrl) return user.customImageUrl;
    if (user.image) return user.image;
    return "/images/anon-user-1.jpg"; // 기본 이미지
  };

  // 사용자 표시 이름 가져오기
  const getUserDisplayName = (user: VoiceItem["user"]) => {
    return user.classNickName || user.realName || "익명";
  };

  const handlePlay = async (url: string, voiceId: string) => {
    // 이미 재생 중인 경우 다른 파일 재생 금지
    if (currentAudioUrl && currentAudioUrl !== url) {
      toast.error("다른 음성이 재생 중입니다. 먼저 재생 중인 음성을 멈춰주세요.");
      return;
    }

    // 같은 오디오를 다시 누르면 무시
    if (currentAudioUrl === url) return;

    // 이전 오디오 정지
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(url);
    audioRef.current = audio;
    setCurrentAudioUrl(url);

    audio.onended = () => {
      setCurrentAudioUrl(null);
      if (session?.user) {
        markAsListened(voiceId);
      }
    };

    audio.play().catch((err) => {
      console.error("오디오 재생 실패:", err);
      setCurrentAudioUrl(null);
    });
  };

  // 청취 상태 표시 렌더링 함수
  const renderListenedStatus = (voiceId: string) => {
    if (!session?.user) return null;

    const voiceItem = voiceList.find((item) => item.id === voiceId);
    if (!voiceItem) return null;

    // 자신의 음성인 경우 무조건 체크 표시
    if (voiceItem.userId === session.user.id) {
      return (
        <div className="ml-2 flex items-center justify-center text-sm text-gray-500">
          <span className="font-bold text-gray-500">🗸</span>
        </div>
      );
    }

    return (
      <div className="ml-2 flex items-center justify-center text-sm text-gray-500">
        {listenedStatus[voiceId] ? <span className="font-bold text-green-500">🗸</span> : <span>-</span>}
      </div>
    );
  };

  const isUnlistenedAndNotMine = (voice: VoiceItem) => {
    if (!session?.user) return false;
    return voice.userId !== session.user.id && !listenedStatus[voice.id];
  };

  const sortedVoiceList = [...voiceList]
    .filter((item) => {
      const term = searchTerm.toLowerCase();
      if (searchCriterion === "sentenceNo") return item.sentenceNo.toString().includes(term);
      if (searchCriterion === "sentenceEn") return item.sentenceEn.toLowerCase().includes(term);
      if (searchCriterion === "nickname") return getUserDisplayName(item.user).toLowerCase().includes(term);
      return true;
    })
    .sort((a, b) => {
      // 먼저 듣지 않은 음성 파일을 최상단에 배치
      const aUnlistened = isUnlistenedAndNotMine(a);
      const bUnlistened = isUnlistenedAndNotMine(b);

      if (aUnlistened && !bUnlistened) return -1;
      if (!aUnlistened && bUnlistened) return 1;

      // 그 다음 선택된 정렬 기준에 따라 정렬
      const multiplier = sortOrder === "asc" ? 1 : -1;

      if (sortKey === "sentenceNo") {
        return (a.sentenceNo - b.sentenceNo) * multiplier;
      }

      if (sortKey === "nickname") {
        return getUserDisplayName(a.user).localeCompare(getUserDisplayName(b.user)) * multiplier;
      }

      if (sortKey === "likes") {
        return (a.likeCount - b.likeCount) * multiplier;
      }

      if (sortKey === "listened") {
        const aListened = session?.user?.id === a.userId ? true : listenedStatus[a.id];
        const bListened = session?.user?.id === b.userId ? true : listenedStatus[b.id];
        return (Number(aListened) - Number(bListened)) * multiplier;
      }

      return 0;
    });

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
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
          <button onClick={handleCloseModal} className="rounded-full p-1 transition-colors hover:bg-gray-200" aria-label="닫기">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex gap-2 md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <label htmlFor="searchCriterion" className="hidden text-sm text-gray-600 md:block">
              검색 기준:
            </label>
            <select
              id="searchCriterion"
              value={searchCriterion}
              onChange={(e) => setSearchCriterion(e.target.value as "sentenceNo" | "sentenceEn" | "nickname")}
              className="rounded border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none">
              <option value="sentenceNo">문장 번호</option>
              <option value="sentenceEn">Script</option>
              <option value="nickname">팀원명</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none md:max-w-sm"
          />
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
                    <th onClick={() => handleSort("sentenceNo")} className="cursor-pointer p-2">
                      NO. {sortKey === "sentenceNo" && (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th onClick={() => handleSort("sentenceNo")} className="cursor-pointer p-2">
                      Script
                    </th>
                    <th onClick={() => handleSort("nickname")} className="cursor-pointer">
                      팀원명 {sortKey === "nickname" && (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th onClick={() => handleSort("listened")} className="cursor-pointer">
                      듣기 {sortKey === "listened" && (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                    <th onClick={() => handleSort("likes")} className="cursor-pointer">
                      좋아요 {sortKey === "likes" && (sortOrder === "asc" ? "▲" : "▼")}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedVoiceList.map((item) => (
                    <tr
                      key={item.id}
                      className={clsx("hover:bg-gray-50", isUnlistenedAndNotMine(item) && "font-bold", {
                        "bg-green-100 hover:bg-green-200": isUnlistenedAndNotMine(item),
                      })}>
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
                        <div className="flex items-center">
                          <button
                            onClick={() => handlePlay(item.myVoiceUrl, item.id)}
                            disabled={currentAudioUrl === item.myVoiceUrl}
                            className="flex h-[28px] cursor-pointer items-center justify-center rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
                            {currentAudioUrl === item.myVoiceUrl ? <ImSpinner9 className="animate-spin" /> : "▶"}
                          </button>
                          {renderListenedStatus(item.id)}
                        </div>
                      </td>
                      <td className="px-2 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => handleLikeToggle(item.id)}
                            disabled={likePending[item.id]}
                            className="cursor-pointer text-blue-500 hover:text-blue-700">
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
              {/* 모바일 전용: 검색 및 정렬 토글 버튼 */}
              <div className="mb-4 block md:hidden">
                <button
                  onClick={() => setShowMobileSearchSort((prev) => !prev)}
                  className="w-full rounded border border-gray-300 px-4 py-2 text-sm font-medium shadow-sm hover:bg-gray-100">
                  {showMobileSearchSort ? "🔼 정렬 기능 숨기기" : "🔽 정렬 기능 보기"}
                </button>
              </div>

              {showMobileSearchSort && (
                <div className="mb-4 flex flex-col gap-2 md:hidden">
                  <div className="flex items-center gap-2">
                    <label htmlFor="sortKey" className="text-sm text-gray-600">
                      정렬 기준:
                    </label>
                    <select
                      id="sortKey"
                      value={sortKey}
                      onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
                      className="rounded border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none">
                      <option value="sentenceNo">문장 번호</option>
                      <option value="nickname">팀원명</option>
                      <option value="listened">청취 여부</option>
                      <option value="likes">좋아요</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="sortOrder" className="text-sm text-gray-600">
                      정렬 방향:
                    </label>
                    <select
                      id="sortOrder"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value as typeof sortOrder)}
                      className="rounded border border-gray-300 px-2 py-1 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none">
                      <option value="asc">오름차순 ▲</option>
                      <option value="desc">내림차순 ▼</option>
                    </select>
                  </div>
                </div>
              )}

              {sortedVoiceList.map((item) => (
                <div
                  key={item.id}
                  className={clsx(
                    "rounded-lg border p-4 shadow-sm",
                    isUnlistenedAndNotMine(item) && "font-bold",

                    { "bg-green-100": isUnlistenedAndNotMine(item) },
                  )}>
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
                    <div className="flex items-center">
                      <button
                        onClick={() => handlePlay(item.myVoiceUrl, item.id)}
                        disabled={currentAudioUrl === item.myVoiceUrl}
                        className="flex h-8 w-[68px] items-center justify-center rounded bg-blue-500 px-3 py-1 text-sm text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60">
                        {currentAudioUrl === item.myVoiceUrl ? <ImSpinner9 className="animate-spin" /> : <div>▶ 듣기</div>}
                      </button>
                      {renderListenedStatus(item.id)}
                    </div>
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
