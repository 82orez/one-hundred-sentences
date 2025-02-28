"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface Props {
  children?: React.ReactNode;
}

// 다른 컴포넌트에서도 사용할 수 있게 export 해준다.
export const queryClient = new QueryClient();

export const NextLayout = ({ children }: Props) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
