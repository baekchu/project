"use client"
import React, { useEffect, useState } from "react";
import usePostState from "@/zustand/PostState";

import {
    AiOutlineClose,
} from "react-icons/ai";
import BulletinCard from "../Common(Kim)/BoardCard/BulletinCard";
import NoticeCard from "../Common(Kim)/BoardCard/NoticeCard";
import { getPostData } from "../utility/BulletinModule";
import { usePathname } from "next/navigation";

const PostBoard = () => {
    const {
        isBoardOpen, setBoardOpen, selectedPostData, postType, cardType,
        postList, setPostList, setPostIndex
    } = usePostState();

    // 보드 닫기
    const closeBoard = () => {
        setBoardOpen(false);
    };

    /**     링크 처리 관련              **************************/
    const pathname = usePathname();
    useEffect(() => {
        const fetchURL = async () => {
            if (pathname !== "/bulletin") return;
            const urlParams = new URLSearchParams(window.location.search);
            const pageId = urlParams.get('id');
            if (pageId && postList.length === 0) {
                const d = await getPostData(pageId);
                if (d) {
                    await setPostList([d]);
                    await setPostIndex(0, "default");
                }
            }
        }
        fetchURL();
    }, [window.location.search]);

    useEffect(() => {
        const handleClickOutside = (e: any) => {
            if (!selectedPostData || !selectedPostData) return;
            const boardElement = document.querySelector(".post-board");
            if (!boardElement?.contains(e.target)) {
                setBoardOpen(false);
            }
        };
        document.addEventListener("click", handleClickOutside);

        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isBoardOpen, selectedPostData]);

    useEffect(() => {
        const handleBodyOverflow = () => {
          if (isBoardOpen) {
            document.body.style.overflow = "hidden";
          } else {
            document.body.style.overflow = ""; // Reset to default
          }
        };
    
        handleBodyOverflow();
    
        return () => {
          document.body.style.overflow = ""; // Ensure reset on cleanup
        };
      }, [isBoardOpen]);

    /**         R E T U R N            *************************************************/
    return (
        <div className="z-10 w-screen post-board">
            {isBoardOpen && selectedPostData && (
                <>
                    <div className="fixed z-10 opacity-30 bg-black w-screen h-screen pointer-events-none" />
                    <div className="flex z-[11] flex-col items-center w-full max-w-[900px] bg-white rounded-xl fixed 
                    right-3 bottom-4 max-lg:right-2 max-md:right-1 max-md:bottom-1
                    overflow-auto shadow-lg p-4 ml-4 border border-neutral-200"
                        style={{ height: 'calc(100vh - 80px)' }}>

                        <div className="w-full relative">
                            {cardType === "post"
                                ? <BulletinCard postData={selectedPostData} type={postType} />
                                : <NoticeCard newsData={selectedPostData} />}


                            {/** 닫기 버튼 */}
                            <button onClick={() => { closeBoard() }}
                                className="hover:bg-neutral-100 text-xl fixed right-7 top-[70px]
                         flex items-center justify-center w-8 h-8 rounded text-neutral-300 hover:text-neutral-500">
                                <AiOutlineClose />
                            </button>
                        </div>


                    </div>
                </>)}
        </div>

    );
};

export default PostBoard;