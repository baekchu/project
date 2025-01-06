"use client"

import useMessageState from "@/zustand/MessageState";
import { useEffect, useState, useMemo } from "react";
import {
    FMessage, getChatRoomIDs, getRealTimeChat, updateLastTime,
    checkPrivChatExist, leaveRoom, getJoinTime, getRoomParticipants,
} from "../utility/ChatModule";
import { auth } from "@/config/firebase";
import MessagesDisplay from "./MessagesDisplay";
import RoomComp from './RoomComp';
import { v4 } from "uuid";
import DropDown from "./DropDown";

import { MdMoreVert, MdClose, MdArrowBackIos } from "react-icons/md";
import { getUserData, reportUser } from "../utility/UserDataModule";
import { Timestamp } from "firebase/firestore";


const ChatFloat = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);           // 모달 창 온오프
    const [currentRoomID, setCurrentRoomID] = useState<string>(""); // 문자가 입력되면 채팅방에 진입한 상태
    const { isChatOpen, ToggleChatOpen, newGetter, setNewGetter, chatRoomID, setChatRoomID } = useMessageState();

    // 채팅 모달 온오프
    useEffect(() => {
        setIsOpen(isChatOpen);
        if (!isChatOpen) {
            // 채팅방에 진입했던 상태에서 x를 누를 시 마지막 채팅 시간 업데이트
            if (currentRoomID && auth.currentUser?.uid) updateLastTime(auth.currentUser?.uid, currentRoomID);
            setCurrentRoomID("");
            setNewGetter("");
        }
    }, [isChatOpen]);

    /** 
     * 새로운 채팅은 임시 채팅방 ID인 "new"로 설정된다.
     * 첫 채팅이 발생하면 newRoomID에 정상적인 roomID가 입력되고,
     * 이를 사용해 currentRoomID로 설정 후 초기화해준다
    */
    useEffect(() => {
        const fetchNewRoom = async () => {
            if (auth.currentUser?.uid && newGetter) {
                const s = await checkPrivChatExist(auth.currentUser.uid, newGetter);
                if (s != "") {    // 이미 상대방과의 채팅방이 있다면 기존 채팅방을 오픈
                    if (!isOpen) ToggleChatOpen();
                    setChatRoomID(s);
                    //setCurrentRoomID(s);
                    setNewGetter("");
                } else {    // 기존 채팅방이 없다면 새로운 채팅 생성할수 있도록
                    setCurrentRoomID("new");
                };
            }
        }
        fetchNewRoom();
    }, [newGetter]);

    useEffect(() => { // 새 채팅방에 첫 메세지가 생성되면 해당 방의 경로로 연결
        if (chatRoomID) {
            setCurrentRoomID(chatRoomID);
            setChatRoomID("");
        }
    }, [chatRoomID]);


    // 채팅 목록 또는 채팅 내역 가져오기
    const [roomList, setRoomList] = useState<string[]>([]);
    const [messageList, setMessageList] = useState<FMessage[]>([]);
    const [otherNick, setOtherNick] = useState<string>("");

    function arraysAreEqual(array1: string[], array2: string[]) {
        if (array1.length !== array2.length) {
            return false;
        }

        for (let i = 0; i < array1.length; i++) {
            if (!array2.includes(array1[i])) {
                return false;
            }
        }

        return true;
    }

    // 마지막으로 채팅방에 들어온 시간
    const [joinTime, setJoinTime] = useState<Timestamp>(Timestamp.now());
    const fetchTime = async () => {
        if (auth.currentUser?.uid) {
            const t = await getJoinTime(auth.currentUser?.uid, currentRoomID);
            setJoinTime(t);
        }
    };
    useEffect(() => { // currentRoomID가 연결되면 joinTime을 읽어옴
        if (auth.currentUser?.uid && currentRoomID) {
            fetchTime();
        };
    }, [auth.currentUser?.uid, currentRoomID]);

    // 상대방 닉네임 출력하기
    const fetchOtherNick = async () => {    // 나를 제외한 다른 사람들의 이름과 수를 불러옴
        if (!currentRoomID || !auth.currentUser?.uid) return;
        const nickList: string[] = await getRoomParticipants(currentRoomID);
        const exceptMe: string[] = nickList.filter((otherID) => otherID !== auth.currentUser?.uid);
        const otherID = exceptMe[0];
        const d = await getUserData(otherID);
        const res: string = (exceptMe.length > 1) ? `${d.nickname} 외 ${exceptMe.length - 1}명` 
        : (exceptMe.length == 1) ? `${d.nickname}` : "알 수 없음";
        setOtherNick(res);
    };

    useEffect(() => {
        if (currentRoomID === "new") {  // currentRoom이 새로 생성된 임시 채팅방일 경우
            if (!isOpen) ToggleChatOpen();
            setMessageList([]);
        } else {  // 기존 채팅방이 존재했을 경우
            if (isOpen) {
                if (!auth.currentUser?.uid) return;
                if (currentRoomID) {    // *** 채팅방에 진입한 경우
                    updateLastTime(auth.currentUser?.uid, currentRoomID);
                    fetchOtherNick();   // 채팅방 이름을 유저 이름을 불러와 설정

                } else {    // *** 채팅 리스트를 출력하는 경우
                    const fetchChatList = async () => {
                        if (auth.currentUser?.uid) {
                            const l = await getChatRoomIDs(auth.currentUser?.uid);
                            if (!arraysAreEqual(roomList, l)) {
                                setRoomList(l);
                            }
                        }
                    };
                    fetchChatList();
                    setMessageList([]);
                    setOtherNick("");
                }
            }
        }
    }, [isOpen, currentRoomID]);

    useEffect(() => {
        if (isOpen && currentRoomID) {
            const unsubscribe = getRealTimeChat(currentRoomID, joinTime, (messages) => {
                setMessageList(messages);
            });
            return () => {
                unsubscribe();
            };
        }
    }, [currentRoomID, joinTime]);

    // 채팅목록 컴포넌트
    const RoomsDisplay = () => {
        return (
            <div className="flex flex-col w-full overflow-auto gap-2 h-full px-2">
                {roomList.length > 0 ? (
                    <>
                        {roomList.map((roomID) => {
                            return (
                                <div
                                    className=""
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setCurrentRoomID(roomID);
                                    }}
                                    key={v4()}>
                                    <RoomComp roomID={roomID} />
                                </div>
                            )
                        })}
                    </>
                ) : (
                    <div className="m-auto text-sm text-neutral-500">
                        채팅 내역이 없습니다
                    </div>
                )}

            </div>
        )
    };


    /** 상대방 신고하기 *********/
    const reportOther = async (otherID: string | undefined) => {
        console.log("report");
        if (auth.currentUser?.uid && otherID) {
            const res = await reportUser(auth.currentUser?.uid, otherID);
            if (res) {
                leaveChatroom();
            };
        };
    };

    /** 대화방 나가기 *********/
    const leaveChatroom = async () => {
        if (auth.currentUser?.uid && currentRoomID) {
            const isSuccessed = await leaveRoom(auth.currentUser?.uid, currentRoomID);
            if (isSuccessed) setCurrentRoomID("");
        }
    };


    return (
        <>
            {isOpen && (
                <div className="fixed flex flex-col items-center w-[98%] max-w-[500px] max-h-[700px] bg-white
                 shadow rounded right-1.5 bottom-1 z-[12] p-1 border border-neutral-200 overflow-hidden"
                 style={{
                    height: window.innerWidth < 500 ? '99vh' : 'calc(100vh - 62px)',
                  }}>
                    {/**  상단  */}
                    <div className="flex flex-row w-full items-center justify-between h-10">

                        {/** 채팅방 화면에서 목록으로 나가는 좌상단 화살표 버튼 */}
                        {currentRoomID ? (
                            <button className="hover:bg-neutral-200 w-7 h-7 rounded-full flex pl-1 items-center justify-center"
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (auth.currentUser?.uid) updateLastTime(auth.currentUser?.uid, currentRoomID);
                                    setCurrentRoomID("");
                                }}>
                                <MdArrowBackIos />
                            </button>) : (null)}

                        {/** 상단 닉네임 */}
                        <div className="text-base font-bold ml-2">
                            {currentRoomID ? otherNick : "내 채팅방"}
                        </div>

                        {/** 우측 드롭다운 또는 닫기버튼 */}
                        <div className="flex flex-row items-center gap-1">
                            {/**<button className="bg-hv p-5 rad-50">
                            <MdMoreVert /></button>*/}
                            {currentRoomID
                                ? <DropDown
                                    //eport={() => {/*reportOther()*/}}
                                    leave={leaveChatroom} /> : null}
                            <button className="hover:bg-neutral-200 w-7 h-7 rounded-full flex items-center justify-center"
                                onClick={() => { ToggleChatOpen(); }}>
                                <MdClose />
                            </button>
                        </div>
                    </div>

                    <div className="border-b border-neutral-300 w-full my-1" />

                    {/** 내용 */}
                    <div className="w-full pt-1" style={{ height: 'calc(100% - 45px)' }}>
                        {currentRoomID
                            ? (<>
                                {/** 채팅 내역 */}
                                <MessagesDisplay
                                    messageList={messageList}
                                    roomID={currentRoomID} />
                            </>)
                            : (<>
                                {/** 채팅방 목록 */}
                                <RoomsDisplay />
                            </>)
                        }
                    </div>
                </div>
            )}
        </>
    )
};

export default ChatFloat;