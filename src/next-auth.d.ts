import { Session } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string; // 새로 추가됨.
      name?: string;
      email?: string;
      image?: string;
    };
  }
}
