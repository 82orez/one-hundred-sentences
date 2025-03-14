import { NextResponse } from "next/server";
import * as PortOne from "@portone/browser-sdk/v2";

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
      // 주문 상태를 "PAYMENT_COMPLETED"로 업데이트합니다.
      // ...
    }
  } catch (error) {
    console.error("결제 처리 중 오류 발생:", error);
    return NextResponse.json({ error: "결제 처리 중 오류가 발생했습니다." }, { status: 500 });
  }
}
