// components/ClassMembersModal.tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { X, Eye, User, ChevronUp, ChevronDown } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import clsx from "clsx";

interface ClassMember {
  id: string;
  displayName: string;
  profileImage: string | null;
  hasIntroduction: boolean;
  message: string | null;
  role?: string; // role 속성 추가
}

interface ClassMembersModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseTitle: string;
}

export default function ClassMembersModal({ isOpen, onClose, courseId, courseTitle }: ClassMembersModalProps) {
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  // const { status, data } = useSession();

  // 강좌 멤버 목록 조회 쿼리
  const { data: membersData, isLoading } = useQuery({
    queryKey: ["classMembers", courseId],
    queryFn: async () => {
      const response = await axios.get(`/api/class-members?courseId=${courseId}`);
      console.log("members: ", response.data.members);
      return response.data.members as ClassMember[];
    },
    enabled: isOpen, // 모달이 열려있을 때만 쿼리 실행
  });

  if (!isOpen) return null;

  const toggleIntroduction = (memberId: string) => {
    if (expandedMemberId === memberId) {
      setExpandedMemberId(null);
    } else {
      setExpandedMemberId(memberId);
    }
  };

  // courseId가 'freecoursetour' 가 아닌 경우, admin 역할의 멤버를 필터링
  // const filteredMembers = membersData?.filter((member) => {
  //   // freecoursetour인 경우 모든 멤버 표시
  //   if (courseId === "freecoursetour") {
  //     return true;
  //   }
  //   // 그 외의 경우 admin이 아닌 멤버만 표시
  //   return member.role !== "admin";
  // });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">
            우리 팀원들 <span className="text-gray-500">(총 {membersData?.length || 0}명)</span>
          </h2>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <h3 className="mb-4 font-medium text-gray-700">강좌: {courseTitle}</h3>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-indigo-600"></div>
          </div>
        ) : (
          <div className="grid max-h-[60vh] grid-cols-1 gap-4 overflow-y-auto md:grid-cols-2">
            {membersData?.map((member) => (
              <div key={member.id} className="rounded-lg border border-gray-200 p-4 transition hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-gray-200">
                    {member.profileImage ? (
                      <Image src={member.profileImage} alt={member.displayName} width={64} height={64} className="h-full w-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{member.displayName}</h4>
                    {member.hasIntroduction && (
                      <button
                        onClick={() => toggleIntroduction(member.id)}
                        className="mt-1 inline-flex items-center text-sm text-blue-600 hover:text-blue-800">
                        {expandedMemberId === member.id ? (
                          <>
                            <span>자기소개 접기</span>
                            <ChevronUp className="ml-2" size={18} />
                          </>
                        ) : (
                          <>
                            <span>자기소개 보기</span>
                            <ChevronDown className="ml-2" size={18} />
                          </>
                        )}{" "}
                      </button>
                    )}
                  </div>
                </div>

                {expandedMemberId === member.id && member.message && (
                  <div className="mt-3 rounded-md bg-gray-50 p-3 text-sm text-gray-700">{member.message}</div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button onClick={onClose} className="rounded bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300">
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
