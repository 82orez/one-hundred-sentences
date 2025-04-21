import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const courses = await prisma.course.findMany({
      include: {
        teacher: {
          select: {
            id: true,
            realName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ courses });
  } catch (error) {
    console.error("강좌 목록 조회 오류:", error);
    return NextResponse.json({ error: "강좌 목록을 불러오는데 실패했습니다." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const userId = session.user.id;
    const data = await request.json();

    const course = await prisma.course.create({
      data: {
        title: data.title,
        description: data.description,
        teacherId: data.teacherId,
        scheduleMonday: data.scheduleMonday,
        scheduleTuesday: data.scheduleTuesday,
        scheduleWednesday: data.scheduleWednesday,
        scheduleThursday: data.scheduleThursday,
        scheduleFriday: data.scheduleFriday,
        scheduleSaturday: data.scheduleSaturday,
        scheduleSunday: data.scheduleSunday,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        generatorId: userId, // userId를 generatorId로 직접 할당
      },
    });

    return NextResponse.json({ course }, { status: 201 });
  } catch (error) {
    console.error("강좌 생성 오류:", error);
    return NextResponse.json({ error: "강좌 생성에 실패했습니다." }, { status: 500 });
  }
}
