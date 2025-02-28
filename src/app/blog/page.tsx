import Link from "next/link";
import clsx from "clsx";

export default function BlogPage() {
  const posts = [
    { id: "1", title: "Next.js App Router 이해하기" },
    { id: "2", title: "React Query 활용법" },
  ];

  return (
    <div className="p-5">
      <h1 className="text-2xl font-bold">블로그 목록</h1>
      <ul className="mt-4 space-y-2">
        {posts.map((post) => (
          <li key={post.id}>
            <Link href={`/blog/${post.id}`} className="text-blue-500 underline">
              {post.title}
            </Link>
          </li>
        ))}
      </ul>

      <div className={clsx("mt-10 flex justify-center hover:underline", {})}>
        <Link href={"/"}>Back to Home</Link>
      </div>
    </div>
  );
}
