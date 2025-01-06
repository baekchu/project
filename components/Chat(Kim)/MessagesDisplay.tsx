import React, { useEffect, useState, useRef } from "react";
import {
    FMessage, getRoomParticipants
} from "../utility/ChatModule";
import { FUserData, getUserData } from "../utility/UserDataModule";
import MessageComp from "./MessageComp";
import { v4 } from 'uuid';
import { auth } from "@/config/firebase";
import ChatInput from "./ChatInput";
import useMessageState from "@/zustand/MessageState";

import { MdArrowDownward } from "react-icons/md";

interface MessageDisplayProps {
    messageList: FMessage[],
    roomID: string,
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ messageList, roomID }) => {
    const { newGetter } = useMessageState();

    // 채팅방에 있는 모든 유저의 uid를 가져옴
    const [participants, setParticipants] = useState<string[]>([]);
    useEffect(() => {
        if (roomID) {
            if (roomID !== "new") {     // 새로 생성된 채팅방이 아닐 경우 참가자 데이터 불러오기
                const fetchPart = async () => {
                    const parts = await getRoomParticipants(roomID);
                    setParticipants(parts);
                };
                fetchPart();
            } else {    // 새로 생성된 채팅방인 경우 상대방 uid 불러와 내 id와 함께 배열로 저장
                if (auth.currentUser?.uid) setParticipants([newGetter, auth.currentUser?.uid]);
            }

        }
    }, [roomID]);


    // 채팅방에 있는 모든 유저의 데이터를 불러와 객체로 저장
    const [userDatas, setUserDatas] = useState<{ [key: string]: FUserData }>({});
    useEffect(() => {
        const fetchUserDetails = async () => {
            if (participants.length > 0) {
                const userDataPromises = participants.map((partID) => getUserData(partID));
                const userInfos = await Promise.all(userDataPromises);

                const updatedUserDatas: { [key: string]: FUserData } = {};
                userInfos.forEach((userData, index) => {
                    updatedUserDatas[participants[index]] = userData;
                });
                setUserDatas(updatedUserDatas);
            }
        };
        fetchUserDetails();
    }, [participants]);


    // 자동 스크롤 관련
    const bottomRef = useRef<HTMLDivElement>(null);
    const [autoScroll, setAutoScroll] = useState<boolean>(true);
    const scrollToBottom = () => {
        if (bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'instant' });
        }
    };
    const handleScroll = () => {
        if (bottomRef.current) {
          const isAtBottom = bottomRef.current.getBoundingClientRect().bottom <= window.innerHeight;
          setAutoScroll(isAtBottom);
        }
      };
    useEffect(() => {
        if (autoScroll) {
            scrollToBottom();
        }
    }, [messageList, autoScroll]);

    return (
        <div className="flex flex-col w-full items-center justify-between h-full flex-1">
            <div
                className="flex flex-col gap-1.5 overflow-auto flex-1 w-full h-full relative px-1"
                onScroll={handleScroll}>
                {(messageList.length > 0) ? <>
                    {messageList.map((mes, index) => {
                        return (
                            <div 
                                className={`w-full max-w-[400px] p-2.5 rounded-lg shadow ${mes.sender === auth.currentUser?.uid ? "bg-[#F3E4FC] ml-auto" : "bg-[#E5F3FF]"}`}
                                key={index}>
                                <MessageComp
                                    messageData={mes}
                                    userData={userDatas[mes.sender]}
                                    key={v4()} />
                            </div>
                        );
                    })}
                    <div className="h-0 " ref={bottomRef}/>
                    {!autoScroll && (
                        <button className="fixed opacity-70 right-4 bottom-[70px] rounded-full w-8 h-8 flex items-center justify-center
                                bg-white hover:bg-neutral-300 text-neutral-500 shadow"
                                onClick={() => {
                                    scrollToBottom();
                                    setAutoScroll(true);
                                }}>
                            <MdArrowDownward />
                        </button>)}
                </>
                    : <div className="w-full text-center">
                        새로운 채팅을 시작해보세요.
                    </div>}
            </div>
            <ChatInput roomID={roomID} />
        </div>
    );
};

export default MessageDisplay;