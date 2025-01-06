import { Metadata } from "next";
import UploadModal from "@/components/modals/UploadModal";


export const revalidate = 0;

export const metadata: Metadata = {
  title: "niceketch - canvas",
  description: "niceketch.com",
};

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="">
      <UploadModal/>
      <div>{children}</div>
    </div>
  );
}
