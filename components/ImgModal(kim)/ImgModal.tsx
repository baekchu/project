"use client"

import React, { useEffect, useState, memo, useRef, useCallback } from 'react';
import IconBtn from './IconBtn';
import useImgState from '@/zustand/ImgState';
import { auth } from '@/config/firebase';
import {
    Comment, getComments, checkIsLike,
    toggleInspiration, addComment, timestampToDate,
    deleteComment, checkIsCommentLike, reportContent,
    checkSaved, getImgData, FImgData, updateView, deleteArtwork
} from '../utility/ImgDataModule';
import {
    FUserData, FUserTier, checkFollowing,
    getUserData, getUserTierData, toggleFollow
} from '../utility/UserDataModule';
import { toast } from "react-hot-toast";
import useLoginModal from "../hooks/useLoginModal";

import {
    IoMdClose, IoIosArrowBack, IoIosArrowForward
} from "react-icons/io";
import { IoEyeOutline } from "react-icons/io5";
import {
    MdLightbulbOutline, MdArrowUpward, MdReportGmailerrorred,
    MdOutlineShare, MdLightbulb, MdOutlineImage,
    MdEdit
} from "react-icons/md";
import { IoTrashSharp } from "react-icons/io5";
import { BiMessage } from "react-icons/bi";
import { GoPaperclip } from "react-icons/go";
import { updateMissionProgress } from '../utility/MissionModule';
import { useRouter } from 'next/navigation';
import { getRelativeImgs, getUserArtworks } from '../utility/CanvasModule';

import { setNewAlarm } from '../utility/AlarmModule';
import { addArtworkScore } from '../utility/ScoringModule';
import { updateUserLog } from '../utility/LogModule';
import useImgUploadState from "@/zustand/ImgUploadState";

