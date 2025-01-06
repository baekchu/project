"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';


import Container from "../Container";
import Logo from "./Logo";
import UserMenu from "./UserMenu";
import SearchBox from "./SearchBox";
import MenuContainer from "./MenuContainer";
import authState from "@/zustand/AuthState";
//import Dashboard from "../DashBoard/Dashboard";


const Navbar = () => {
  const [navBarClasses, setNavBarClasses] = useState("navBarOne");
  const [isTabFixed, setIsTabFixed] = useState(false);

  const addBgColor = () => {
    if (window.scrollY >= 10) {
      setNavBarClasses("navBarOne navbar_With_Bg");
    } else {
      setNavBarClasses("navBarOne");
    }

    // 스크롤 위치를 확인하여 탭을 고정 또는 해제합니다.
    if (window.scrollY >= 100) {
      setIsTabFixed(true);
    } else {
      setIsTabFixed(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", addBgColor);

    return () => {
      window.removeEventListener("scroll", addBgColor);
    };
  }, []);

  // 로그인 시 유저 정보 유무를 확인하여 없다면 입력창으로 이동
  const {isLoggedIn, user} = authState();
  const router = useRouter();
  useEffect(()=>{
    if (isLoggedIn && !user) {
      router.push("/init");
    }
  },[isLoggedIn, user]);

  return (
    <div className={`fixed z-[3] w-full bg-[#fffff3] ${navBarClasses}`}>
      <div className="py-4 border-b border-nav-border">
        <Container>
          <div className="flex flex-row items-center justify-between gap-3 md:gap-1">
            <Logo />
            <MenuContainer />
            <div className="flex items-center gap-3">
              <SearchBox />
              <UserMenu />
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Navbar;