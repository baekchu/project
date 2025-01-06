import { useEffect, useState, useRef, memo } from "react";
import { auth } from "@/config/firebase";
import {
    FComment, deleteMyComment, doReport, getCommentData, leaveComment,
    getCommentIDs, singleFormatTimestamp, switchCommentInspirationState
} from "../utility/BulletinModule";
import {
    FUserData, FUserTier, getUserData, getUserTierData
} from "../utility/UserDataModule";
import { useRouter } from "next/navigation";

import {
    AiOutlineBulb, AiFillBulb, AiOutlineClose,
} from "react-icons/ai";
import { FiCornerDownRight } from "react-icons/fi";
import { addBulletinScore } from "../utility/ScoringModule";
import useLoginModal from "../hooks/useLoginModal";
import toast from "react-hot-toast";
import { updateMissionProgress } from "../utility/MissionModule";

interface PostCommentProps {
    docID: string,
    commentID: string,
    isPop: boolean,
    fetchComm: Function,
    cocomentID?: string,
}

const PostComment: React.FC<PostCommentProps> = ({
    docID, commentID, isPop, fetchComm, cocomentID
}) => {
    const router = useRouter();
    const LoginModal = useLoginModal();
    const [commentData, setCommentData] = useState<FComment>();
    const [cocommentList, setCocommentsList] = useState<string[]>([]);

    const fetchComDat = async () => {
        const dat = (!cocomentID)
            ? await getCommentData(docID, commentID)
            : await getCommentData(docID, commentID, cocomentID);
        setCommentData(dat);
    }
    useEffect(() => {
        if (!docID) return;
        fetchComDat();

        if (!cocomentID) {
            const fetchCoco = async () => {
                const d = await getCommentIDs(docID, commentID);
                setCocommentsList(d);
            };
            fetchCoco();
        }
    }, []);

    const [isCommentInsp, setIsCommentInsp] = useState<boolean>(false);
    const [userData, setUserData] = useState<FUserData>();
    const [userTier, setUserTier] = useState<FUserTier>();
    useEffect(() => {
        if (!commentData) return;
        const fetchUser = async () => {
            if (auth.currentUser?.uid && commentData.inspirations.includes(auth.currentUser?.uid)) setIsCommentInsp(true);
            else setIsCommentInsp(false);
            const u = await getUserData(commentData.uid);
            setUserData(u);
            if (u?.exp) {
                const t = await getUserTierData(u.exp);
                setUserTier(t);
            }
        };
        fetchUser();
    }, [commentData]);


    // 댓글 삭제
    const delCom = async () => {
        if (confirm("이 댓글을  삭제하시겠습니까?")) {
            if (!auth.currentUser?.uid || !commentData) return;
            await deleteMyComment(auth.currentUser?.uid, docID, commentData?.time, cocomentID ? commentID : undefined);
            addBulletinScore(docID, "comment", true);
            await fetchComm();
            toast.success("댓글을 삭제했습니다");
        }
    };

    // 댓글 신고
    const repCom = async () => {
        if (confirm("이 댓글을  신고하시겠습니까?")) {
            if (!auth.currentUser?.uid || !commentData) return;
            await doReport(auth.currentUser?.uid, docID, commentID, cocomentID ?? undefined);
            toast.success("댓글을 신고했습니다");
        }
    };

    // 댓글 영감
    const toggleInsp = async () => {
        if (!auth.currentUser?.uid) return;
        await switchCommentInspirationState(auth.currentUser?.uid, docID, commentID, cocomentID ? cocomentID : undefined);
        await fetchComDat();
    };

    // 대댓글 입력란 온오프
    const [isCocoOn, setIsCocoOn] = useState<boolean>(false);

    // 대댓글 입력란
    const CocomInput = () => {
        const [coco, setCoco] = useState<string>("");
        const handleCoco = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            if (e.target.value.length <= 300) {
                setCoco(e.target.value);
            }
        };
        const submitCom = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.preventDefault();
            if (auth.currentUser?.uid) {
                if (coco.trim() !== "" && confirm("댓글을 등록하겠습니까?")) {
                    await leaveComment(auth.currentUser?.uid, coco, docID, commentID);
                    await updateMissionProgress(auth.currentUser?.uid, "weekly", 1);
                    setCoco("");
                    await fetchComm();
                    toast.success("댓글을 등록했습니다");
                }
            } else {
                LoginModal.onOpen();
            };
        };

        const textarea = useRef<HTMLTextAreaElement | null>(null);
        const handleResizeHeight = () => {
            if (textarea.current) {
                textarea.current.style.height = "auto";
                textarea.current.style.height = textarea.current.scrollHeight + "px";
            };
        };

        return (
            <form className="bg-neutral-200 rounded text-sm flex flex-row w-full justify-center gap-1 p-1 mb-1 h-auto">
                <div className="h-full text-neutral-500 flex items-start"><FiCornerDownRight /></div>
                <textarea className="w-full resize-none rounded "
                    ref={textarea}
                    onInput={handleResizeHeight}
                    placeholder="대댓글을 입력하세요"
                    value={coco}
                    onChange={(e) => { handleCoco(e) }} />
                <div className="flex flex-col justify-between w-16">
                    <div className="flex flex-row text-xs items-start justify-between">
                        <div>
                            {coco.length}/300
                        </div>
                        <button className="text-sm text-red-400 hover:text-red-600"
                            onClick={(e) => {
                                e.preventDefault();
                                if (confirm("대댓글 작성을 그만두시겠습니까?")) {
                                    setIsCocoOn(false);
                                    setCoco("");
                                }
                            }}>
                            <AiOutlineClose />
                        </button>
                    </div>
                    <button className="font-bold text-xs px-2 py-1 rounded bg-[#B25FF3] hover:bg-[#63308B] text-white"
                        onClick={(e) => { submitCom(e) }}>
                        등록
                    </button>
                </div>
            </form>
        )
    };



    return (
        <div className="flex flex-col">
            {commentData && (
                <div className="flex flex-row w-full border-b border-neutral-300 py-1.5">
                    {(!isPop && cocomentID) && (
                        <div className="text-neutral-500">
                            <FiCornerDownRight />
                        </div>
                    )}
                    <div className="flex flex-col w-full min-h-[60px]">
                        <div className="flex-1 flex flex-row justify-between items-center">
                            <div className="flex flex-row items-center gap-1">
                                <img src={userData?.profImg} alt="" className="object-cover rounded-full w-6 h-6 cursor-pointer" onClick={() => { if (userData?.uid) { router.push(`/userPage?uid=${userData.uid}`) } }} />
                                <div className="font-bold text-sm cursor-pointer hover:underline"
                                    onClick={() => { if (userData?.uid) { 
                                        router.push(`/userPage?uid=${userData.uid}`)
                                    } }}>
                                    {userData?.nickname}
                                </div>
                                <div>{userTier?.sign}</div>
                                <div className="text-xs text-neutral-400">{singleFormatTimestamp(commentData.time)}</div>
                                {(commentData.uid === auth.currentUser?.uid)
                                    ? <button className="text-xs hover:underline text-red-500" onClick={delCom}>삭제</button>
                                    : <button className="text-xs hover:underline text-red-500" onClick={repCom}>신고</button>}
                            </div>
                            {(!isPop && !cocomentID) && (
                                <button className="text-xs hover:underline text-neutral-400 hover:text-neutral-600" onClick={() => { setIsCocoOn(true) }}>대댓글 달기</button>
                            )}
                            {(isPop) && (
                                <div className="text-xs bg-[#B25FF3] text-white font-bold rounded px-1 py-0.5">BEST</div>
                            )}
                        </div>
                        {/** 댓글 내용 */}
                        <div className="w-full flex flex-row text-sm justify-between px-1 mt-1">
                            <div className="flex-1">
                                {commentData.content}
                            </div>
                            <button className={`text-[#B25FF3] rounded-full hover:bg-neutral-200 px-1 h-5 
                                flex flex-row gap-1 items-center justify-center hover:shadow`}
                                onClick={() => { toggleInsp() }}>
                                <div>{commentData.inspirations.length}</div>
                                {isCommentInsp ? <AiFillBulb /> : <AiOutlineBulb />}
                            </button>
                        </div>
                    </div>
                </div>)}

            {cocommentList.map((cocomment, index) => {
                return (
                    <PostComment
                        docID={docID}
                        commentID={commentID}
                        isPop={isPop}
                        fetchComm={fetchComm}
                        cocomentID={cocomment}
                        key={`${commentID}_${index}`}
                    />
                );
            })}

            {isCocoOn && (<CocomInput />)}
        </div>
    );
};

export default memo(PostComment);