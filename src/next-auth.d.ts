import { Session } from "next-auth";

// Role enum 정의
enum Role {
  admin = "admin",
  semiAdmin = "semiAdmin",
  teacher = "teacher",
  student = "student",
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // 새로 추가됨.
      name?: string;
      email?: string;
      image?: string;
      role?: Role; // role 속성 추가
      realName: string;
      phone: string;
    };
  }
}
