import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = params;

    const course = await prisma.course.findUnique({
      where: { id },
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
    });

    if (!course) {
      return NextResponse.json(
        { error: '강좌를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json({ course });
  } catch (error) {
    console.error('강좌 조회 오류:', error);
    return NextResponse.json(
      { error: '강좌 조회에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = params;
    const data = await request.json();

    // 강좌 존재 여부 확인
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: '강좌를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    const updatedCourse = await prisma.course.update({
      where: { id },
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
      },
    });

    return NextResponse.json({ course: updatedCourse });
  } catch (error) {
    console.error('강좌 수정 오류:', error);
    return NextResponse.json(
      { error: '강좌 수정에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    const { id } = params;

    // 강좌 존재 여부 확인
    const existingCourse = await prisma.course.findUnique({
      where: { id },
    });

    if (!existingCourse) {
      return NextResponse.json(
        { error: '강좌를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 강좌 삭제 (관련 등록 정보, 수업 등은 cascade 설정에 따라 자동 삭제됨)
    await prisma.course.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('강좌 삭제 오류:', error);
    return NextResponse.json(
      { error: '강좌 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}