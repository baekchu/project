"use client"

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";

import MenuItem from "./MenuItem";
import useRegisterModal from "../hooks/useRegisterModal";
import useLoginModal from "../hooks/useLoginModal";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "@/config/firebase";
import useMessageState from "@/zustand/MessageState";
import useAlarmState from "@/zustand/AlarmState";
import SearchFloat from "./SearchFloat";
import Image from "next/image";
import useInitState from "@/zustand/InitState";
import { updateMissionProgress } from '@/components/utility/MissionModule';

import { MdMailOutline, MdOutlineChromeReaderMode } from "react-icons/md";
import { FaPlus } from "react-icons/fa6";
import { BiSearchAlt2 } from "react-icons/bi";
import { MdOutlineHome, MdLogin } from "react-icons/md";
import { GiHamburgerMenu } from "react-icons/gi";
import { AiOutlineNotification } from "react-icons/ai";
import { FUserData, getUserData } from "../utility/UserDataModule";
import AlarmButton from "./AlarmButton";
import usePostState from "@/zustand/PostState";
import useImgState from "@/zustand/ImgState";
import useImgUploadState from "@/zustand/ImgUploadState";
import usePortfolioUploadState from "@/zustand/PortfolioUploadState";

const NewNav = () => {
    const {setInitModalOpen} = useInitState();
    const {setIsImgUploadOpen} = useImgUploadState();
    const {setIsPostUploadOpen} = usePortfolioUploadState();

    const [user, setUser] = useState<FUserData>();
    const fetchU = async () => {
        if (auth.currentUser?.uid) {
            const u = await getUserData(auth.currentUser?.uid);
            setUser(u);
            if (u.uid === "") {
                setInitModalOpen(true);
            } else {
                updateMissionProgress(auth.currentUser?.uid, "daily", 0);
            }
        }
    };

    const logoutAct = async () => {
        await auth.signOut();
        window.location.reload();
    };

    useEffect(() => {
        fetchU();
    }, [auth.currentUser]);

    const router = useRouter();
    const pathname = usePathname();
    const { ToggleChatOpen } = useMessageState();
    const loginModal = useLoginModal();
    const registerModal = useRegisterModal();
    const { setIsMissionOpen } = useAlarmState();

    enum NavSize { xs, sm, md, lg };
    const [navSize, setNavSize] = useState<NavSize>(NavSize.lg);
    const getNavSize = () => {
        if (window.innerWidth <= 400) {
            setNavSize(NavSize.xs);
        } else if (window.innerWidth <= 768) {
            setNavSize(NavSize.sm);
        } else if (window.innerWidth <= 900) {
            setNavSize(NavSize.md);
        } else {
            setNavSize(NavSize.lg);
        }
    };

    useEffect(() => {
        getNavSize();
        window.addEventListener("resize", getNavSize);
        return () => {
            window.removeEventListener("resize", getNavSize);
        };
    }, []);

    const underLinks = [
        { href: '/', key: '캔버스', text: '캔버스', icon: <MdOutlineHome /> },
        { href: '/bulletin', key: '게시판', text: '게시판', icon: <MdOutlineChromeReaderMode /> },
        { href: '/', key: '', text: '', icon: <></> },
        { href: '/news', key: '새소식', text: '새소식', icon: <AiOutlineNotification /> },
        { href: '/userPage', key: '프로필', text: '프로필', icon: <></> },
    ];

    const [selectedMenu, setSelectedMenu] = useState<string>("");
    const setMenu = (href: string) => {
        const matchedLink = underLinks.find(link => link.href === href);
        if (matchedLink) {
            setSelectedMenu(matchedLink.href);
        } else {
            setSelectedMenu("");
        }
    };

    const {isBoardOpen, setBoardOpen} = usePostState();
    const {isImgModalOpen, setImgModalOpen} = useImgState();
    useEffect(() => {
        setSelectedMenu(pathname);
        if (isBoardOpen) setBoardOpen(false);
        if (isImgModalOpen) setImgModalOpen(false);
    }, [pathname]);

    // 페이지 이동 관련
    const movePage = (href: string) => {
        setMenu(href);
        router.push(href);
    };

    // url 설정 관련
    useEffect(() => {
        const currentLink = window.location.pathname;
        setMenu(currentLink);
    }, []);

    // 업로드 (수정바람)
    const [uploadTabOpen, setUploadTabOpen] = useState<boolean>(false);
    const doUpload = () => {
        setUploadTabOpen(!uploadTabOpen);
    };
    useEffect(() => {
        const handleClickOutside = (event:any) => {
          if (!uploadTabOpen) return;
      
          const uploadTabElement = document.querySelector(".upload-tab");
          if (!uploadTabElement?.contains(event.target)) {
            setUploadTabOpen(false);
          }
        };
      
        document.addEventListener("click", handleClickOutside);
      
        return () => {
          document.removeEventListener("click", handleClickOutside);
        };
      }, [uploadTabOpen]);

    const UploadTab = ({className}:{className?: string}) => {
        return (
            <div className={`${className} upload-tab absolute flex flex-col rounded-lg bg-neutral-700 text-white gap-0.5
             p-2 transition z-30`}>
                <button className="w-full h-9 px-2 flex items-center justify-center hover:bg-neutral-500 rounded"
                onClick={()=>{
                    if (auth.currentUser) {
                        setIsImgUploadOpen(true);
                        setUploadTabOpen(false);
                    } else {
                        loginModal.onOpen();
                    }
                }}>
                    이미지 업로드
                </button>
                <button className="w-full h-9 px-2 flex items-center justify-center hover:bg-neutral-500 rounded"
                onClick={()=>{
                    if (auth.currentUser) {
                        setIsPostUploadOpen(true);
                        setUploadTabOpen(false);
                    } else {
                        loginModal.onOpen();
                    }
                }}>
                    게시글 업로드
                </button>
            </div>
        );
    };

    // 검색 관련
    const [searchFloatOpen, setSearchFloatOpen] = useState<boolean>(false);
    const SearchBtn = () => {
        return (
            <button className="w-9 h-9 z-[4] flex items-center justify-center text-xl text-white shadow rounded-full 
                         transition duration-200 hover:brightness-75"
                style={{
                    backgroundImage: "linear-gradient(70deg, #B25FF3 0%, #55227D 100%)",
                }}
                onClick={() => {
                    setSearchFloatOpen(true);
                }}>
                <BiSearchAlt2 />
            </button>
        );
    };


    const [btmImgClicked, setBtmImgClicked] = useState<boolean>(false);
    const listRef = useRef<HTMLButtonElement>(null);

    const UserMenu = () => {
        const toggleOpen = () => {
            setBtmImgClicked(!btmImgClicked);
        }

        const handleMenuItemClick = () => {
            toggleOpen();
        };

        return (
            <>
                {[NavSize.md, NavSize.lg].includes(navSize) && (
                    <div className="relative overflow-visible">
                        <div className="flex flex-row items-center xs:gap-3 gap-1">
                            {/** 업로드 버튼 */}
                            <div className=" relative">
                                <button
                                    className="block text-xl font-semibold py-2 px-2 rounded-full hover:bg-[#8434c2] transition text-white"
                                    onClick={() => { doUpload() }}>
                                    <FaPlus />
                                </button>
                                {uploadTabOpen && <UploadTab className="w-32 h-20 top-[38px] -right-2 text-sm" />}
                            </div>

                            {/** 알림 버튼 */}
                            <AlarmButton 
                                className="block text-xl font-semibold py-2 px-2 rounded-full hover:bg-[#8434c2] transition text-white"
                            />

                            {/** 채팅 버튼 */}
                            <button className="block text-[1.4rem] font-semibold py-2 px-2 rounded-full hover:bg-[#8434c2] transition text-white"
                                onClick={() => {
                                    if (auth.currentUser?.uid) {
                                        ToggleChatOpen()
                                    } else {
                                        loginModal.onOpen();
                                    }
                                }}>
                                <MdMailOutline />
                            </button>

                            <button
                                //ref={listRef}
                                onClick={() => {
                                    toggleOpen();
                                }}
                                className="min-w-[75px] flex flex-row items-center gap-2 rounded-full duration-200 hover:brightness-90
                                        cursor-pointer transition p-1 pr-2 bg-white "
                            >
                                {auth.currentUser?.uid ? (<Image src={user?.profImg ?? ""} alt={user?.nickname ?? ""} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />)
                                    : (<div className="flex items-center justify-center w-6 h-6 text-xl text-[#B25FF3]"><MdLogin /></div>)
                                }
                                <div className="text-primary-purple flex-row flex-1 items-center text-xl">
                                    {auth.currentUser?.uid ? (
                                        <GiHamburgerMenu />
                                    ) : (
                                        <div className="-ml-1 font-semibold text-sm text-nowrap">
                                            로그인
                                        </div>
                                    )}
                                </div>
                            </button>
                        </div>

                        {btmImgClicked && (
                            <div className="absolute rounded-xl shadow-md w-[140px] md:w-[100%] bg-[#ffffff94] backdrop-blur-[0.5rem] overflow-hidden right-0 top-18 text-sm z-50">
                                <div className="flex flex-col cursor-pointer">
                                    {auth.currentUser?.uid ? (
                                        <>
                                            <MenuItem label="마이 페이지" onClick={() => {
                                                router.push(`/userPage`);
                                                if (pathname === '/userPage') {
                                                    window.location.reload();
                                                }
                                                handleMenuItemClick();
                                            }} />
                                            <MenuItem label="미션" onClick={() => { 
                                                setIsMissionOpen(true);
                                            }} />
                                            <hr className="border-b-[0.5px] border-[#e8dbf2]" />
                                            <MenuItem
                                                label="로그아웃"
                                                onClick={async () => {
                                                    await logoutAct();
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
                    </div>)}
            </>
        );
    };

    const BtmListBtns = () => {
        // 마이 페이지, 미션, 로그아웃
        return (
            <div className="absolute bottom-[55px] -right-[12px] gap-1 z-30
            rounded-lg bg-neutral-700 text-white text-sm p-2 flex flex-col w-32">
                <button
                    className="w-full p-0.5 hover:bg-neutral-500 rounded text-left"
                    onClick={() => {
                        router.push(`/userPage`);
                        window.location.reload();
                    }}>
                    마이 페이지
                </button>
                <button
                    className="w-full p-0.5 hover:bg-neutral-500 rounded text-left"
                    onClick={() => { setIsMissionOpen(true); }}>
                    미션
                </button>
                <div className="w-full border-b border-neutral-400" />
                <button
                    className="w-full p-0.5 hover:bg-neutral-500 rounded text-left"
                    onClick={async () => {
                        await logoutAct();
                        fetchU();
                    }}>
                    로그아웃
                </button>
            </div>
        );
    };
    
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (listRef.current && !listRef.current.contains(event.target as Node)) {
                setBtmImgClicked(false); // 클릭된 영역이 리스트 외부인 경우 리스트 닫기
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <>
            <SearchFloat searchFloatOpen={searchFloatOpen} setSearchFloatOpen={setSearchFloatOpen} />
            {/** 상단 네비바 */}
            <div className="fixed bg-white z-[3] w-full h-14 shadow flex flex-row items-center justify-between">
                {/** 로고 */}
                <div className="text-lg font-bold px-2 cursor-pointer hover:underline" onClick={() => { router.push('/') }}>
                    NICEKETCH
                </div>

                {[NavSize.md, NavSize.lg].includes(navSize) ? (<>
                    {/** 메뉴 */}
                    <div className="flex flex-row items-center gap-6 w-fit ml-2">
                        {[underLinks[0], underLinks[1], underLinks[3]].map((link, index) => {
                            return (
                                <motion.div
                                    key={index}
                                    className="relative h-full flex items-center"
                                    whileTap={{ scale: 0.95 }}>
                                    <div
                                        className={`h-14 flex items-center justify-center ${link.href === selectedMenu && 'font-semibold text-[#B25FF3]'}`}>
                                        <button onClick={() => {
                                            movePage(link.href);
                                        }} className="py-2 px-4 rounded">
                                            {link.text}
                                        </button>
                                        {link.href === selectedMenu && (
                                            <motion.span
                                                className="absolute h-16 bottom-0 left-0 right-0 border-b-4 border-[#B25FF3]"
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                transition={{ duration: 0.2 }}
                                            />
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    {/** 색상박스 버튼탭 */}
                    <div className={`relative w-fit flex flex-row gap-6 justify-end items-center h-full pr-2 transition-[padding] overflow-visible
                    ${navSize === NavSize.lg ? "pl-28" : "pl-8"} `}>
                        <div className="absolute w-full h-full left-0" style={{
                            clipPath: "polygon(20px 0, 100% 0, 100% 100%, 0% 100%)",
                            backgroundImage: "linear-gradient(70deg, #55227D 0%, #B070E2 62.15%, #B5C4FA 100%)",
                        }} />
                        <SearchBtn />
                        <UserMenu />
                    </div>
                </>) : (<>
                    <div className="flex flex-row items-center gap-2 mr-2 text-xl">
                        <SearchBtn />
                        <AlarmButton 
                            className="flex items-center justify-center w-9 h-9 rounded-full text-[#B25FF3] hover:bg-neutral-200"
                        />
                        <button className="flex items-center justify-center w-9 h-9 rounded-full text-[#B25FF3] hover:bg-neutral-200"
                            onClick={() => {
                                if (auth.currentUser?.uid) {
                                    ToggleChatOpen()
                                } else {
                                    loginModal.onOpen();
                                }
                            }}>
                            <MdMailOutline />
                        </button>
                    </div>
                </>)}
            </div>

            {/** 하단 네비바 */}
            {([NavSize.sm, NavSize.xs].includes(navSize)) && (
                <div className={`fixed w-full h-14 z-[10] inset-x-1/2 -translate-x-1/2 shadow-md
                ${navSize === NavSize.sm ? "max-w-[360px] bottom-2 opacity-90 rounded-md" : "bottom-0 rounded-none"}
                bg-neutral-100 flex flex-row gap-4 items-center justify-between px-3`}>
                    {underLinks.map((link, index) => {
                        return (
                            <>
                                {!(["", "프로필"].includes(link.text)) ? (
                                    <div className={`relative w-12 h-12 z-[11] flex items-center justify-center
                                                    ${link.href === selectedMenu && 'font-semibold'}`}
                                        key={index}>
                                        <button onClick={() => {
                                            if (link.text !== "") {
                                                movePage(link.href);
                                            }
                                        }} className={`text-2xl rounded ${link.href === selectedMenu && "text-[#B25FF3]"}`}>
                                            {link.icon}
                                        </button>
                                        {link.href === selectedMenu && link.text !== "" && (
                                            <motion.span
                                                className="absolute h-14 -top-1 left-0 right-0 border-t-4 border-[#B25FF3]"
                                                initial={{ scaleX: 0 }}
                                                animate={{ scaleX: 1 }}
                                                transition={{ duration: 0.2 }}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {(link.text === "") ? (
                                            <div className="relative">
                                                <button className="w-12 h-12 rounded-full flex items-center justify-center text-xl 
                                                text-[#B25FF3] bg-white hover:bg-neutral-200 border-2 border-[#B25FF3]"
                                                    key={index}
                                                    onClick={() => { doUpload() }}>
                                                    <FaPlus />
                                                </button>
                                                {uploadTabOpen && <UploadTab className="w-32 h-20 bottom-[54px] right-[-40px] text-sm" />}
                                            </div>) : (
                                            <button className="w-12 h-12 rounded relative hover:brightness-90 transition"
                                                key={index}
                                                ref={listRef}
                                                // 프로필 이미지 버튼
                                                onClick={() => {
                                                    if (auth.currentUser?.uid) {
                                                        setBtmImgClicked(!btmImgClicked);
                                                    } else {
                                                        loginModal.onOpen();
                                                    }
                                                }}>
                                                {user?.uid
                                                    ? <img src={user.profImg} alt="" className="w-10 h-10 object-cover rounded-full" />
                                                    : <div className="font-bold text-sm text-[#B25FF3] hover:bg-neutral-1 00
                                                     w-12 h-12 flex items-center justify-center rounded-full text-nowrap" >로그인</div>}
                                                {btmImgClicked && (
                                                    <div>
                                                        <BtmListBtns />
                                                    </div>
                                                )}
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        );
                    })}
                </div>
            )}
            ))
        </>

    )
};

export default NewNav;
