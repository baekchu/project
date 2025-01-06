"use client"

import { useCallback, useEffect, useMemo, useState, memo } from "react";
import {
    FPost, getCommentCounts, getPostInsp, viewPost
} from "../../utility/BulletinModule";
import { fullFormatTimestamp } from '../../utility/BulletinModule';
import { auth } from "@/config/firebase";
import usePostState from "@/zustand/PostState";
import PostHoverBox from "../../Bulletin(Kim)/PostHoverBox";
import { userData } from "../UserData/userData";

import { BiMessageAlt } from "react-icons/bi";
import { AiOutlineBulb, AiFillBulb, AiOutlineEye } from "react-icons/ai";
import { addBulletinScore } from "@/components/utility/ScoringModule";
import { Timestamp } from 'firebase/firestore';

interface ShortPostBoxProps {
    postData: FPost,
    indexNum: number,
}

const ShortPostBox: React.FC<ShortPostBoxProps> = ({ postData, indexNum }) => {
    const { isBoardOpen, setPostIndex, setBoardOpen, setCardType } = usePostState();
    const author = userData(postData.uid);

    const [comCnt, setComCnt] = useState<number>(0);                    // 댓글 수
    const [isInsp, setIsInsp] = useState<boolean>(false);               // 영감 여부
    const [insp, setInsp] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            if (postData.objectID !== undefined) {
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
            setPostIndex(indexNum, "default");
            setBoardOpen(true);
            addBulletinScore(postData.objectID, "view");
            viewPost(postData.objectID);
        }
    };

    // 마우스 호버 시 호버 박스 보여주기
    const [isHovered, setIsHovered] = useState(false);
    const handleMouseEnter = () => { setIsHovered(true) };
    const handleMouseLeave = () => { setIsHovered(false) };



    return (
        <div className="relative z-1">
            {postData && isHovered && !isBoardOpen
                && (<PostHoverBox postData={postData} userData={author} key={indexNum} />)}

            {postData && (
                <div className="flex flex-row items-center justify-between w-full gap-3 px-2
                 bg-white text-sm h-11 border-y border-neutral-100 cursor-pointer
                 hover:bg-neutral-100 transition transition-150"
                    onClick={() => { boxClicked() }}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >
                    {/** 제목 */}
                    <div className="text-base flex-1">
                        {postData.title}
                    </div>

                    {/** 업로드 시간 */}
                    <div className="text-xs text-neutral-500 max-sm:hidden">
                        {postData.time !== undefined && fullFormatTimestamp(postData.time)}
                    </div>

                    {/** 작가 */}
                    <div className="w-28 flex items-center justify-center">
                        {author !== undefined && author.avatar("nickname")}
                    </div>

                    <div className="border-l border-neutral-200 h-5/6 " />

                    {/** 조회수 댓글 영감 */}
                    <div className="flex flex-row items-center justify-center text-neutral-600 gap-3 px-1 max-xs:hidden
                    min-w-[90px]">
                        <div className="flex flex-row items-center gap-0.5">
                            <div className="text-lg"><BiMessageAlt /></div>
                            <div className="text-sm">{comCnt ?? 0}</div>
                        </div>
                        <div className="flex flex-row items-center gap-0.5">
                            <div className="text-lg text-[#B25FF3]">
                                {isInsp ? <AiFillBulb /> : <AiOutlineBulb />}
                            </div>
                            <div className="text-sm">{insp.length}</div>
                        </div>
                    </div>
                </div>)}

        </div>
    )
};

export default memo(ShortPostBox);