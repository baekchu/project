import React, { useEffect, useState, useRef } from 'react';
import {
    FPost, checkIsInsp, checkScrap,
    doReport, fullFormatTimestamp, getCommentCounts,
    getCommentIDs, getPopularCom, getPostInsp,
    getPostViews, leaveComment, switchPostInspirationState,
    viewPost,
} from '@/components/utility/BulletinModule';
import { userData } from '../UserData/userData';
import useLoginModal from '@/components/hooks/useLoginModal';
import usePostState from '@/zustand/PostState';
import toast from "react-hot-toast";
import { auth } from '@/config/firebase';

import { BiMessageAlt } from "react-icons/bi";
import { IoMdRefresh } from "react-icons/io";
import {
    AiOutlineBulb, AiFillBulb, AiOutlineEye,
    AiOutlineShareAlt, AiOutlinePaperClip,
    AiOutlineLeft, AiOutlineRight
} from "react-icons/ai";
import { PiWarningOctagonBold } from "react-icons/pi";
import PostComment from '@/components/Bulletin(Kim)/PostComment';
import { updateMissionProgress } from '@/components/utility/MissionModule';
import { addBulletinScore } from '@/components/utility/ScoringModule';
import { updateUserLog } from '@/components/utility/LogModule';


const BulletinCard = ({ postData, type }: { postData: FPost, type: "default" | "popular" }) => {
    const author = userData(postData.uid);
    const loginModal = useLoginModal();
    const { postIndex, setPostIndex, postList, selectedPostData,
         popPostList, postType } = usePostState();

    const [isInsp, setIsInsp] = useState<boolean>(false);
    const [insp, setInsp] = useState<string[]>([]);

    // url 조작 관련
    const updateURL = (id: string | undefined) => {
        const urlParams = new URLSearchParams(window.location.search);
        if (id !== undefined) {
            urlParams.set('id', id);

            const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
            window.history.pushState({}, '', newUrl);
        } else {
            const newUrl = window.location.pathname;
            window.history.pushState({}, '', newUrl);
        }
    };

    // 영감 버튼 클릭
    const inspirationBtnClicked = async () => {
        if (!auth.currentUser?.uid) {
            loginModal.onOpen();
        } else if (postData.objectID) {
            const res = await switchPostInspirationState(auth.currentUser?.uid, postData.objectID);
            if (res !== undefined) {
                setIsInsp(res);
                addBulletinScore(postData.objectID, "inspiration", !res);
                updateUserLog(auth.currentUser?.uid, "Bulletin", "inspired", postData.objectID, res);
                toast.success(`${res ? "게시글에 영감을 남겼습니다" : "영감을 취소했습니다"}`)
            };
            setInsp(await getPostInsp(postData.objectID));
        }
    };

    // 스크랩 관련
    const [isScrap, setIsScrap] = useState<boolean>(false);
    useEffect(() => {
        const fetchSc = async () => {
            if (postData?.objectID && auth.currentUser?.uid) {
                const ins = await checkIsInsp(auth.currentUser?.uid, postData.objectID);
                if (ins !== undefined) setIsInsp(ins);
                const sc = await checkScrap(auth.currentUser?.uid, postData?.objectID);
                setIsScrap(sc);
                setInsp(await getPostInsp(postData.objectID));
            };
            updateURL(postData?.objectID ?? undefined);
        }
        fetchSc();
    }, [postData.objectID]);
    const clickScrap = async () => {
        if (auth.currentUser?.uid && postData?.objectID) {
            const res = await updateUserLog(auth.currentUser?.uid, "Bulletin", "saved", postData.objectID, !isScrap);
            if (res !== undefined) {
                setIsScrap(res);
                toast.success(`${res ? "게시글을 저장했습니다" : "저장을 취소했습니다"}`);
            };
        }
    };


    // 댓글 관련
    const [isCommentLoad, setIsCommentLoad] = useState<boolean>(true);
    const [commList, setCommList] = useState<string[]>([]);
    const [views, setViews] = useState<number>(0);
    const [commCnt, setCommCnt] = useState<number>(0);
    const [refreshCool, setRefreshCool] = useState<number>(0);
    const fetchComm = async () => {
        setIsCommentLoad(true);
        setRefreshCool(30);
        if (postData?.objectID) {
            const d = await getCommentIDs(postData.objectID);
            setCommList(d);
            const v = await getPostViews(postData.objectID);
            setViews(v);
            const n = await getCommentCounts(postData.objectID);
            setCommCnt(n);
            setIsCommentLoad(false);
        }
    };

    useEffect(() => {
        // 새로고침 쿨타임
        let timer: NodeJS.Timeout;
        if (refreshCool > 0) {
            timer = setInterval(() => {
                setRefreshCool((prevRefreshCool) => prevRefreshCool - 1);
            }, 1000);
        }

        return () => {
            clearInterval(timer);
        };
    }, [refreshCool]);

    useEffect(() => {
        fetchComm();
    }, [postData.objectID]);

    // 인기 댓글 목록
    const [popList, setPopList] = useState<string[]>([]);
    useEffect(() => {
        const fetchPop = async () => {
            if (postData?.objectID) {
                const li = await getPopularCom(postData.objectID);
                setPopList(li);
                // 게시글 조회 시 미션 클리어
                if (auth.currentUser?.uid) {
                    updateMissionProgress(auth.currentUser?.uid, "weekly", 3);
                    updateUserLog(auth.currentUser?.uid, "Bulletin", "history", postData.objectID);
                }
            }
        };
        fetchPop();
    }, [postData?.objectID]);

    // 댓글 입력 관리
    const [newCom, setNewCom] = useState<string>("");
    const handleCom = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (e.target.value.length <= 300) {
            setNewCom(e.target.value);
        }
    };
    const submitCom = async () => {
        if (auth.currentUser?.uid) {
            if (newCom.trim() !== "" && postData?.objectID && confirm("댓글을 등록하겠습니까?")) {
                await leaveComment(auth.currentUser?.uid, newCom, postData?.objectID);
                // 댓글 등록 시 미션 클리어
                await updateMissionProgress(auth.currentUser?.uid, "weekly", 1);
                addBulletinScore(postData.objectID, "comment");
                setNewCom("");
                await fetchComm();
                handleResizeHeight();
                toast.success("댓글을 등록했습니다")
            }
        } else {
            loginModal.onOpen();
        }
    };

    const postRef = useRef<HTMLDivElement>(null);
    const scrollToTop = (element: HTMLElement | null) => {
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth', // 스무스한 스크롤 효과
                block: 'start',     // 요소의 상단으로 스크롤
            });
        }
    };

    // 이전글 다음글 관리
    const movePost = (moveTo: "before" | "next") => {
        if (postIndex === undefined) return;
        if (moveTo === "before") {
            if (postIndex > 0) {
                setPostIndex(postIndex - 1, type);
                if (postList[postIndex - 1]?.objectID) {
                    viewPost(postList[postIndex - 1]?.objectID);
                    scrollToTop(postRef.current);
                }
            } else {
                toast.error("처음 게시글입니다");
            }
        } else {
            const len = (postType === "default") ? postList.length : popPostList.length;
            if (postIndex < len - 1) {
                setPostIndex(postIndex + 1, type);
                if (postList[postIndex + 1]?.objectID) {
                    viewPost(postList[postIndex + 1]?.objectID);
                    scrollToTop(postRef.current);
                }
            } else {
                toast.error("마지막 게시글입니다");
            }
        }
    };

    // 게시글 신고
    const reportPost = async () => {
        if (auth.currentUser?.uid && postData.objectID) {
            if (confirm("이 게시글을 신고하시겠습니까?")) {
                await doReport(auth.currentUser?.uid, postData.objectID);
            }
        }
    };

    // 댓글란 크기조절
    const textarea = useRef<HTMLTextAreaElement | null>(null);
    const handleResizeHeight = () => {
        if (textarea.current) {
            textarea.current.style.height = "auto";
            textarea.current.style.height = textarea.current.scrollHeight + "px";
        };
    };

    // 보드가 열려있을 때 esc로 닫을 수 있게끔
    useEffect(() => {
        if (selectedPostData) {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    setPostIndex(undefined, "default");
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [selectedPostData]);


    return (
        <>
            {postData && (
                <>
                    <div className="w-full flex flex-col items-center gap-4" ref={postRef}>
                        <div className="w-full flex flex-col">
                            <div className="w-full flex flex-row justify-between">
                                <div className="flex flex-col text-lg font-bold">
                                    {postData.title}
                                </div>
                            </div>

                            {/** 업로드 시간과 지표들 */}
                            <div className="w-full flex flex-row items-center gap-4 text-sm">
                                {fullFormatTimestamp(postData.time)}
                                <div className="flex flex-row items-center gap-2">
                                    <div className="flex flex-row items-center gap-0.5">
                                        <div className="text-base"><AiOutlineEye /></div>
                                        <div>{views}</div>
                                    </div>
                                    <div className="flex flex-row items-center gap-0.5">
                                        <div className="text-base"><BiMessageAlt /></div>
                                        <div>{commCnt}</div>
                                    </div>
                                    <div className="flex flex-row items-center gap-0.5">
                                        <div className={`text-base ${isInsp ? "text-neutral-500" : ""}`}>
                                            {isInsp ? <AiFillBulb /> : <AiOutlineBulb />}
                                        </div>
                                        <div>{insp.length}</div>
                                    </div>
                                </div>
                            </div>

                            {/** 태그 */}
                            <div className="w-full flex flex-row gap-1 items-center text-sm py-2 truncate">
                                <div className="bg-[#B25FF3] text-white rounded-full px-2" >#{postData.category}</div>
                                {postData.tags !== undefined && postData.tags.map((tag, index) => (
                                    <div className="bg-neutral-700 text-white rounded-full px-2" key={index}>#{tag}</div>
                                ))}
                            </div>
                        </div>

                        {/** 내용 */}
                        <div className="w-full text-sm mt-6">
                            <div dangerouslySetInnerHTML={{ __html: postData.desc }} />
                        </div>

                        {/** 영감 버튼 */}
                        <button className={`flex flex-row items-center justify-center rounded-full mb-2 w-14 h-14 text-2xl
                                ${isInsp ? `bg-[#B25FF3] hover:bg-[#63308B] text-white` 
                                : "hover:bg-neutral-200 border border-[#B25FF3] text-[#B25FF3]"}`}
                            onClick={() => { inspirationBtnClicked() }}>
                            {isInsp ? <AiFillBulb /> : <AiOutlineBulb />}
                        </button>

                        {/** 프로필 및 네이게이션 */}
                        <div className="w-full flex flex-row justify-between items-end">
                            <div className="flex flex-row items-center gap-2">
                                <span className="hover:underline">{author.avatar("nickname")}</span>
                                {author.followBtn()}
                            </div>
                            {/** 글 네비게이션 */}
                            <div className="flex flex-col p-1 gap-1 items-center justify-between bg-[#F3E4FC] rounded">
                                <div className="flex flex-row items-center justify-center gap-1 text-xl">
                                    {/** 영감 */}
                                    <button
                                        className={`flex flex-row items-center justify-center rounded border border-[#B25FF3] w-7 h-7
                                         ${isInsp ? "bg-[#B25FF3] text-white hover:bg-[#63308B]" : "bg-white text-[#B25FF3] hover:bg-neutral-200"}`}
                                        onClick={inspirationBtnClicked}>
                                        {isInsp ? <AiFillBulb /> : <AiOutlineBulb />}
                                    </button>
                                    {/** 공유하기 */}
                                    <button className="flex flex-row items-center justify-center rounded border border-[#B25FF3] w-7 h-7 bg-white text-[#B25FF3] hover:bg-neutral-200"
                                        onClick={async () => {
                                            const currentURL = window.location.href;
                                            await navigator.clipboard.writeText(currentURL);
                                            // 공유 시 미션 클리어
                                            if (auth.currentUser?.uid) updateMissionProgress(auth.currentUser?.uid, "weekly", 4);
                                            addBulletinScore(postData?.objectID ?? "", "share");
                                            toast.success(`링크가 클립보드에 복사되었습니다.`);
                                        }}>
                                        <AiOutlineShareAlt />
                                    </button>
                                    {/** 신고하기 */}
                                    <button className="flex flex-row items-center justify-center rounded border border-[#B25FF3] w-7 h-7 bg-white text-[#B25FF3] hover:bg-neutral-200"
                                        onClick={() => { reportPost() }}>
                                        <PiWarningOctagonBold />
                                    </button>
                                    {/** 스크랩하기 */}
                                    <button className={`flex flex-row items-center justify-center rounded border 
                                    border-[#B25FF3] w-7 h-7 
                                    ${isScrap ? "bg-[#B25FF3] text-white hover:bg-[#63308B]" : "bg-white text-[#B25FF3] hover:bg-neutral-200"}
                                    `}
                                        onClick={clickScrap}>
                                        <AiOutlinePaperClip />
                                    </button>
                                </div>
                                {/** 이전글 다음글 이동 */}
                                <div className="flex flex-row items-center gap-1">
                                    <button className="flex flex-row items-center justify-center rounded w-[60px] h-7 text-white bg-[#B25FF3] hover:bg-[#63308B]"
                                        onClick={() => { movePost("before") }}>
                                        <AiOutlineLeft />
                                        <div className="text-xs">이전글</div>
                                    </button>
                                    <button className="flex flex-row items-center justify-center rounded w-[60px] h-7 text-white bg-[#B25FF3] hover:bg-[#63308B]"
                                        onClick={() => { movePost("next") }}>
                                        <div className="text-xs">다음글</div>
                                        <AiOutlineRight />
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="w-full border-b border-neutral-300" />

                        {/** 댓글 */}
                        <div className="w-full p-2 flex flex-col gap-1">
                            <div className="flex flex-row gap-1 items-center justify-between">
                                <div className="flex flex-row items-center gap-1">
                                    <div className="font-bold">댓글</div>
                                    <div className="text-sm text-neutral-600">{commCnt}</div>
                                </div>
                                <div className="flex flex-row items-end gap-1">
                                    <div className="text-neutral-500 text-sm">
                                        {refreshCool > 0 ? `${refreshCool}s` : "새로고침"}
                                    </div>
                                    <button className={`flex items-center justify-center w-5 h-5 rounded border border-[#B25FF3] text-[#B25FF3]
                                     ${(refreshCool > 0 || isCommentLoad) ? "bg-neutral-200" : "bg-white hover:bg-neutral-200"}`}
                                        disabled={refreshCool > 0 || isCommentLoad}
                                        onClick={async () => { fetchComm() }}>
                                        <IoMdRefresh />
                                    </button>
                                </div>
                            </div>
                            {/** 댓글 입력 박스 */}
                            <form className="w-full h-fit bg-neutral-200 rounded flex flex-row gap-1 p-1 mb-6"
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    submitCom();
                                }}>
                                <textarea className="bg-white min-h-[60px] rounded flex flex-row flex-1 resize-none text-sm"
                                    ref={textarea}
                                    onInput={handleResizeHeight}
                                    value={newCom}
                                    onChange={(e) => { handleCom(e) }}
                                    placeholder="댓글을 입력하세요" />
                                <div className="flex flex-col justify-between">
                                    <div className="text-xs">
                                        {newCom.length}/300
                                    </div>
                                    <button
                                        className="rounded bg-[#B25FF3] hover:bg-[#63308B] text-sm
                                     text-white flex flex-row items-center justifycenter px-3 py-1"
                                        type="submit">
                                        등록하기
                                    </button>
                                </div>
                            </form>
                        </div>

                        {isCommentLoad ? <div className="w-full h-24 flex items-center justify-center text-sm animate-pulse">
                            댓글 불러오는중...
                        </div> : <>
                            {/** 인기 댓글 */}
                            <div className="w-full flex flex-col bg-[#F3E4FC] rounded px-2">
                                {popList && popList.map((pop, index) => {
                                    return (<PostComment
                                        docID={postData.objectID ?? ""}
                                        commentID={pop}
                                        isPop={true}
                                        fetchComm={fetchComm}
                                        key={`pop_${pop}_${index}`}
                                    />);
                                })}
                            </div>

                            {/** 전체 댓글 */}
                            <div className="w-full flex flex-col px-2">
                                {commList && commList.map((com, index) => {
                                    return (<PostComment
                                        docID={postData.objectID ?? ""}
                                        commentID={com}
                                        isPop={false}
                                        fetchComm={fetchComm}
                                        key={`${com}_${index}`}
                                    />);
                                })}
                            </div>
                        </>}
                    </div>
                </>
            )}
        </>)
};

export default BulletinCard;