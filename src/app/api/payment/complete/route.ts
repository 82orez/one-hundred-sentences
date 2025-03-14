import { NextResponse } from "next/server";
import * as PortOne from "@portone/browser-sdk/v2";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get("paymentId");

    if (!paymentId) {
      return NextResponse.json({ error: "결제 ID가 필요합니다." }, { status: 400 });
    }

    // 1. 포트원 결제내역 단건조회 API 호출
    const paymentResponse = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `PortOne ${process.env.PORTONE_API_SECRET}` },
    });

    if (!paymentResponse.ok) throw new Error(`paymentResponse: ${await paymentResponse.json()}`);

    const payment = await paymentResponse.json();

    // * 결제 상태에 따라 주문 상태 업데이트하기
    if (payment.status === "PAID") {
      // 사용자 정보 가져오기
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json({ error: "인증되지 않은 사용자입니다." }, { status: 401 });
      }

      // 결제 정보를 데이터베이스에 저장
      const purchase = await prisma.purchase.create({
        data: {
          userId: session.user.id,
          paymentId: paymentId,
          orderName: payment.orderName,
          amount: payment.totalAmount ? parseInt(payment.totalAmount) : 0,
        },
      });

      return NextResponse.json({
        success: true,
        message: "결제가 성공적으로 완료되었습니다.",
        data: purchase,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: "결제가 완료되지 않았습니다.",
          status: payment.status,
        },
        { status: 400 },
      );
    }
  } catch (error) {
    console.error("결제 처리 중 오류 발생:", error);
    return NextResponse.json({ error: "결제 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
