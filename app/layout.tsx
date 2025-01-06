import ClientOnly from "@/components/ClientOnly";
import "../app/styles/globals.css";
import Footer from "@/components/Footer";
import RegisterModal from "@/components/modals/RegisterModal";
import LoginModal from "@/components/modals/LoginModal";
import ToasterProvider from "./providers/ToasterProvider";
import ResetPassword from "@/components/modals/ResetPasswordModal";
import { Providers } from "@/components/Provider";

import Chat from "@/components/Chat(Kim)/Chat";
import Alarm from "@/components/Alarm/Alarm";
import UploadModal from "@/components/modals/UploadModal";
import ImgModal from "@/components/ImgModal(kim)/ImgModal";

import NewNav from "@/components/NewNav(kim)/NewNav";
import MissionModal from "@/components/MissionModal(kim)/MissionModal";
import PostBoard from "@/components/Bulletin(Kim)/PostBoard";
import InitModal from "@/components/InitModal(kim)/InitModal";

import ImageUpload from "@/components/modals/ImageUpload";
import PortfolioUpload from "@/components/modals/PortfolioUpload";
import WriteUpload from "@/components/modals/WriteUpload";

export const metadata = {
  title: "niceketch",
  description: "niceketch.com",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kr">
      <body>
        <Providers>
          <ClientOnly>
            <ToasterProvider />
            <LoginModal />
            <UploadModal/>
            <MissionModal />
            <InitModal />
            <RegisterModal />

            <ImageUpload />
            <WriteUpload />
            <PortfolioUpload />

            <ResetPassword />
            <PostBoard />
            <ImgModal />
            <NewNav />
            <Chat />
            <Alarm />
            <div className="py-14">{children}</div>
            <Footer />
          </ClientOnly>
        </Providers>
      </body>
    </html>
  );
}
