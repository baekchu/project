import React, { useCallback, useState, useEffect } from "react";
import { PiBellSimpleDuotone, PiEnvelopeDuotone } from "react-icons/pi";
import { GiHamburgerMenu } from "react-icons/gi";
import Avatar from "../Avatar";
import MenuItem from "../NewNav(kim)/MenuItem";
import useRegisterModal from "../hooks/useRegisterModal";
import useLoginModal from "../hooks/useLoginModal";
import { useRouter, usePathname } from "next/navigation";
import authState from "@/zustand/AuthState";
import useMessageState from "@/zustand/MessageState";
import useAlarmState from "@/zustand/AlarmState";

const UserMenu = () => {
  const loginModal = useLoginModal();
  const registerModal = useRegisterModal();
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, user, logout } = authState();
  const { ToggleChatOpen } = useMessageState();
  const {openAlarm} = useAlarmState();

  const toggleOpen = useCallback(() => {
    setIsOpen((value) => !value);
  }, []);

  const handleMenuItemClick = () => {
    toggleOpen();
  };

  // 로그인 되었으나 유저 정보가 없으면 입력 페이지로 이동
  const router = useRouter();
  useEffect(() => {
    if (isLoggedIn && !user) {
      router.push('/init');
    }
  }, [isLoggedIn, user]);


  return (
    <>
      <div className="relative">
        <div className="flex flex-row items-center xs:gap-3 gap-1">

          {/** 알림 버튼 */}
          <button
            className="block text-xl font-semibold py-2 px-2 rounded-full hover:bg-neutral-100 transition cursor-pointer text-primary-purple"
            onClick={() => {openAlarm()}}>
            <PiBellSimpleDuotone />
          </button>

          {/** 채팅 버튼 */}
          <button className="block text-[1.4rem] font-semibold py-2 px-2 rounded-full hover:bg-neutral-100 transition cursor-pointer text-primary-purple"
            onClick={() => { ToggleChatOpen() }}>
            <PiEnvelopeDuotone />
          </button>

          <div
            onClick={toggleOpen}
            className="xs:p-2 p-1 md:py-1 md:px-1.5 border-[2px] border-[#EFE7F5] flex flex-row items-center xs:gap-2 rounded-full cursor-pointer hover:shadow-md transition"
          >
            <div className="hidden md:block">
              <Avatar src={user?.profImg} />
            </div>
            <div className="text-primary-purple flex-row items-center text-xl">
              {isLoggedIn ? (
                <GiHamburgerMenu />
              ) : (
                <div className="text-primary-purple flex-row items-center xs:text-sm text-[5px] font-semibold ">
                  로그인
                </div>
              )}
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="z-[10] absolute rounded-xl shadow-md w-[140px] md:w-[100%] bg-[#ffffff94] backdrop-blur-[0.5rem] overflow-hidden right-0 top-18 text-sm">
            <div className="flex flex-col cursor-pointer">
              {isLoggedIn ? (
                <>
                  <MenuItem label="마이 페이지" onClick={() => { router.push(`/userPage${user?.uid?`?uid=${user.uid}`:""}`); setIsOpen(false); }} />
                  <MenuItem label="캘린더" onClick={() => { router.push('/calendar'); setIsOpen(false); }} />
                  <MenuItem label="미션" onClick={() => { router.push('/mission'); setIsOpen(false); }} />
                  <hr className="border-b-[0.5px] border-[#e8dbf2]" />
                  <MenuItem
                    label="로그아웃"
                    onClick={() => {
                      logout(); // Call the logout function from authState
                      handleMenuItemClick();
                    }}
                  />
                </>
              ) : (
                <>
                  <div className="text-red-500">
                    <MenuItem
                      label="회원가입"
                      onClick={() => {
                        registerModal.onOpen();
                        handleMenuItemClick();
                      }}
                    />
                  </div>
                  <MenuItem
                    label="로그인"
                    onClick={() => {
                      loginModal.onOpen();
                      handleMenuItemClick();
                    }}
                  />
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default UserMenu;