import { Metadata } from "next";

export const metadata: Metadata = {
  title: "niceketch - bulletin",
  description: "niceketch.com",
};

export default function BulletinLayout({
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
