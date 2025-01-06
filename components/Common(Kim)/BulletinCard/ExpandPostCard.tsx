"use client"

import { useCallback, useEffect, useMemo, useState, memo } from "react";
import {
    FPost, getCommentCounts, getPostInsp, viewPost
} from "../../utility/BulletinModule";
import { fullFormatTimestamp } from '../../utility/BulletinModule';
import usePostState from "@/zustand/PostState";
import { userData } from "../UserData/userData";
import { auth } from "@/config/firebase";

import { BiMessageAlt } from "react-icons/bi";
import { AiOutlineBulb, AiFillBulb, AiOutlineEye } from "react-icons/ai";
import { addBulletinScore } from "@/components/utility/ScoringModule";

interface ShortPostBoxProps {
    postData: FPost,
    indexNum: number,
    isColored?: boolean,
}

const ExpandPostCard: React.FC<ShortPostBoxProps> = ({ postData, indexNum, isColored = false }) => {
    const { setPostIndex, setBoardOpen, setCardType } = usePostState();
    const { avatar } = userData(postData.uid);

    const [comCnt, setComCnt] = useState<number>(0);                    // 댓글 수
    const [isInsp, setIsInsp] = useState<boolean>(false);               // 영감 여부
    const [insp, setInsp] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (postData?.objectID !== undefined) {
                const n = await getCommentCounts(postData.objectID);
                setComCnt(n);

                const list = await getPostInsp(postData.objectID);
                setInsp(list);
                if (auth.currentUser?.uid && list.includes(auth.currentUser?.uid)) {
                    setIsInsp(true);
                } else {
                    setIsInsp(false);
                }
            }
        };
        fetchData();
    }, [postData]);


    const boxClicked = async () => {
        if (postData.objectID !== undefined) {
            setCardType("post");
            setPostIndex(indexNum, "popular");
            setBoardOpen(true);
            addBulletinScore(postData.objectID, "view");
            viewPost(postData.objectID);
        }
    };


    return (
        <>
            {postData && (
                <div className={`flex flex-col items-center justify-between w-full h-[150px] gap-1 p-2
                 ${isColored ? "bg-[#F7ECFF]" : "bg-white"} text-sm rounded border border-neutral-100 cursor-pointer
                 hover:bg-neutral-100 transition transition-150`}
                    onClick={() => { boxClicked() }}
                >
                    {/** 제목 및 시간 */}
                    <div className="w-full flex flex-row items-end justify-between">
                        <div className="text-base flex-1 font-bold">
                            {postData.title}
                        </div>
                        <div className="text-xs text-neutral-500">
                            {postData.time !== undefined && fullFormatTimestamp(postData.time)}
                        </div>
                    </div>

                    {/** 내용 */}
                    <div className="w-full flex-1 text-sm overflow-hidden text-ellipsis">
                        {postData.desc?.replace(/<[^>]*>/g, '')}
                    </div>

                    <div className="w-full border-b border-neutral-200" />

                    {/** 작가 및 지표 */}
                    <div className="w-full flex flex-row items-center justify-between">
                        <>
                            {avatar("nickname")}
                        </>
                        <div className="flex flex-row items-center justify-center text-neutral-600 gap-3 min-w-[80px]">
                            <div className="flex flex-row items-center gap-0.5">
                                <div className="text-lg"><BiMessageAlt /></div>
                                <div className="text-sm">{comCnt}</div>
                            </div>
                            <div className="flex flex-row items-center gap-0.5">
                                <div className="text-lg text-[#B25FF3]">
                                    {isInsp ? <AiFillBulb /> : <AiOutlineBulb />}
                                </div>
                                <div className="text-sm">{postData.inspNum}</div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
};

export default memo(ExpandPostCard);