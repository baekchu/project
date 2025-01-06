import { Metadata } from "next";

export const metadata: Metadata = {
  title: "niceketch - news",
  description: "niceketch.com",
};

export default function NewsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <div>{children}</div>
    </div>
  );
}
