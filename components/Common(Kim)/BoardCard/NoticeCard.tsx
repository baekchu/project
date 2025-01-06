import React, { useEffect, useState } from 'react';
import {
    fullFormatTimestamp
} from '@/components/utility/BulletinModule';
import { FNews, FQNA } from '@/components/utility/NewsModule';
import usePostState from '@/zustand/PostState';
import toast from "react-hot-toast";

import {
    AiOutlineLeft, AiOutlineRight
} from "react-icons/ai";


const NoticeCard = ({ newsData }: { newsData: FNews | FQNA }) => {
    const { setPostIndex, postIndex, postList } = usePostState();

    // 이전글 다음글 관리
    const movePost = (moveTo: "before" | "next") => {
        if (postIndex === undefined) return;
        if (moveTo === "before") {
            if (postIndex > 0) {
                setPostIndex(postIndex - 1, "default");
            } else {
                toast.error("처음 게시글입니다");
            }
        } else {
            if (postIndex < postList.length - 1) {
                setPostIndex(postIndex + 1, "default");
            } else {
                toast.error("마지막 게시글입니다");
            }
        }
    };


    return (
        <>
            {newsData && (
                <>
                    <div className="w-full flex flex-col items-center gap-8">
                        {/** 제목과 시간 */}
                        <div className="w-full flex flex-row items-center gap-2">
                            {'type' in newsData && (
                                <div className={`rounded-full flex items-center justify-center
                        border border-neutral-300 px-2 h-6 text-sm bg-white font-bold
                        ${newsData.type === "urgent" && "text-red-500"}`}>
                                {newsData.type === "urgent" ? "긴급" :
                                    newsData.type === "change" ? "변경" :
                                        newsData.type === "event" ? "이벤트" :
                                            newsData.type === "inspection" ? "점검" :
                                                "공지"}
                            </div>
                            )}
                            <div className="flex flex-col flex-1">
                                <div className="font-bold truncate">
                                    {newsData.title}
                                </div>
                                <div className="text-sm text-neutral-600">
                                    {fullFormatTimestamp(newsData.time)}
                                </div>
                            </div>
                        </div>


                        {/** 내용 */}
                        <div className="w-full text-sm flex-1">
                            {'desc' in newsData && (newsData.desc)}
                            {'answer' in newsData && (newsData.answer)}
                        </div>

                        <div className="w-full flex flex-row items-center justify-between">
                            {/** 나이스케치 서명 */}
                            <div className="flex flex-row items-center gap-2">
                                <div className="text-sm font-bold">나이스케치</div>
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
                </>
            )}
        </>)
};

export default NoticeCard;