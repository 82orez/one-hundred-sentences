export { default } from "next-auth/middleware";

// sign in 한 사용자만이 접근 가능한 페이지 설정
// 로그인을 하지 않은 상태에서 /server-side-page 경로로 접근하면 authOptions 에서 설정한 signIn page 로 라우트 됨.
// /:path*" 의 의미는 해당 경로의 모든 하위 경로를 포함한다는 의미.
export const config = { matcher: ["/todos", "/record-text-pronunciation", "/dashboard/:path*"] };
