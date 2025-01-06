"use client"

import { useState, useEffect } from "react";
import { auth } from "@/config/firebase";
import {
    FPost, getFollowingPosts,
    getPopularPosts, getPosts
} from "../utility/BulletinModule";
import usePostState from "@/zustand/PostState";
import ShortPostBox from "../Common(Kim)/BulletinCard/ShortPostCard";

import {
    MdSearch, MdKeyboardDoubleArrowLeft, MdKeyboardArrowLeft,
    MdKeyboardArrowRight, MdKeyboardDoubleArrowRight
} from "react-icons/md";
import ShowPopPosts from "./ShowPopPosts";
import useLoginModal from "../hooks/useLoginModal";
import { useRouter } from "next/navigation";

const MainBulletin = () => {
    //      대시보드 관련           ***********************************************
    const {
        setPostList, popPostList, setPopPostList, setPostIndex, isBoardOpen
    } = usePostState();
    const [tempPosts, setTempPosts] = useState<FPost[]>([]);
    const loginModal = useLoginModal();
    const router = useRouter();

    // 전체 게시글 탭
    const tabList = ["전체", "팔로우", "잡담", "질문 및 토론", "창작", "건의"];
    const [tabText, setTabText] = useState<string>("전체");

    // 네비게이션 버튼
    const [pageNum, setPageNum] = useState<number>(0);
    const showPostLen = 14; // 한 번에 보여주는 개수
    const NumBtn = ({ index }: { index: number }) => {
        return (
            <button className={`w-6 h-6 rounded flex items-center justify-center text-sm hover:bg-neutral-200
            ${pageNum === index && "underline text-[#B25FF3]"}`}
                onClick={() => { setPageNum(index) }}>
                {index + 1}
            </button>
        )
    };
    const PageShiftBtn = ({ icon, shift }: { icon: any, shift: number }) => {
        const pageShift = () => {
            const newPageNum = pageNum + shift;
            if (newPageNum < 0) {
                setPageNum(0);
            } else if (newPageNum >= Math.ceil(tempPosts.length / showPostLen) - 1) {
                setPageNum(Math.ceil(tempPosts.length / showPostLen) - 1);
            } else {
                setPageNum(newPageNum);
            };
        };

        return (
            <>
                {tempPosts.length > 0 && <>
                    <button className="w-6 h-6 rounded shadow flex items-center justify-center
                        bg-white hover:bg-neutral-200 text-[#B25FF3] text-lg"
                        onClick={pageShift}>
                        {icon}
                    </button>
                </>}
            </>
        )
    };

    // 데이터 패칭
    const [popLoad, setPopLoad] = useState<boolean>(true);
    const fetchPopPosts = async () => {
        setPopLoad(true);
        // 인기 게시글 패칭
        const d = await getPopularPosts();
        setPopPostList(d);
        setPopLoad(false);
    };

    const [postLoad, setPostLoad] = useState<boolean>(true);
    const fetchPosts = async (text?: string) => {
        // 게시글 불러오기 및 검색
        setPostLoad(true);
        if (tabText === "팔로우") {
            if (auth.currentUser?.uid) {
                const d = await getFollowingPosts(auth.currentUser?.uid);
                setTempPosts(d);
            } else {
                setTempPosts([]);
            }
        } else {
            const d = await getPosts(tabText, text);
            setTempPosts(d);
        }
        setPostLoad(false);
    };

    // 검색 관련
    const [searchWord, setSearchWord] = useState<string>("");
    const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        fetchPosts(searchWord);
    };

    // 초기 인기 게시글 데이터 불러오기
    useEffect(() => {
        fetchPopPosts();
    }, []);

    // 탭 변경 시 데이터 불러오기
    useEffect(() => {
        fetchPosts();
        setSearchWord("");
    }, [tabText]);

    // 인기탭 열 개수
    const [isTwoCol, setIsTwoCol] = useState<boolean>(false);
    const getColCount = () => {
        if (window.innerWidth <= 800) {
            setIsTwoCol(false);
        } else {
            setIsTwoCol(true);
        }
    };
    useEffect(() => {
        getColCount();
        window.addEventListener("resize", getColCount);
        return () => {
            window.removeEventListener("resize", getColCount);
        };
    }, []);

    // 폭에 따른 페이지 개수
    const [pagesLimit, setPagesLimit] = useState<5 | 10>(10);
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 500) {
                setPagesLimit(5);
            } else {
                setPagesLimit(10);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <div className="flex flex-row mx-auto px-2 gap-1 w-full justify-center">
            <div className="flex flex-col px-4 py-2 flex-1 gap-16 w-full max-w-[1400px]">
                {/** 인기 게시글 */}
                <div className="w-full flex flex-col gap-2" >
                    <div className="text-lg font-bold">인기 게시글</div>

                    <div className="w-full">
                        {popLoad ? <div className="bg-neutral-200 w-full h-24 flex items-center justify-center text-sm animate-pulse">
                            불러오는 중...
                        </div> : <>
                            {popPostList.length > 0 ? <ShowPopPosts isTwoCol={isTwoCol} popPostList={popPostList} />
                                : <div className="text-sm text-neutral-400 font-bold m-auto w-full h-16 shadow flex items-center justify-center">
                                    인기 게시글이 없습니다.</div>}
                        </>}
                    </div>
                </div>

                {/** 전체 게시글 */}
                <div className="w-full flex flex-col gap-2" >
                    <div className="text-lg font-bold">전체 게시글</div>

                    {/** 게시글 탭 */}
                    <div className="w-full flex flex-row items-center gap-y-2 gap-x-6 max-[800px]:flex-col">
                        <div className="flex flex-row mr-auto gap-1 items-center max-[800px]:w-full overflow-auto max-sm:mr-auto">
                            {tabList.map((tab, index) => {
                                return (
                                    <button className={`px-3 h-8 text-sm flex items-center justify-center rounded shadow font-bold truncate
                                ${tabText === tab ? "bg-[#B25FF3] text-white"
                                            : "text-[#B25FF3] bg-white hover:bg-neutral-200 border border-neutral-200"}`}
                                        key={index}
                                        onClick={() => {
                                            if (tabText !== tab) {
                                                setTabText(tab);
                                            }
                                        }}>
                                        {tab}
                                    </button>)
                            })}
                        </div>
                        {/** 검색창 */}
                        <form className="max-[800px]:w-full flex-1 flex flex-row items-center gap-1 ml-auto"
                            onSubmit={(e) => { submitSearch(e) }}>
                            <input className="flex-1 h-8 rounded border border-neutral-200 text-sm px-1"
                                placeholder="검색어를 입력하세요" value={searchWord} onChange={(e) => { setSearchWord(e.target.value) }} />
                            <button className="rounded w-8 h-8 flex items-center justify-center text-lg text-white bg-[#B25FF3] hover:bg-[#63308B]" type="submit">
                                <MdSearch />
                            </button>
                        </form>
                    </div>

                    {/** 게시글 목록 */}
                    {postLoad ? <div className="bg-neutral-200 mb-4 w-full h-20 flex items-center justify-center text-sm animate-pulse">
                        불러오는 중...
                    </div> : <>
                        <div className="w-full flex flex-col mb-4">
                            {tempPosts.length > 0 ? <>
                                {tempPosts.map((postData, index) => {
                                    if (index >= pageNum * showPostLen && index < (pageNum + 1) * showPostLen) {
                                        return (
                                            <div className="" onClick={async (e) => {
                                                e.preventDefault();
                                                await setPostList(tempPosts);
                                                setPostIndex(index, "default");
                                            }}
                                                key={`${tabText}${index}`}>
                                                <ShortPostBox postData={postData} indexNum={index} />
                                            </div>
                                        );
                                    }
                                })}
                            </> : <>
                                {tabText === "팔로우" ?
                                    <>
                                        {auth.currentUser?.uid
                                            ? <div className="text-sm text-neutral-400 font-bold m-auto w-full h-16 shadow flex items-center justify-center">
                                                팔로워가 작성한 게시글이 없습니다.</div>
                                            : <div className="text-sm text-neutral-400 font-bold m-auto w-full h-16 shadow flex items-center justify-center
                                            cursor-pointer hover:bg-neutral-100"
                                                onClick={() => { loginModal.onOpen() }}>
                                                로그인이 필요합니다.</div>}
                                    </>
                                    : <div className="text-sm text-neutral-400 font-bold m-auto w-full h-16 shadow flex items-center justify-center">
                                        검색된 게시글이 없습니다.</div>}
                            </>}
                        </div>
                    </>}

                    <button className="ml-auto px-10 py-1 text-sm rounded text-nowrap
                         text-white bg-[#B25FF3] hover:bg-[#63308B]"
                        onClick={() => router.push("/postUpload")}>
                        글쓰기
                    </button>


                    {/** 페이지 이동 */}
                    <div className="w-full flex flex-row items-center justify-center gap-2 mt-4" >
                        <PageShiftBtn icon={<MdKeyboardDoubleArrowLeft />} shift={-pagesLimit} />
                        <PageShiftBtn icon={<MdKeyboardArrowLeft />} shift={-1} />
                        <div className="flex flex-row items-center gap-2" >
                            {Array.from({ length: pagesLimit }, (_, index) => {
                                const n = pageNum - (pageNum % pagesLimit) + index;
                                return n <= Math.ceil(tempPosts.length / showPostLen) - 1 && (
                                    <NumBtn index={n} key={index} />
                                );
                            })}
                        </div>
                        <PageShiftBtn icon={<MdKeyboardArrowRight />} shift={1} />
                        <PageShiftBtn icon={<MdKeyboardDoubleArrowRight />} shift={pagesLimit} />
                    </div>
                </div>
            </div>
            {isBoardOpen && (<div className="w-[900px]" />)}
        </div>
    );
};

export default MainBulletin;

