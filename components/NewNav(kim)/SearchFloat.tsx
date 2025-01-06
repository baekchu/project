import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import useInitState from "@/zustand/InitState";
import toast from "react-hot-toast";
import {
    searchImgs, getRelatedSearches, getPopularKeywords, FKeyword
} from "../utility/SearchModule";
import useImgState from "@/zustand/ImgState";
import usePostState from "@/zustand/PostState";

import { MdOutlineSearch, MdArrowDropUp, MdArrowDropDown } from "react-icons/md";
import { HiMiniMinusSmall } from "react-icons/hi2";

interface SearchFloatProps {
    searchFloatOpen: boolean,
    setSearchFloatOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchFloat: React.FC<SearchFloatProps> = ({ searchFloatOpen, setSearchFloatOpen }) => {
    const [searchText, setSearchText] = useState<string>("");
    const { setSearchWord } = useInitState();

    // 반응형 크기
    const [isBig, setIsBig] = useState<boolean>(true);
    useEffect(() => {
        const handleResize = () => {
            setIsBig(window.innerWidth > 600);
        };

        window.addEventListener('resize', handleResize);
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        if (!searchFloatOpen) {
            // 폼 초기화
            setSearchText("");
        }
    }, [searchFloatOpen]);


    // 연관 검색어
    const [relativeWords, setRelativeWords] = useState<string[]>([]);
    const [focusRel, setFocusRel] = useState<number>(-1);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setFocusRel(-1);
        if (searchFloatOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [relativeWords, searchFloatOpen]);

    // 포커스 이동
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLButtonElement>) => {
        if (e.key === 'ArrowUp') {
            // 상단 키를 눌렀을 때
            e.preventDefault();
            setFocusRel((prevFocus) => Math.max(prevFocus - 1, -1));
        } else if (e.key === 'ArrowDown') {
            // 하단 키를 눌렀을 때
            e.preventDefault();
            setFocusRel((prevFocus) => Math.min(prevFocus + 1, relativeWords.length - 1));
        } else if (e.key === 'Escape') {
            setSearchFloatOpen(false);
        }
    };


    useEffect(() => {
        // 연관 검색어 업데이트
        const fetchRel = async () => {
            if (searchText) {
                const rels = await getRelatedSearches(searchText);
                if (rels.length > 0) setRelativeWords(rels);
            };
        };
        fetchRel();
    }, [searchText]);

    const [popularWords, setPopularWords] = useState<FKeyword[]>();

    useEffect(() => {
        // 진입 시 인기 검색어 업데이트
        const fetchPop = async () => {
            if (searchFloatOpen) {
                const p = await getPopularKeywords();
                if (p !== undefined) setPopularWords(p);
            }
        };
        fetchPop();
    }, [searchFloatOpen]);


    // 검색 함수
    const router = useRouter();
    const pathname = usePathname();
    const doSearch = async (text?: string) => {
        const forSearch = (text !== undefined) ? text : (focusRel === -1) ? searchText : relativeWords[focusRel];

        if (forSearch.trim() !== "") {
            setSearchWord(forSearch);
            if (pathname !== "/search") {
                router.push("/search");
            };

            setSearchFloatOpen(false);
        } else {
            toast.error("검색어를 입력하세요.")
        }
    };



    return (
        <>
            {searchFloatOpen && <>
                <div
                    className="fixed z-[11] w-full h-full bg-black opacity-30"
                    onClick={() => { setSearchFloatOpen(false) }}>
                </div>
                <div className="fixed flex flex-col w-full max-w-[700px] text-sm inset-x-1/2 -translate-x-1/2 z-[12] px-2"
                    onClick={(e) => { e.stopPropagation() }}>
                    {/** 검색어 입력란 */}
                    <form
                        className="mx-auto mt-2 w-full h-12 p-2 border border-neutral-200
                        flex flex-row items-center justify-between gap-2 bg-white shadow rounded-t-lg"
                        onSubmit={(e) => {
                            e.preventDefault();
                            doSearch();
                        }}>
                        <input type="text"
                            placeholder="검색어를 입력하세요"
                            onKeyDown={handleKeyDown}
                            value={searchText}
                            onChange={(e) => { setSearchText(e.target.value) }}
                            ref={inputRef}
                            className="flex-1 " />
                        <button className="rounded-full w-10 h-10 text-2xl text-white bg-[#B25FF3] hover:bg-[#63308B]
                            flex items-center justify-center" type="submit">
                            <MdOutlineSearch />
                        </button>
                    </form>

                    <div className={`flex ${isBig ? "flex-row" : "flex-col"} rounded-b-lg p-2 gap-x-2 gap-y-1 bg-white`}>
                        {/** 연관 검색어 */}
                        {(searchText !== "" || isBig) && (
                            <div className="flex flex-col gap-1 flex-1">
                                {relativeWords.length > 0 && relativeWords.map((rel, index) => {
                                    return (
                                        <button
                                            className={`text-sm p-1 hover:bg-neutral-100 rounded transition duration-150 text-start truncate ${focusRel === index ? 'bg-blue-200' : ''
                                                }`}
                                            onKeyDown={handleKeyDown}
                                            key={index}
                                            onClick={() => {
                                                doSearch();
                                            }}>
                                            {rel}
                                        </button>)
                                })}
                            </div>
                        )}

                        <div className="border-l mx-1 border-neutral-300" />
                        {/** 인기 검색어 */}
                        {(searchText === "" || isBig) && (
                            <div className={`flex flex-col w-full ${isBig && "max-w-[220px]"} gap-2 flex-1`}>
                                <div className="text-[#B25FF3] font-bold">
                                    인기 검색어
                                </div>
                                <div className="flex flex-col w-full h-full p-1 rounded border border-neutral-200">
                                    {popularWords?.length ? <>
                                        {popularWords.map((pop, index) => {
                                            return (
                                                <button className="flex flex-row items-center gap-2 p-1 w-full hover:bg-neutral-100"
                                                    key={index}
                                                    onClick={() => {
                                                        doSearch(pop.keyword);
                                                    }}>
                                                    <div className="font-bold">{index + 1}</div>
                                                    <div className="flex-1 text-start truncate">{pop.keyword}</div>
                                                    <div className="text-xs text-neutral-500">{pop.count}</div>
                                                </button>
                                            )
                                        })}
                                    </> : <div className="w-full h-[150px] flex items-center justify-center text-neutral-500 text-xs">
                                        인기 검색어가 없습니다.
                                    </div>}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </>}

        </>
    );
};

export default SearchFloat;