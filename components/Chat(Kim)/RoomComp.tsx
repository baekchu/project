import React, { useEffect, useState, useMemo, memo } from "react";
import {
    FMessage, countNotReadChats, getLastChat,
    getRoomParticipants, timestampToStr,
} from "../utility/ChatModule";
import { auth } from "@/config/firebase";
import { FUserData, getUserData } from "../utility/UserDataModule";
import { Timestamp } from "firebase/firestore";
import Image from "next/image";

import { MdMailOutline } from "react-icons/md";

interface RoomCompProps {
    roomID: string,
}

const profileSchema = "https://firebasestorage.googleapis.com/v0/b/fir-40c48.appspot.com/o/profile-circle-icon-2048x2048-cqe5466q.png?alt=media&token=7e79c955-af0b-406f-976d-6ab08da3c1c2";

const RoomComp: React.FC<RoomCompProps> = ({ roomID }) => {
    const [lastMes, setLastMes] = useState<FMessage>();
    const lastMesMemoized = useMemo(() => lastMes, [lastMes]);
    const [otherUid, setOtherUid] = useState<string[]>();
    const [notReadMesCnt, setNotReadMesCnt] = useState<number>(0);

    // 채팅방 참가자들 uid 가져오기
    useEffect(() => {
        if (auth.currentUser?.uid && roomID) {
            const fetchLastMes = async () => {
                const parts = await getRoomParticipants(roomID);
                const exceptMe: string[] = parts.filter((partID) => partID !== auth.currentUser?.uid);
                setOtherUid(exceptMe);
            }
            fetchLastMes();
        }
    }, [roomID]);

    // 마지막 채팅과 읽지 않은 메세지 수 실시간 체크
    useEffect(() => {
        if (roomID && auth.currentUser?.uid) {
            // 마지막 채팅과 시간 실시간 업데이트
            const unsubscribeLastChat = getLastChat(roomID, (lastMessage) => {
                setLastMes(lastMessage);
            });

            // 읽지 않은 메세지 개수 실시간 업데이트
            const unsubscribeNotReadChats = countNotReadChats(auth.currentUser?.uid, roomID, (count) => {
                setNotReadMesCnt(count);
            });

            return () => {
                // 리소스 해제
                unsubscribeLastChat();
                unsubscribeNotReadChats();
            };
        }
    }, [roomID, auth.currentUser?.uid]);

    // 상대방 수와 닉네임 가져오기
    const [isLoad, setIsLoad] = useState<boolean>(false);
    const otherUidMemoized = useMemo(() => otherUid, [otherUid]);
    const [otherData, setOtherData] = useState<FUserData>();
    useEffect(() => {
        if (otherUidMemoized && roomID !== "new") {
            const fetchOther = async () => {
                const d = await getUserData(otherUidMemoized[0]);
                setOtherData(d);
            };
            fetchOther();
            setIsLoad(true);
        }
    }, [otherUidMemoized, roomID]);


    return (
        <>
            {isLoad
                ? <>
                    <div className="flex flex-row items-center justify-between w-full h-20 rounded-lg
             gap-4 hover:bg-neutral-200 px-2 cursor-pointer">
                        {/** 프로필 이미지 */}
                        <Image width={56} height={56}
                            src={otherData?.profImg ?? profileSchema}
                            alt={otherData?.nickname ?? ""}
                            className="rounded-full w-14 h-14 object-cover" />

                        {/** 텍스트 */}
                        <div className="flex flex-col flex-1 h-5/6 justfy-center gap-0.5 text-sm my-auto">
                            <div className="flex flex-row w-full justify-between">
                                {/** 상대 닉네임 */}
                                <div className="font-bold">
                                    {otherData?.nickname ?? "(알 수 없음)"}
                                </div>
                                {/** 마지막 채팅 시간 */}
                                <div className="text-xs">
                                    {lastMesMemoized && <> {timestampToStr(lastMesMemoized.time ?? Timestamp.now())}</>}
                                </div>
                            </div>

                            <div className="flex flex-row items-center justify-between gap-2 text-sm">
                                {/** 마지막 채팅 */}
                                <div className="flex-1 overflow-hidden whitespace-normal leading-6 h-14 text-left break-words">
                                    {lastMesMemoized?.content ? lastMesMemoized.content : "(사진을 보냈습니다)"}
                                </div>
                                {/** 읽지 않은 메세지 */}
                                <div className="flex flex-row items-center text-[#B25FF3] gap-1 font-bold">
                                    {(notReadMesCnt > 0) &&
                                        (<>
                                            <div className="">
                                                {notReadMesCnt}
                                            </div>
                                            <div className="text-xl">
                                                <MdMailOutline />
                                            </div>
                                        </>)}
                                </div>
                            </div>
                        </div>
                    </div>
                </>
                : <div className="animate-pulse flex flex-row items-center justify-between
        w-full h-20 rounded-lg gap-4 p-2 bg-neutral-100">
                    <div className="rounded-full w-14 h-14 bg-neutral-200"></div>
                    <div className="flex-1 h-full py-2 flex flex-col gap-2">
                        <div className="w-full h-2 rounded-full bg-neutral-200"></div>
                        <div className="w-full h-2 rounded-full bg-neutral-200"></div>
                    </div>
                    <div className="w-8 h-full py-2">
                        <div className="w-full h-2 rounded-full bg-neutral-200"></div>
                    </div>
                </div>}

        </>
    );
};

export default memo(RoomComp);