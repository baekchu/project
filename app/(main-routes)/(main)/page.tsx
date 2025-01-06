"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import useLoginModal from "@/components/hooks/useLoginModal";
import ImgCard from "@/components/Common(Kim)/ImgCard/ImgCard";
import useImgState from "@/zustand/ImgState";
import Masonry from "react-masonry-css";
import { FImgData, getRecommendImgIDs } from "@/components/utility/ImgDataModule";
import { getFollowingImgs } from "@/components/utility/CanvasModule";
import { myFollowing } from "@/components/utility/UserDataModule";
import { auth } from "@/config/firebase";
import {
    IoIosArrowBack, IoIosArrowForward
} from "react-icons/io";

import { MdOutlineScreenSearchDesktop } from "react-icons/md";

const Canvas = () => {
    const [recImgs, setRecImgs] = useState<FImgData[]>([]);
    const {
        setImgArray, followingImgArray, setFollowingImgArray,
        setImgIndex,
    } = useImgState();
    const loginModal = useLoginModal();

    const breakPointsObj = {
        default: 4,
        3000: 6,
        2000: 5,
        1200: 3,
        1000: 2,
        500: 1,
    };

    // 뷰어로 보기 버튼
    const ViewerBtn = ({ type = "default" }: { type?: "default" | "following" }) => {
        const openViewer = () => {
            if (type === "default") {
                setImgIndex(0, "default");
            } else {
                setImgIndex(0, "following");
            }
        };

        return (
            <button className="rounded p-1 shadow border border-neutral-200 bg-white
          flex flex-row items-center gap-2 text-[#B25FF3] font-bold hover:bg-neutral-200"
                onClick={openViewer}>
                <MdOutlineScreenSearchDesktop />
                <div className="text-sm">뷰어로 보기</div>
            </button>
        );
    };


    /**         데이터               *****************************/
    // 내가 팔로잉하는 작가 uid
    const [myFols, setMyFols] = useState<string[]>([]);
    useEffect(() => {
        const fetchFollowing = async () => {
            if (auth.currentUser?.uid) {
                const d = await myFollowing(auth.currentUser.uid);
                setMyFols(d);
            }
        };
        fetchFollowing();
    }, [auth.currentUser]);

    // 팔로우 작가 작품
    const [isFollowLoad, setIsFollowLoad] = useState<boolean>(true);
    useEffect(() => {
        if (myFols.length > 0) {
            const fetchArts = async () => {
                const d: FImgData[] = await getFollowingImgs(myFols);
                setFollowingImgArray(d);
                setIsFollowLoad(false);
            };
            fetchArts();
        }
    }, [myFols]);

    // 추천 작품 데이터
    const [tempLoading, setTempLoading] = useState<boolean>(true);
    useEffect(() => {
        const fetchI = async () => {
            setTempLoading(true);
            const d = await getRecommendImgIDs();
            await setRecImgs(d);
            setTempLoading(false);
        };
        fetchI();
    }, []);



    // 더보기 버튼 동작
    const unitCount = 12;
    const [artCnt, setArtCnt] = useState<number>(Math.min(recImgs.length, unitCount));
    const viewMore = () => {
        setArtCnt(Math.min(artCnt + unitCount, recImgs.length));
    };
    useEffect(() => {
        setArtCnt(Math.min(unitCount, recImgs.length));
    }, [recImgs]);


    const [isBig, setIsBig] = useState<boolean>(true);
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 700) {
                setIsBig(false);
            } else {
                setIsBig(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);


    const [showArr, setShowArr] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    // 화살표로 작품창 이동
    const moveBox = useCallback((direction: "left" | "right") => {
        // 이동할 픽셀 수
        const moveAmount = 450; // 이동할 픽셀 수

        const container = containerRef.current;
        if (container == null) return;
        const currentScrollLeft = container.scrollLeft;

        let newScrollLeft;
        if (direction === "left") {
            newScrollLeft = currentScrollLeft - moveAmount;
        } else {
            newScrollLeft = currentScrollLeft + moveAmount;
        }

        container.scrollTo({
            left: newScrollLeft,
            behavior: "smooth",
        });
    }, [containerRef]);


    return (
        <section className="w-full flex items-center justify-center px-4">
            <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-20">
                {/** 관심 작품의 새 작품 */}
                <div className="w-full flex flex-col gap-2">
                    <div className="w-full flex flex-row items-end justify-between">
                        <div className="text-lg font-bold">관심 작가의 새 작품</div>
                        <ViewerBtn type={"following"} />
                    </div>

                    <div className="flex flex-row items-center gap-1 bg-neutral-100 relative"
                        onMouseEnter={() => setShowArr(true)}
                        onMouseLeave={() => setShowArr(false)}>
                        {auth.currentUser
                            ? <>
                                {myFols.length > 0
                                    ? <>
                                        {isFollowLoad ? <div className="w-full h-64 flex items-center justify-center text-sm animate-pulse">
                                            <div className="flex flex-row w-full h-full gap-2 p-2">
                                                <div className="w-[220px] h-full rounded-lg bg-neutral-300" />
                                                <div className="w-[220px] h-full rounded-lg bg-neutral-300" />
                                                <div className="w-[220px] h-full rounded-lg bg-neutral-300" />
                                            </div>
                                        </div> : <>
                                            {followingImgArray.length > 0 ? <>
                                                {/** 스크롤 화살표 */}
                                                <button className={`absolute -left-2 top-1/2 -translate-y-1/2 w-9 h-9 text-lg rounded-full shadow 
                                            flex items-center justify-center text-[#B25FF3] bg-white hover:bg-neutral-200 transition z-[2]
                                            ${showArr ? "opacity-90" : "opacity-0"} transition-opacity`}
                                                    onClick={(e) => {
                                                        moveBox('left');
                                                    }} >
                                                    <IoIosArrowBack />
                                                </button>
                                                <button className={`absolute -right-2 top-1/2 -translate-y-1/2 w-9 h-9 text-lg rounded-full shadow 
                                            flex items-center justify-center text-[#B25FF3] bg-white hover:bg-neutral-200 transition z-[2]
                                            ${showArr ? "opacity-90" : "opacity-0"}`}
                                                    onClick={(e) => {
                                                        moveBox('right');
                                                    }} >
                                                    <IoIosArrowForward />
                                                </button>

                                                {/** 팔로우 작가들의 새 작품을 출력 */}
                                                <div className="w-full flex flex-row h-full overflow-x-auto my-0.5" ref={containerRef}>
                                                    {followingImgArray.map((art, index) => {
                                                        return (
                                                            <div className="min-w-[220px]" key={index} onClick={() => {
                                                                setImgIndex(index, "following");
                                                            }}>
                                                                <ImgCard type={"fixed"} docID={art.objectID} imgIndex={index} />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                                : <div className="w-full h-32 flex items-center justify-center
                                bg-neutral-200 cursor-pointer text-sm text-[#B25FF3] font-bold">
                                                    팔로우한 작가님들의 최근 작품이 없습니다.
                                                </div>}
                                        </>}
                                    </>
                                    : <div className="w-full h-32 flex items-center justify-center
                            bg-neutral-200 cursor-pointer text-sm text-[#B25FF3] font-bold">
                                        아직 다른 작가님들을 팔로우하지 않았습니다.
                                    </div>}
                            </>
                            : <div className="w-full h-32 flex items-center justify-center
                        bg-neutral-200 hover:bg-neutral-300 cursor-pointer text-sm text-[#B25FF3] font-bold"
                                onClick={() => { loginModal.onOpen() }}>
                                로그인이 필요합니다
                            </div>}
                    </div>
                </div>

                {/** 추천 작품 */}
                <div className="w-full flex flex-col gap-2">
                    <div className="w-full flex flex-row items-end justify-between">
                        <div className="text-lg font-bold">추천 작품</div>
                        <ViewerBtn />
                    </div>
                    {tempLoading ? <Masonry className="flex animate-pulse gap-2" breakpointCols={breakPointsObj}>
                        <div className="rounded-lg h-64 bg-neutral-200 mb-2" />
                        <div className="rounded-lg h-80 bg-neutral-200 mb-2" />
                        <div className="rounded-lg h-72 bg-neutral-200 mb-2" />
                        <div className="rounded-lg h-64 bg-neutral-200 mb-2" />
                        <div className="rounded-lg h-80 bg-neutral-200 mb-2" />
                        {isBig && <>
                            <div className="rounded-lg h-72 bg-neutral-200 mb-2" />
                            <div className="rounded-lg h-40 bg-neutral-200 mb-2" />
                            <div className="rounded-lg h-40 bg-neutral-200 mb-2" />
                        </>}
                    </Masonry> : <Masonry className="flex" breakpointCols={breakPointsObj}>
                        {recImgs?.map((data, index) => {
                            if (index < artCnt) {
                                return (
                                    <div
                                        className=""
                                        key={index}
                                        onClick={async (e) => {
                                            e.preventDefault();
                                            await setImgArray(recImgs);
                                            setImgIndex(index, "default");
                                        }}>
                                        <ImgCard type={"default"} docID={data.objectID ?? ""} imgIndex={index} key={index} />
                                    </div>
                                );
                            };
                        })}
                    </Masonry>}

                    {recImgs.length !== artCnt && (
                        <button className="text-sm text-[#B25FF3] font-bold
                        rounded hover:bg-neutral-200 px-3 py-0.5 mx-auto"
                            onClick={viewMore}>더보기</button>
                    )}
                </div>

            </div >
        </section >
    );
};

export default Canvas;
