// app/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { Calendar, LucideBook, Award, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [completedDays, setCompletedDays] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    completedSentences: 0,
    totalSentences: 100,
    completedDays: 0,
    totalDays: 20,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    async function fetchDashboardData() {
      try {
        const { data } = await axios.get("/api/review/completed");
        setCompletedDays(data.completedDays || []);

        setStats({
          completedSentences: data.completedDays?.length * 5 || 0,
          totalSentences: 100,
          completedDays: data.completedDays?.length || 0,
          totalDays: 20,
        });

        setLoading(false);
      } catch (error) {
        console.error("대시보드 데이터 로딩 실패:", error);
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, [status, router]);

  const pieData = [
    { name: "완료", value: stats.completedSentences },
    { name: "미완료", value: stats.totalSentences - stats.completedSentences },
  ];

  const COLORS = ["#4ade80", "#e4e4e7"];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-gray-900"></div>
          <p className="mt-4">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-8 text-3xl font-bold">학생 대시보드</h1>

      {/* 학습 진행 상황 개요 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center">
            <LucideBook className="mr-2 h-6 w-6 text-blue-500" />
            <h2 className="text-xl font-semibold">학습 진행률</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">
                {stats.completedSentences}/{stats.totalSentences}
              </p>
              <p className="text-gray-500">완료한 문장</p>
            </div>
            <div className="h-20 w-20">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} innerRadius={24} outerRadius={35} paddingAngle={2} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-2">
            <p className="text-sm">
              전체 진행률: <span className="font-semibold">{Math.round((stats.completedSentences / stats.totalSentences) * 100)}%</span>
            </p>
            <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 rounded-full bg-blue-500" style={{ width: `${(stats.completedSentences / stats.totalSentences) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center">
            <Calendar className="mr-2 h-6 w-6 text-purple-500" />
            <h2 className="text-xl font-semibold">학습일 완료</h2>
          </div>
          <p className="text-3xl font-bold">
            {stats.completedDays}/{stats.totalDays}
          </p>
          <p className="text-gray-500">완료한 학습일</p>
          <div className="mt-2">
            <p className="text-sm">
              전체 진행률: <span className="font-semibold">{Math.round((stats.completedDays / stats.totalDays) * 100)}%</span>
            </p>
            <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
              <div className="h-2 rounded-full bg-purple-500" style={{ width: `${(stats.completedDays / stats.totalDays) * 100}%` }}></div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <div className="mb-4 flex items-center">
            <Award className="mr-2 h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold">학습 성취도</h2>
          </div>
          <div className="py-4 text-center">
            {stats.completedDays < 5 ? (
              <>
                <p className="text-xl font-medium">초보 학습자</p>
                <p className="mt-2 text-gray-500">5일 이상 완료하면 중급 학습자로 승급!</p>
              </>
            ) : stats.completedDays < 15 ? (
              <>
                <p className="text-xl font-medium">중급 학습자</p>
                <p className="mt-2 text-gray-500">15일 이상 완료하면 고급 학습자로 승급!</p>
              </>
            ) : (
              <>
                <p className="text-xl font-medium">고급 학습자</p>
                <p className="mt-2 text-gray-500">축하합니다! 최고 레벨에 도달했습니다.</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 최근 학습 현황 및 다음 학습일 추천 */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">학습 현황</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-5 gap-2">
              {Array.from({ length: 20 }, (_, i) => i + 1).map((day) => (
                <div
                  key={day}
                  className={`flex h-12 items-center justify-center rounded-md ${
                    completedDays.includes(day) ? "bg-green-500 text-white" : "bg-gray-100"
                  }`}>
                  {day}
                </div>
              ))}
            </div>
            <div className="flex space-x-4">
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-green-500"></div>
                <span className="text-sm">완료</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-4 w-4 rounded bg-gray-100"></div>
                <span className="text-sm">미완료</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-md">
          <h2 className="mb-4 text-xl font-semibold">다음 학습일 추천</h2>
          {completedDays.length === 20 ? (
            <div className="py-8 text-center">
              <p className="text-lg font-medium">모든 학습일을 완료했습니다!</p>
              <p className="mt-2 text-gray-500">축하합니다. 복습을 통해 실력을 다져보세요.</p>
            </div>
          ) : (
            <div>
              {(() => {
                // 미완료된 가장 첫 번째 학습일 찾기
                let nextDay = 1;
                while (completedDays.includes(nextDay) && nextDay <= 20) {
                  nextDay++;
                }

                return (
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="font-medium">추천 학습: {nextDay}일차</p>
                    <p className="mt-2 text-sm text-gray-600">체계적인 학습을 위해 {nextDay}일차 학습을 진행해보세요.</p>
                    <Link href={`/learn/${nextDay}`} className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-800">
                      지금 학습하기 <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                );
              })()}

              <div className="mt-6">
                <h3 className="mb-3 text-lg font-medium">최근 복습</h3>
                {completedDays.length > 0 ? (
                  <div className="space-y-2">
                    {completedDays
                      .slice(-3)
                      .reverse()
                      .map((day) => (
                        <Link key={day} href={`/review/${day}`} className="block rounded bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                          {day}일차 복습하기
                        </Link>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500">아직 완료한 학습일이 없습니다.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