const ImgModal = () => {
    const loginModal = useLoginModal();
    const router = useRouter();

    // 화면 스크롤 이동 관련
    const topRef = useRef<HTMLDivElement>(null);
    const scrollToTop = () => {
        if (topRef.current) {
            topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };
    const messageRef = useRef<HTMLTextAreaElement | null>(null);
    const focusToMessage = () => {
        if (messageRef.current) {
            messageRef.current.focus();
        }
    };
    const imgTop = useRef<HTMLDivElement>(null);
    const scrollToImgTop = () => {
        if (imgTop.current) {
            imgTop.current.scrollIntoView({ behavior: 'smooth', block: "start" });
        }
    };

    const {
        isImgModalOpen, setImgModalOpen, imgData, imgIndex,
        setImgIndex, imgArray, setImgArray, imgType, followingImgArray
    } = useImgState();

    const { setIsImgUploadOpen } = useImgUploadState(); // 수정창 열기

    // esc 동작
    useEffect(() => {
        if (isImgModalOpen) {
            const handleKeyDown = (event: KeyboardEvent) => {
                if (event.key === 'Escape') {
                    setImgModalOpen(false);
                }
            };
            window.addEventListener('keydown', handleKeyDown);
            return () => {
                window.removeEventListener('keydown', handleKeyDown);
            };
        }
    }, [isImgModalOpen]);

    // 화면 폭 및 배치 관련
    const [isBig, setIsBig] = useState<boolean>(false);
    useEffect(() => {
        const handleResize = () => {
            setIsBig(window.innerWidth > 800);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // 데이터 관련
    const [comments, setComments] = useState<Comment[]>([]);

    // 댓글 정보
    const fetchComments = async () => {
        const coms: Comment[] = (imgData?.objectID) ? await getComments(imgData.objectID) : [];
        setComments(coms);
    };

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
    const readURL = async () => {
        const urlParams = new URLSearchParams(window.location.search);
        const pageId = urlParams.get('id');
        if (pageId && imgArray.length == 0) {
            // 다른 창에서 링크로 들어왔을 때
            const d = await getImgData(pageId);
            if (d) {
                await setImgArray([d]);
                setImgIndex(0, "default");
            }
        }
    };
    const copyURL = () => {
        const newUrl = `${window.location.origin}${window.location.pathname}?id=${imgData?.objectID}`;
        navigator.clipboard.writeText(newUrl)
            .then(() => {
                toast.success("링크가 클립보드에 복사되었습니다.");
            })
            .catch((err) => {
                console.error('클립보드 복사 실패:', err);
            });

        // 공유 시 미션 클리어
        if (auth.currentUser?.uid) {
            updateMissionProgress(auth.currentUser?.uid, "weekly", 4);
            if (imgData?.objectID) addArtworkScore(imgData.objectID, "share");
        };
    };

    // 페이지 데이터 조작 관련
    useEffect(() => {
        readURL();
    }, []);

    useEffect(() => {
        // 모달 창이 닫히면 정보 초기화
        if (!isImgModalOpen) {
            setImgIndex(undefined, "default");
        }
    }, [isImgModalOpen]);

    useEffect(() => {
        // 이미지 데이터 변경 시 설정값
        if (imgData?.objectID) {
            updateView(imgData.objectID);
            const fetchImgData = async () => {
                await fetchComments();
                setImgModalOpen(true);
                updateURL(imgData.objectID);
            };
            fetchImgData();

            if (auth.currentUser?.uid) {
                // 작품 감상 미션 + 1
                updateMissionProgress(auth.currentUser?.uid, "daily", 1);
                addArtworkScore(imgData.objectID, "view");
                updateUserLog(auth.currentUser?.uid, "Artwork", "history", imgData.objectID);
            } else {
                updateURL(undefined);
            }
        } else {
            updateURL(undefined);
        }

    }, [imgData, imgIndex]);


    // 영감 및 저장
    const [isInsp, setIsInsp] = useState<boolean>(false);
    const [isSaved, setIsSaved] = useState<boolean>(false);

    useEffect(() => {
        if (imgData?.objectID) {
            const fetchInsp = async () => {
                if (auth.currentUser?.uid) {
                    const d = await checkIsLike(auth.currentUser?.uid, imgData.objectID);
                    if (d !== undefined) setIsInsp(d);
                    const s = await checkSaved(auth.currentUser?.uid, imgData.objectID);
                    if (s !== undefined) setIsSaved(s);
                } else {
                    setIsInsp(false);
                    setIsSaved(false);
                }
            };
            fetchInsp();
        };
    }, [imgData]);

    const toggleInsp = async () => {
        if (imgData?.objectID && auth.currentUser?.uid) {
            const insp = await toggleInspiration(imgData?.objectID, auth.currentUser?.uid);
            if (insp !== undefined) {
                setIsInsp(insp);
                // 영감 반응 미션
                await updateMissionProgress(auth.currentUser?.uid, "weekly", 0, !insp);
                if (insp) {
                    setNewAlarm(auth.currentUser?.uid, imgData.uid, "inspirate", `/?id=${imgData.objectID}`);
                    addArtworkScore(imgData.objectID, "inspiration");
                } else {
                    addArtworkScore(imgData.objectID, "inspiration", true);
                }
                updateUserLog(auth.currentUser?.uid, "Artwork", "inspired", imgData.objectID, insp);
                toast.success(`${insp ? "작품에 영감을 남겼습니다" : "영감을 취소했습니다"}`);
            }
        };
    };

    const toggleSaved = async () => {
        if (imgData?.objectID && auth.currentUser?.uid) {
            const s = await updateUserLog(auth.currentUser?.uid, "Artwork", "saved", imgData.objectID, !isSaved);
            if (s !== undefined) {
                setIsSaved(s);
                toast.success(`${s ? "작품을 저장했습니다" : "저장을 취소했습니다"}`)
            }
        }
    };

    // 작가 정보
    const [author, setAuthor] = useState<FUserData>();
    const [tier, setTier] = useState<FUserTier>();
    useEffect(() => {
        if (imgData?.uid) {
            const fetchUserD = async () => {
                const ud = await getUserData(imgData.uid);
                setAuthor(ud);
                const td = await getUserTierData(ud.exp);
                setTier(td);
            };
            fetchUserD();
        }
    }, [imgData]);


    /** 컴포넌트 인덱스  **********************/
    /**
     * 1. 이미지        ImgBlock
     * 2. 관련 작품     RelativeBlock
     * 3. 작품 정보     InfoBlock
     * 4. 유저 정보     UserBlock
     * 5. 댓글          CommentBlock
     */

    // 1. 이미지 출력 부분
    const ImgBlock = () => {
        return (
            <div className="w-full h-fit bg-white rounded p-2 relative" ref={imgTop}>
                {/** 이미지 출력창 */}
                <div className="flex flex-col gap-4 w-full h-full overflow-auto">
                    {imgData?.images.map((url, index) => {
                        return (
                            <img className="w-full h-auto object-contain" src={url} alt="" key={index} />
                        );
                    })}
                </div>
            </div>
        );
    };

    // 2. 관련 작품 출력 부분
    const RelativeBlock = () => {
        const [relImgs, setRelImgs] = useState<FImgData[]>([]);
        const [relLoad, setRelLoad] = useState<boolean>(false);
        useEffect(() => {
            const fetchRel = async () => {
                setRelLoad(true);
                if (imgData) {
                    const ims = await getRelativeImgs(imgData.objectID, imgData.category, imgData.tags);
                    setRelImgs(ims);
                }
                setRelLoad(false);
            };
            fetchRel();
        }, [imgData]);

        return (
            <>
                {relImgs.length > 0 && (
                    <div className='w-full rounded bg-white p-2 flex flex-col gap-2'>
                        <div className='w-full font-bold'>관련 작품</div>
                        <div className='w-full flex flex-row flex-wrap gap-2 overflow-x-auto'>

                            {relLoad ? (
                                <div className="m-auto h-20 flex items-center justify-center animate-pulse text-sm">
                                    불러오는 중...
                                </div>
                            ) : (<>
                                {/* 이미지들 */}
                                {relImgs.map((data, index) => (
                                    <div
                                        key={index}
                                        className={`max-w-[200px] aspect-square rounded overflow-hidden relative
                                    transition-opacity duration-200 opacity-100 hover:opacity-80 cursor-pointer`}
                                    >
                                        {data.images.length > 1 &&
                                            <div className="absolute right-2 top-2 rounded px-1 flex flex-row gap-1 items-center bg-neutral-700 opacity-70 text-white">
                                                <MdOutlineImage />
                                                {data.images.length}
                                            </div>}

                                        <img
                                            className='w-full h-full object-cover'
                                            src={data.images[0]}
                                            alt={data.title}
                                            onClick={async () => {
                                                await setImgArray(relImgs);
                                                setImgIndex(index, "default");
                                                scrollToTop();
                                                if (isBig) {
                                                    scrollToImgTop();
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                            </>)}
                        </div>
                    </div>
                )}
            </>
        );
    };

    // 3. 작품 정보 출력 부분
    const InfoBlock = ({ isTop }: { isTop: boolean }) => {
        return (
            <div className='w-full rounded bg-white p-4 flex flex-col gap-1' ref={isTop ? topRef : null}>
                {/** 상단 제목 및 지표들 */}
                <div className='w-full flex flex-row items-center justify-between'>
                    <div className="font-bold">
                        {imgData?.title}
                    </div>
                    <div className="flex flex-row gap-2 px-2 py-0.5 rounded-full bg-neutral-200 items-center">
                        <div className="flex flex-row gap-1 items-center">
                            <div>
                                <MdLightbulbOutline />
                            </div>
                            <div className="text-sm">
                                {imgData?.insp.length}
                            </div>
                        </div>
                        <div className="flex flex-row gap-1 items-center">
                            <div>
                                <IoEyeOutline />
                            </div>
                            <div className="text-sm">
                                {imgData?.views}
                            </div>
                        </div>
                        <div className="flex flex-row gap-1 items-center">
                            <div>
                                <BiMessage />
                            </div>
                            <div className="text-sm">
                                {comments.length}
                            </div>
                        </div>
                    </div>
                </div>
                {/** 중단 내용 */}
                <div className="w-full flex flex-col gap-2">
                    <div className="w-full min-h-[60px] text-sm">
                        {imgData?.desc}
                    </div>
                    <div className="text-neutral-500 text-sm">
                        {imgData?.time && timestampToDate(imgData?.time)}
                    </div>
                    <div className="w-full flex flex-row gap-1.5 text-sm flex-wrap">
                        <div className="rounded-full px-2 bg-[#B25FF3] text-white ">#{imgData?.category}</div>
                        {imgData?.tags.map((tag, index) => {
                            return (
                                <div className="rounded-full px-2 bg-neutral-600 text-white" key={index}>#{tag}</div>
                            );
                        })}
                    </div>
                    <div className="w-full border-b border-neutral-300 mt-1" />
                    <div className="w-full flex flex-row justify-between items-center text-2xl gap-2 -mb-1">
                        {/** 영감 */}
                        <button className={`rounded w-12 h-12 flex items-center justify-center hover:bg-neutral-200
                        ${isInsp ? "text-[#B25FF3]" : ""}`} onClick={() => { toggleInsp() }}>
                            {isInsp ? <MdLightbulb /> : <MdLightbulbOutline />}
                        </button>
                        {/** 댓글 */}
                        <button className={`rounded w-12 h-12 flex items-center justify-center
                        ${!imgData?.isCommentAble ? "text-neutral-400" : "hover:bg-neutral-200"}`}
                            disabled={!imgData?.isCommentAble}
                            onClick={() => focusToMessage()}>
                            <BiMessage />
                        </button>
                        {/** 공유 */}
                        <button className="rounded w-12 h-12 flex items-center justify-center hover:bg-neutral-200"
                            onClick={() => {
                                copyURL();
                            }}>
                            <MdOutlineShare />
                        </button>
                        {/** 신고 (본인 작품일 경우 수정 버튼) */}
                        {auth.currentUser?.uid === imgData?.uid ?
                            <button
                                className="rounded w-12 h-12 flex items-center justify-center hover:bg-neutral-200"
                                onClick={() => {
                                    setIsImgUploadOpen(true, imgData);
                                    setImgModalOpen(false);
                                }}>
                                <MdEdit />
                            </button> :
                            <button
                                className="rounded w-12 h-12 flex items-center justify-center hover:bg-neutral-200"
                                onClick={async () => {
                                    if (auth.currentUser?.uid && imgData?.objectID) {
                                        if (confirm("해당 작품을 신고하겠습니까?")) {
                                            await reportContent(auth.currentUser?.uid, imgData?.objectID);
                                        }
                                    } else {
                                        toast.error("로그인이 필요합니다");
                                        loginModal.onOpen();
                                    }
                                }}>
                                <MdReportGmailerrorred />
                            </button>}
                        {/** 저장, 본인일 경우 삭제 버튼  */}
                        {auth.currentUser?.uid === imgData?.uid ?
                            <button className={`rounded w-12 h-12 flex items-center justify-center hover:bg-neutral-200 ${isSaved && "text-[#B25FF3]"}`}
                                onClick={async () => {
                                    if (confirm("작품을 삭제하겠습니까? 이 작업은 되돌릴 수 없습니다.") && imgData?.objectID) {
                                        const res = await deleteArtwork(auth.currentUser?.uid ?? "", imgData.objectID, imgData.images);
                                        if (res) {
                                            toast.success("작품을 삭제했습니다.");
                                            setImgModalOpen(false);
                                        } else {
                                            toast.error("작품 삭제에 실패했습니다");
                                        }
                                    }
                                }}>
                                <IoTrashSharp />
                            </button> : <button className={`rounded w-12 h-12 flex items-center justify-center hover:bg-neutral-200 ${isSaved && "text-[#B25FF3]"}`}
                                onClick={() => { toggleSaved() }}>
                                <GoPaperclip />
                            </button>}
                    </div>
                </div>
            </div>
        );
    };

    // 4. 작가 정보
    const UserBlock = ({ isTop }: { isTop: boolean }) => {
        const [follow, setFollow] = useState<boolean>(false);
        useEffect(() => {
            const fetchFol = async () => {
                if (author?.uid && auth.currentUser?.uid) {
                    const f = await checkFollowing(auth.currentUser?.uid, author.uid);
                    setFollow(f);
                };
            };
            fetchFol();
        }, []);

        // 팔로우 상태 변경
        const toggleFol = async () => {
            if (author?.uid && auth.currentUser?.uid) {
                const res = await toggleFollow(auth.currentUser?.uid, author.uid);
                if (res !== undefined) {
                    setFollow(res);

                    if (res && imgData?.uid) {
                        setNewAlarm(auth.currentUser?.uid, imgData.uid, "follow", `/pageUser?uid=${auth.currentUser?.uid}`);
                    }
                };
            } else if (!auth.currentUser) {
                toast.error("로그인이 필요합니다.");
                loginModal.onOpen();
            }
        };

        // 유저의 작품들
        const [userArtLoad, setUserArtLoad] = useState<boolean>(true);
        const [userArts, setUserArts] = useState<FImgData[]>([]);
        useEffect(() => {
            const fetchArts = async () => {
                if (author?.uid) {
                    const arts = await getUserArtworks(author.uid);
                    setUserArts(arts);
                }
                setUserArtLoad(false);
            };
            fetchArts();
        }, [author?.uid]);


        const [showArr, setShowArr] = useState<boolean>(false);
        const containerRef = useRef<HTMLDivElement>(null);
        // 화살표로 작품창 이동
        const moveBox = useCallback((direction: "left" | "right") => {
            // 이동할 픽셀 수
            const moveAmount = 300; // 이동할 픽셀 수

            // 현재 이미지 상자의 스크롤 위치를 가져옴
            const container = containerRef.current;
            if (container == null) return;
            const currentScrollLeft = container.scrollLeft;

            // 방향에 따라 새로운 스크롤 위치를 계산
            let newScrollLeft;
            if (direction === "left") {
                newScrollLeft = currentScrollLeft - moveAmount;
            } else {
                newScrollLeft = currentScrollLeft + moveAmount;
            }

            // 새로운 스크롤 위치를 설정
            container.scrollTo({
                left: newScrollLeft,
                behavior: "smooth", // 부드러운 스크롤을 위해 추가
            });
        }, [containerRef]);


        return (
            <div className='w-full p-4 rounded bg-white flex flex-col gap-2' ref={isTop ? topRef : null}>
                {/** 유저 정보 */}
                <div className="w-full flex flex-row justify-between items-center gap-1">
                    <div className="flex-1 flex flex-row items-center gap-2">
                        <img className="w-9 h-9 rounded-full object-cover"
                            src={author?.profImg} alt="" />
                        <div className="flex-1 flex flex-col">
                            <div className="flex flex-row gap-1 items-center">
                                <div className="font-bold hover:underline cursor-pointer"
                                    onClick={() => {
                                        router.push(`/userPage?uid=${author?.uid}`);
                                        setImgModalOpen(false);
                                    }}>
                                    {author?.nickname}
                                </div>
                                {tier?.sign}
                            </div>
                            <div className="text-xs text-neutral-500">
                                {`팔로워 ${(author?.follower || []).length}명`}
                            </div>
                        </div>
                    </div>
                    {(auth.currentUser?.uid !== author?.uid) && (
                        <button className={`rounded font-bold text-sm px-3 py-0.5
                        ${follow ? "bg-[#B25FF3] hover:bg-[#63308B] text-white"
                                : "bg-white hover:bg-neutral-200 border border-[#B25FF3] text-[#B25FF3]"}`}
                            onClick={() => { toggleFol() }}>
                            {follow ? "팔로잉" : "팔로우"}
                        </button>
                    )}
                </div>

                {/** 유저 작품 */}
                {isBig && (<>
                    {userArtLoad ? <div className='w-full h-24 flex items-center justify-center text-sm animate-pulse bg-neutral-200'>
                        불러오는 중...
                    </div> : <div className="w-full relative"
                        onMouseEnter={() => setShowArr(true)}
                        onMouseLeave={() => setShowArr(false)}>
                        {/** 스크롤 화살표 */}
                        <button className={`absolute -left-2 top-1/2 -translate-y-1/2 w-9 h-9 text-lg rounded-full shadow 
                        flex items-center justify-center text-[#B25FF3] bg-white hover:bg-neutral-200 transition
                        ${showArr ? "opacity-90" : "opacity-0"} transition-opacity`}
                            onClick={(e) => {
                                moveBox('left');
                            }} >
                            <IoIosArrowBack />
                        </button>
                        <button className={`absolute -right-2 top-1/2 -translate-y-1/2 w-9 h-9 text-lg rounded-full shadow 
                        flex items-center justify-center text-[#B25FF3] bg-white hover:bg-neutral-200 transition
                        ${showArr ? "opacity-90" : "opacity-0"}`}
                            onClick={(e) => {
                                moveBox('right');
                            }} >
                            <IoIosArrowForward />
                        </button>

                        {/** 유저가 등록한 이미지 */}
                        {<div className="w-full p-1 bg-neutral-100 flex flex-row items-center gap-1 overflow-x-auto"
                            ref={containerRef}>
                            {userArts.map((art, index) => {
                                return (
                                    <div className="w-auto h-48 cursor-pointer flex-shrink-0" key={index} onClick={() => {
                                        setImgArray(userArts);
                                        setImgIndex(index, "default");
                                        if (isBig) {
                                            scrollToImgTop();
                                        } else {
                                            scrollToTop();
                                        }
                                    }}>
                                        <img src={art.images[0]} alt={art.title} className="rounded h-full
                            transition-opacity duration-200 opacity-100  aspect-square object-cover" />
                                    </div>
                                )
                            })}
                        </div>}
                    </div>}
                </>)}
            </div>
        );
    };

    // 5. 댓글
    const CommentBlock = () => {
        const [newCom, setNewCom] = useState("");
        const [isCommentLoad, setIsCommentLoad] = useState<boolean>(true);
        const commentSubmit = async () => {
            if (newCom.trim() !== "" && imgData?.objectID) {
                if (auth.currentUser?.uid) {
                    if (confirm("댓글을 등록하시겠습니까?")) {
                        const res = await addComment(auth.currentUser?.uid, imgData?.objectID, newCom);
                        if (res) {
                            // 댓글 등록 시 미션 클리어
                            await updateMissionProgress(auth.currentUser?.uid, "weekly", 1);
                            toast.success("댓글이 등록되었습니다");
                            setNewCom("");
                            fetchComments();

                            setNewAlarm(auth.currentUser?.uid, imgData.uid, "comment", `/?id=${imgData.objectID}`);
                            addArtworkScore(imgData.objectID, "comment");
                        }
                    } else {
                        focusToMessage();
                    }
                } else {
                    loginModal.onOpen();
                }
            };
        };

        const [comData, setComData] = useState<{ comment: Comment, commenter: FUserData, comTier: FUserTier }[]>([]);
        useEffect(() => {
            const fetchCommentsData = async () => {
                const data = [];
                if (comments) {
                    for (const comment of comments) {
                        const commenter = await getUserData(comment.uid) as FUserData;
                        const comTier = await getUserTierData(commenter.exp);
                        const newData = {
                            comment: comment,
                            commenter: commenter,
                            comTier: comTier,
                        }
                        data.push(newData);
                    }
                    setComData(data);
                    setIsCommentLoad(false);
                }
            };

            fetchCommentsData();
        }, [comments]);

        const delComment = async (comID: string) => {
            if (confirm("댓글을 삭제하시겠습니까?") && auth.currentUser?.uid && imgData?.objectID) {
                const res = await deleteComment(auth.currentUser?.uid, imgData?.objectID, comID);
                if (res) {
                    // 댓글 삭제 시 미션 - 1
                    updateMissionProgress(auth.currentUser?.uid, "weekly", 1, true);
                    addArtworkScore(imgData.objectID, "comment", true);
                    toast.success("댓글이 삭제되었습니다");
                    fetchComments();
                }
            }
        };

        const reportComment = async () => {
            if (confirm("댓글을 신고하시겠습니까?") && auth.currentUser?.uid) {

            }
        };

        interface InnerProps {
            com: { comment: Comment, commenter: FUserData, comTier: FUserTier },
            index: number,
        }
        const InnerComment: React.FC<InnerProps> = ({ com, index }) => {
            const isMine: boolean = (auth.currentUser?.uid !== "") && (auth.currentUser?.uid === com.comment.uid);
            const [isInsp, setIsInsp] = useState<boolean>(false);
            const fetchInsp = async () => {
                if (auth.currentUser?.uid && imgData?.objectID) {
                    const res = await checkIsCommentLike(auth.currentUser?.uid, imgData?.objectID, com.comment.commentId);
                    setIsInsp(res);
                }
            };
            useEffect(() => {
                fetchInsp();
            }, []);
            const getLikes = () => {
                if (auth.currentUser?.uid) {
                    if (isInsp) {
                        if (com.comment.insp.includes(auth.currentUser?.uid)) {
                            return com.comment.insp.length;
                        } else return com.comment.insp.length + 1;
                    } else {
                        if (com.comment.insp.includes(auth.currentUser?.uid)) {
                            return com.comment.insp.length - 1;
                        } else return com.comment.insp.length;
                    }
                } else {
                    return com.comment.insp.length;
                }
            };

            return (
                <div className={`w-full flex flex-col gap-1`} key={index}>
                    <div className="w-full flex flex-row items-center gap-1">
                        <img className='w-6 h-6 rounded-full object-cover'
                            src={com.commenter?.profImg} alt="" />
                        <div className="font-bold">{com.commenter?.nickname}</div>
                        {com.comTier.sign}
                        <div className="text-xs text-neutral-500">
                            {com?.comment.timestamp && timestampToDate(com.comment.timestamp)}
                        </div>
                        <button className='text-xs text-red-600 hover:underline' onClick={() => {
                            if (isMine) {
                                delComment(com.comment.commentId);
                                if (auth.currentUser?.uid) updateMissionProgress(auth.currentUser?.uid, "weekly", 1, true);
                            } else {
                                reportComment();
                            }
                        }}>
                            {isMine ? "삭제" : "신고"}
                        </button>
                    </div>
                    <div className="w-full flex flex-row justify-between items-center">
                        <div className="flex-1 text-sm my-2 min-h-[30px] flex items-center">
                            {com.comment.comment}
                        </div>
                        <button className="flex flex-row items-center gap-1 px-2 py-1 rounded-full hover:bg-neutral-200 mr-6"
                            onClick={async () => {
                                if (auth.currentUser?.uid && imgData?.objectID) {
                                    const res = await toggleInspiration(imgData?.objectID, auth.currentUser?.uid, com.comment.commentId);
                                    if (res !== undefined) {
                                        setIsInsp(res);
                                    }
                                }
                            }}>
                            <div className="text-xs">{getLikes()}</div>
                            <div className={`text-[#B25FF3]`}>
                                {isInsp ? <MdLightbulb /> : <MdLightbulbOutline />}
                            </div>
                        </button>
                    </div>
                </div>
            );
        };

        return (
            <div className="w-full rounded bg-white p-4 flex flex-col gap-2 pb-6">
                <div className="font-bold">댓글</div>
                {imgData?.isCommentAble ? <>
                    {/** 댓글 등록창 */}
                    <div className="w-full rounded flex flex-col p-1 bg-neutral-200 gap-1 mb-1">
                        {auth.currentUser?.uid
                            ? <>
                                <textarea
                                    className="w-full rounded bg-white min-h-[48px] max-h-[200px] overflow-auto text-sm resize-none indent-1 h-auto"
                                    placeholder='댓글을 입력하세요'
                                    value={newCom}
                                    onChange={(e) => {
                                        const newText = e.target.value;
                                        if (newText.length <= 500) {
                                            setNewCom(newText);
                                        }
                                    }}
                                    rows={newCom.split('\n').length}
                                    ref={messageRef} />
                                <div className='w-full flex flex-row items-center justify-end gap-2 text-sm'>
                                    <div className={`${newCom.length < 500 ? "text-neutral-600" : "text-red-500 font-bold"} text-xs`}>{newCom.length}/500</div>
                                    <button className="rounded bg-[#B25FF3] hover:bg-[#63308B] text-white px-3 py-0.5"
                                        onClick={commentSubmit}>등록</button>
                                </div>
                            </>
                            : <div className="w-full h-12 text-sm text-[#B25FF3] font-bold bg-white flex items-center justify-center hover:bg-neutral-100 cursor-pointer"
                                onClick={() => loginModal.onOpen()}>
                                댓글을 작성하려면 로그인이 필요합니다.
                            </div>}
                    </div>
                    {/** 댓글 출력창 */}
                    {isCommentLoad ? <>
                        {/** 댓글 로딩 스키마 */}
                        <div className="animate-pulse w-full h-16 flex items-center justify-center text-sm">
                            Loading...
                        </div>
                    </> : <>
                        {comData.map((com, index) => {
                            return (
                                <InnerComment com={com} index={index} key={index} />
                            );
                        })}
                    </>}

                </> : <>
                    <div className="w-full h-12 flex items-center justify-center rounded text-white bg-neutral-400 text-sm cursor-not-allowed">
                        댓글을 작성할 수 없는 작품입니다.
                    </div>
                </>}
            </div>
        );
    };


    return (
        <>
            {isImgModalOpen && (
                <div className="fixed left-0 top-0 w-screen h-screen bg-neutral-700 px-4 pt-4 bg-opacity-70 z-20"
                    onClick={() => { setImgModalOpen(false) }}>
                    <div className="absolute flex flex-col items-center gap-2 w-[calc(100%-32px)] h-full p-2">
                        {/** 상단 버튼 */}
                        <div className="w-full flex flex-row justify-end gap-3">
                            <div className="flex flex-row gap-1 max-[499px]:absolute 
                            max-[499px]:right-0 max-[499px]:bottom-6 z-20"
                             onClick={(e) => { e.stopPropagation() }}>
                                <IconBtn
                                    icon={IoIosArrowBack}
                                    type="colored"
                                    enable={true}
                                    disabled={!((imgIndex !== undefined) && (imgIndex - 1 >= 0))}
                                    onClick={() => {
                                        if (imgIndex !== undefined) setImgIndex(imgIndex - 1, imgType);
                                        scrollToTop();
                                        if (isBig) {
                                            scrollToImgTop();
                                        }
                                    }}
                                />
                                <IconBtn
                                    icon={IoIosArrowForward}
                                    type="colored"
                                    enable={true}
                                    disabled={!((imgIndex !== undefined) && (imgType === "default" ? imgIndex + 1 < imgArray.length : imgIndex + 1 < followingImgArray.length))}
                                    onClick={() => {
                                        if (imgIndex !== undefined) setImgIndex(imgIndex + 1, imgType);
                                        scrollToTop();
                                        if (isBig) {
                                            scrollToImgTop();
                                        }
                                    }}
                                />
                            </div>
                            <IconBtn
                                icon={IoMdClose}
                                type="default"
                                onClick={() => { setImgModalOpen(false) }} />
                        </div>

                        {isBig ? <>
                            {/** 폭 700px 이상 */}
                            <div className="w-full max-w-[1400px] h-full flex-1 flex flex-row gap-1 overflow-hidden">
                                {/** 좌측 정보창 */}
                                <div className="flex-1 h-full overflow-auto relative flex flex-col gap-2" onClick={(e) => { e.stopPropagation() }}>
                                    <ImgBlock />
                                    <RelativeBlock />
                                </div>
                                {/** 우측 정보창 */}
                                <div className="w-[400px] h-full overflow-auto flex flex-col gap-2 pb-20"
                                    onClick={(e) => { e.stopPropagation() }}>
                                    <InfoBlock isTop={true} />
                                    <UserBlock isTop={false} />
                                    <CommentBlock />
                                </div>
                            </div>
                        </> : <>
                            {/** 폭 700px 미만 */}
                            <div className='w-full h-full flex flex-col gap-2 overflow-auto pb-28'
                                onClick={(e) => { e.stopPropagation() }}>
                                <UserBlock isTop={true} />
                                <ImgBlock />
                                <InfoBlock isTop={false} />
                                <RelativeBlock />
                                <CommentBlock />
                            </div>
                        </>}

                    </div>
                    {/** 사이드 버튼 */}
                    <div className="fixed left-2 bottom-2 flex flex-col gap-2" onClick={(e) => { e.stopPropagation() }}>
                        <IconBtn icon={MdLightbulbOutline} type="colored" enable={isInsp} onClick={() => { toggleInsp() }} />
                        {imgData?.isCommentAble && <IconBtn icon={BiMessage} type="colored" onClick={() => { focusToMessage() }} />}
                        <IconBtn icon={MdArrowUpward} type="colored" onClick={() => { 
                            scrollToTop();
                        }} />
                    </div>
                </div>
            )}
        </>
    );
};

export default memo(ImgModal);