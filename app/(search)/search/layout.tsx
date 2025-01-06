import { Metadata } from "next";

export const metadata: Metadata = {
  title: "niceketch - search",
  description: "niceketch.com",
};

export default function SearchLayout({
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
