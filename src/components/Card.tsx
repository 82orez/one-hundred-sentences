export function Card({ children, className }) {
  return <div className={`rounded-2xl bg-white p-6 text-gray-800 shadow-xl ${className}`}>{children}</div>;
}

export function CardContent({ children, className }) {
  return <div className={`text-center md:text-left ${className}`}>{children}</div>;
}
