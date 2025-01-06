"use client"

import React, { useEffect, useState, useRef } from 'react';
import useImgState from '@/zustand/ImgState';
import Masonry from 'react-masonry-css';

import ShortPostBox from '@/components/Common(Kim)/BulletinCard/ShortPostCard';
import AuthorCard from '@/components/AuthorCard/AuthorCard';
import usePostState from '@/zustand/PostState';
import ImgCard from '@/components/Common(Kim)/ImgCard/ImgCard';
import { addKeywordCount, searchAuthors, searchImgs } from '@/components/utility/SearchModule';
import useInitState from '@/zustand/InitState';
import { useRouter } from "next/navigation";
import { FUserData } from '@/components/utility/UserDataModule';
import { getPosts } from '@/components/utility/BulletinModule';
import ImgArea from '@/components/Search(kim)/ImgArea';
import AuthorArea from '@/components/Search(kim)/AuthorArea';
import PostArea from '@/components/Search(kim)/PostArea';


const SearchPage = () => {
    const { setImgArray, imgArray, setFollowingImgArray } = useImgState();
    const [authorArray, setAuthorArray] = useState<FUserData[]>([]);
    const { postList, setPostList } = usePostState();
    const router = useRouter();

    // 페이지 렌더링
    const { searchWord } = useInitState();
    useEffect(() => {
        setImgArray([]);
        setFollowingImgArray([]);
        setPostList([]);
    }, []);


    // 데이터 관련

    useEffect(() => {
        const fetchDatas = async () => {
            if (searchWord) {
                router.replace(`/search?q=${searchWord}`);
                await addKeywordCount(searchWord);

                const i = await searchImgs(searchWord);
                setImgArray(i);

                const a = await searchAuthors(searchWord);
                if (a !== undefined) setAuthorArray(a);

                const p = await getPosts("전체", searchWord);
                setPostList(p);
            }
        };

        fetchDatas();
    }, [searchWord]);


    // 탭 관련
    const tabList = ["전체", "캔버스", "작가", "게시글"];
    const [tabNum, setTabNum] = useState<number>(0);
    const breakPointsObj = {
        default: 4,
        3000: 6,
        2000: 5,
        1200: 3,
        1000: 2,
        500: 1,
    };

    const borRef = useRef<HTMLDivElement>(null);
    const [borStart, setBorStart] = useState<number>(0);
    const [borLen, setBorLen] = useState<number>(10);
    useEffect(() => {
        if (borRef.current) {
            const buttons = borRef.current.children;

            // tabNum === index인 클래스명에 bor_{index}가 포함되어 있을 때 해당 컴포넌트의 x offset만 가져와 borStart에 설정
            for (let i = 0; i < buttons.length; i++) {
                const button = buttons[i] as HTMLElement;
                if (i === tabNum && button.classList.contains(`bor_${tabNum}`)) {
                    setBorStart(button.offsetLeft);
                    setBorLen(button.offsetWidth);
                    break;
                }
            }
        }
    }, [tabNum]);


    return (
        <>
            <div className="w-full flex flex-col items-center justify-center gap-2">
                <div className="flex flex-row items-center justify-center gap-1 h-12 w-full bg-purple-100">
                    <div className="flex flex-row items-center justify-center gap-1 w-full max-w-[1400px] px-2">
                        "{searchWord}"에 대한 검색결과입니다.
                    </div>
                </div>

                {/** 탭 선택 */}
                <div className="w-full flex flex-col max-w-[1400px] px-2">
                    <div className="w-full flex flex-row gap-2 relative" ref={borRef}>
                        {tabList.map((tab, index) => {
                            return (
                                <button className={`flex flex-row items-end gap-0.5 px-3 py-0.5 rounded hover:shadow bor_${index} truncate`}
                                    key={index}
                                    onClick={() => {
                                        if (index !== tabNum) setTabNum(index);
                                    }}>
                                    <div className={`${index === tabNum ? "font-bold text-[#B25FF3]" : ""}`} >
                                        {tab}
                                    </div>
                                    <div className="text-neutral-400 text-xs">
                                        {index === 0 && (imgArray.length + authorArray.length + postList.length)}
                                        {index === 1 && imgArray.length}
                                        {index === 2 && authorArray.length}
                                        {index === 3 && postList.length}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                    {/** 선택된 탭의 하단 테두리 */}
                    <div className="relative w-full border-b border-neutral-200 my-0.5">
                        <div className={`absolute border-b-4 border-[#B25FF3]`}
                            style={{
                                left: `${borStart}px`,
                                width: `${borLen}px`,
                                transition: 'left 0.2s ease, width 0.2s ease'
                            }} />
                    </div>
                </div>

                {/** 출력 부분 */}
                <div className="flex flex-col w-full max-w-[1400px] gap-8 px-2">
                    {(tabNum === 0 || tabNum === 1) && (
                        <ImgArea tabNum={tabNum} imgArray={imgArray} searchWord={searchWord} />)}
                    {tabNum === 0 && <div className="w-full border-b border-neutral-100" />}
                    {(tabNum === 0 || tabNum === 2) && (
                        <AuthorArea tabNum={tabNum} authorArray={authorArray} searchWord={searchWord} />)}
                    {tabNum === 0 && <div className="w-full border-b border-neutral-100" />}
                    {(tabNum === 0 || tabNum === 3) && (
                        <PostArea tabNum={tabNum} postList={postList} searchWord={searchWord} />)}
                </div>
            </div>
        </>
    );
}

export default SearchPage;