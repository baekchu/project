import { Metadata } from "next";

export const metadata: Metadata = {
  title: "niceketch - userPage",
  description: "niceketch.com",
};

export default function UserPageLayout({
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
