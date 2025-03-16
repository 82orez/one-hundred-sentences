import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const paymentId = url.searchParams.get("paymentId");

    if (!paymentId) {
      // 결제 ID가 없는 경우 에러 페이지로 리디렉션
      return NextResponse.redirect(new URL("/payment-error?reason=no-payment-id", req.url));
    }

    // 1. 포트원 결제내역 단건조회 API 호출
    const paymentResponse = await fetch(`https://api.portone.io/payments/${encodeURIComponent(paymentId)}`, {
      headers: { Authorization: `PortOne ${process.env.PORTONE_API_SECRET}` },
    });

    if (!paymentResponse.ok) {
      // API 응답 오류시 에러 페이지로 리디렉션
      return NextResponse.redirect(new URL("/payment-error?reason=api-error", req.url));
    }

    const payment = await paymentResponse.json();

    // * 결제 상태에 따라 주문 상태 업데이트하기
    if (payment.status === "PAID") {
      // 사용자 정보 가져오기
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        // 인증되지 않은 사용자는 에러 페이지로 리디렉션
        return NextResponse.redirect(new URL("/payment-error?reason=unauthorized", req.url));
      }

      // * error 처리 과정 필요
      // 결제 정보를 데이터베이스에 저장
      try {
        const purchase = await prisma.purchase.create({
          data: {
            userId: session.user.id,
            paymentId: paymentId,
            orderName: payment.orderName,
            amount: payment.totalAmount ? parseInt(payment.totalAmount) : 0,
          },
        });

        // 결제 성공 및 DB 저장 성공 시 /learn 페이지로 리디렉션
        return NextResponse.redirect(new URL("/learn", req.url));
      } catch (dbError) {
        // DB 저장 실패 시 로그 기록
        console.error("결제 정보 DB 저장 중 오류:", dbError);

        // ! 이 부분에 관리자에게 알림을 보내는 로직을 추가할 수 있습니다 (예: 로그 시스템, 이메일 알림 등)

        // 사용자에게는 특별한 에러 페이지로 안내
        return NextResponse.redirect(new URL("/payment-partial-error?paymentId=" + paymentId, req.url));
      }
    } else {
      // 결제가 완료되지 않은 경우 에러 페이지로 리디렉션
      return NextResponse.redirect(new URL(`/payment-error?reason=payment-failed&status=${payment.status}`, req.url));
    }
  } catch (error) {
    console.error("결제 처리 중 오류 발생:", error);
    // 오류 발생 시 에러 페이지로 리디렉션
    return NextResponse.redirect(new URL("/payment-error?reason=server-error", req.url));
  }
}
