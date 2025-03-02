// app/blog/[id]/page.tsx
"use server";

import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

const BlogPostPage = async ({ params }: Props) => {
  const { id } = await params;

  const posts = {
    "1": { title: "Next.js App Router 이해하기", content: "Next.js App Router 는..." },
    "2": { title: "React Query 활용법", content: "React Query 를 사용하면..." },
  };

  const post = posts[id];

  if (!post) {
    return notFound(); // 존재하지 않는 ID일 경우 404 페이지로 이동
  }

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold">{post.title}</h1>
      <p className="mt-3">{post.content}</p>
    </div>
  );
};

export default BlogPostPage;
