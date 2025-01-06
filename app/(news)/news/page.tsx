"use client"

import { useEffect, useState } from 'react';
import NewsCard from "@/components/Common(Kim)/NewsCard/NewsCard";
import CommunityNotice from "@/components/CommunityNotice(Kim)/CommunityNotice";
import {
    FNews, FQNA, getNewsData, getNewsIDs,
    getQNAData, getQNAIDs
} from "@/components/utility/NewsModule";

import {
    MdSearch, MdKeyboardDoubleArrowLeft, MdKeyboardArrowLeft,
    MdKeyboardArrowRight, MdKeyboardDoubleArrowRight
} from "react-icons/md";
import QNACard from '@/components/Common(Kim)/QNACard/QNACard';
import usePostState from '@/zustand/PostState';

const News = () => {
    // 이벤트 배너 이미지 리스트
    const banners: { url: string, color?: string }[] = [
        { url: "https://cdn.travie.com/news/photo/first/201705/img_19694_12.jpg", },
        { url: "https://t1.daumcdn.net/cfile/tistory/206FFA024CDA899150" },
        { url: "https://media.istockphoto.com/id/1457806414/ko/%EC%82%AC%EC%A7%84/%ED%94%84%EB%A6%AC%EB%8D%A4-%ED%83%80%EC%9B%8C%EC%99%80-%EB%A1%9C%EC%96%B4-%EB%A7%A8%ED%95%B4%ED%8A%BC%EC%9D%98-%ED%8C%8C%EB%85%B8%EB%9D%BC%EB%A7%88.webp?b=1&s=170667a&w=0&k=20&c=rQoUDAfuszPZqSIiJkughJbGG8GFqlOQAD3K3Qv4_F4=", color: "#FFFFFF" },
    ];

    // 보드 관련
    const { setPostList } = usePostState();


    // 데이터 관련
    const [newsIDs, setNewsIDs] = useState<string[]>();
    const [qnaIDs, setQnaIDs] = useState<string[]>();
    const fetchData = async () => {
        const n = await getNewsIDs();
        setNewsIDs(n);
        const q = await getQNAIDs();
        setQnaIDs(q);
    };
    useEffect(() => {
        fetchData();
    }, []);

    // 탭 관련
    const [tabNum, setTabNum] = useState<number>(0);
    const TabBtn = ({ text, index }: { text: string, index: number }) => {
        const handleClick = () => {
            if (tabNum !== index) {
                setTabNum(index);
            }
        };

        return (
            <button className={`px-3 font-bold rounded py-0.5 shadow
            ${tabNum === index ? "text-white bg-[#B25FF3] hover:bg-[#63308B]"
                    : "text-[#B25FF3] bg-white hover:bg-neutral-200 border border-neutral-200"}`}
                onClick={handleClick}>
                {text}
            </button>
        );
    };

    useEffect(() => { // 탭 넘버와 데이터가 바뀌면 postList를 업데이트함
        if (tabNum === 0 && newsIDs && newsIDs?.length > 0) {
            const fetchD = async () => {
                const list: FNews[] = [];
                newsIDs.map(async (docID) => {
                    const temp = await getNewsData(docID);
                    if (temp) list.push(temp);
                });
                setPostList(list);
            };
            fetchD();
        } else if (tabNum === 1 && qnaIDs && qnaIDs.length > 0) {
            const fetchD = async () => {
                const list: FQNA[] = [];
                qnaIDs.map(async (docID) => {
                    const temp = await getQNAData(docID);
                    if (temp) list.push(temp);
                });
                setPostList(list);
            };
            fetchD();
        }
    }, [tabNum, newsIDs, qnaIDs]);

    // 검색 관련 (임시)
    const [searchWord, setSearchWord] = useState<string>("");
    const submitSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchWord.trim() !== "") {
            console.log(`${searchWord} 검색`);
            setSearchWord("");
        } else {
            alert("검색어를 입력하세요");
        }
    };

    // 페이지 관련
    const [pageNum, setPageNum] = useState<number>(1);
    const [lastPageNum, setLastPageNum] = useState<number>(15);
    const NumBtn = ({ index }: { index: number }) => {
        return (
            <button className={`w-6 h-6 rounded flex items-center justify-center text-sm hover:bg-neutral-200
            ${pageNum === index && "underline text-[#B25FF3]"}`}
                onClick={() => { setPageNum(index) }}>
                {index}
            </button>
        )
    };
    const PageShiftBtn = ({ icon, shift }: { icon: any, shift: number }) => {
        const pageShift = () => {
            const newPageNum = pageNum + shift;
            if (newPageNum < 1) {
                setPageNum(1);
            } else if (newPageNum >= lastPageNum) {
                setPageNum(lastPageNum);
            } else {
                setPageNum(newPageNum);
            };
        };

        return (
            <button className="w-6 h-6 rounded shadow flex items-center justify-center
             bg-white hover:bg-neutral-200 text-[#B25FF3] text-lg"
                onClick={pageShift}>
                {icon}
            </button>
        )
    };

    const [pageRange, setPageRange] = useState<number[]>();
    const [newsRange, setNewsRange] = useState<string[]>();
    useEffect(() => {   // 페이지 인덱싱 업데이트
        const idArr = (tabNum === 0) ? newsIDs : qnaIDs;
        if (idArr) {
            const fetchPageNum = async () => {
                await setPageNum(1);
                await setLastPageNum(Math.ceil(idArr?.length / 10));
            };
            fetchPageNum();
        };

        // 현재 위치한 페이지 묶음 설정하기
        const tenUnit = Math.floor((pageNum - 1) / 10);
        if (pageRange === undefined || pageRange[0] !== tenUnit * 10) {
            const newArray = [];
            for (let i = tenUnit * 10 + 1; i <= Math.min(lastPageNum, tenUnit * 10 + 10); i++) {
                newArray.push(i);
            };
            setPageRange(newArray);
        }

        // 열람중인 페이지 데이터 패칭
        const itemsPerPage = 10;
        if (idArr) {
            const startIdx = (pageNum - 1) * itemsPerPage;
            const endIdx = Math.min(startIdx + itemsPerPage - 1, idArr.length - 1);
            const newIDArray = idArr.slice(startIdx, endIdx + 1);
            setNewsRange(newIDArray);
        }
    }, [tabNum, newsIDs, qnaIDs]);


    return (
        <div className="w-full flex flex-col items-center gap-4">
            <CommunityNotice imgList={banners} />

            <div className="w-full max-w-[1400px] px-6 flex flex-col gap-2">
                {/** 탭 버튼 */}
                <div className="flex flex-row gap-1">
                    <TabBtn text={"공지사항 및 이벤트"} index={0} />
                    <TabBtn text={"Q&A"} index={1} />
                </div>

                {/** 내용 */}
                <div className="w-full flex flex-col rounded shadow">
                    {tabNum === 0 ? <>
                        {/** 공지사항 및 이벤트 */}
                        {(newsRange && newsRange?.length > 0) ? <>
                            {newsRange.map((docID, index) => {
                                return (<NewsCard docID={docID} postIndex={index} key={'n' + index} />);
                            })}
                        </> : <div className="w-full min-h-[100px] my-auto flex items-center justify-center text-neutral-500 text-sm">
                            공지가 아직 등록되지 않았어요
                        </div>}
                    </> : <>
                        {/** Q&A */}
                        {(newsRange && newsRange?.length > 0) ? <>
                            {newsRange.map((docID, index) => {
                                return (<QNACard docID={docID} postIndex={index} key={'q' + index} />);
                            })}
                        </> : <div className="w-full min-h-[100px] my-auto flex items-center justify-center text-neutral-500 text-sm">
                            QNA가 아직 등록되지 않았어요
                        </div>}
                    </>}
                </div>

                {/** 검색창 */}
                {/**
                <form className="w-full max-w-[700px] flex flex-row items-center gap-1 ml-auto"
                    onSubmit={(e) => { submitSearch(e) }}>
                    <input className="flex-1 h-9 rounded border border-neutral-200 text-sm px-1"
                        placeholder="검색어를 입력하세요" value={searchWord} onChange={(e) => { setSearchWord(e.target.value) }} />
                    <button className="rounded w-9 h-9 flex items-center justify-center text-lg text-white bg-[#B25FF3] hover:bg-[#63308B]" type="submit">
                        <MdSearch />
                    </button>
                </form>
                 */}

                {/** 페이지 이동 */}
                <div className="w-full flex flex-row items-center justify-center gap-2 mt-8" >
                    <PageShiftBtn icon={<MdKeyboardDoubleArrowLeft />} shift={-10} />
                    <PageShiftBtn icon={<MdKeyboardArrowLeft />} shift={-1} />
                    <div className="flex flex-row items-center gap-2" >
                        {pageRange?.map((n, index) => {
                            return (
                                <NumBtn index={n} key={index} />
                            );
                        })}
                    </div>
                    <PageShiftBtn icon={<MdKeyboardArrowRight />} shift={1} />
                    <PageShiftBtn icon={<MdKeyboardDoubleArrowRight />} shift={10} />
                </div>
            </div>
        </div>
    );
};

export default News;