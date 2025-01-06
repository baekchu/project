import React, { useState, useEffect, memo } from "react";
import {
    alarmTimeToStr, deleteSingleAlarm, FAlarm, readAlarmData
} from "../utility/AlarmModule";
import { FUserData, getUserData } from "../utility/UserDataModule";
import { useRouter } from "next/navigation";
import useAlarmState from "@/zustand/AlarmState";
import { auth } from "@/config/firebase";

interface AlarmBoxProps {
    docID: string,
}
const AlarmBox: React.FC<AlarmBoxProps> = ({ docID }) => {
    const router = useRouter();
    const { openAlarm } = useAlarmState();

    const [alarmData, setAlarmData] = useState<FAlarm | undefined>();
    const [senderInfo, setSenderInfo] = useState<FUserData>();
    useEffect(() => {
        const fetchData = async () => {
            if (auth.currentUser?.uid) {
                const d = await readAlarmData(auth.currentUser?.uid, docID);
                setAlarmData(d);
                if (d) {
                    const s = await getUserData(d.sender);
                    setSenderInfo(s);
                }
            }
        };
        fetchData();
    }, [auth.currentUser?.uid]);

    const renderTextByType = () => {
        if (alarmData) {
            if (alarmData.type === "comment") {
                return (
                    " 댓글을 달았습니다."
                );
            } else if (alarmData.type === "follow") {
                return (
                    " 팔로우했습니다."
                );
            } else if (alarmData.type === "inspirate") {
                return (
                    " 회원님의 작품에 영감받았습니다."
                );
            }
        }
        return "";
    };

    const handleClick = async () => {
        // 알람 박스 클릭 시 해당 위치로 이동하고 알람 삭제
        if (auth.currentUser?.uid && alarmData) {
            router.push(alarmData.ref);
            await deleteSingleAlarm(auth.currentUser?.uid, alarmData.sender, alarmData.time);
            openAlarm();
        }
    };

    return (
        <>
            {alarmData && (
                <button className="w-full h-12 flex flex-row p-1 items-center justify-between gap-2 rounded shadow
                hover:bg-[#EADDF3] cursor-pointer"
                    onClick={handleClick}>
                    <img src={senderInfo?.profImg} alt="" className="w-9 h-9 object-cover rounded-full" />
                    <div className="flex-1 h-full text-wrap overflow-hidden text-ellipsis text-sm">
                        <span className="font-bold">{`${senderInfo?.nickname}`}</span>
                        님이
                        {renderTextByType()}
                    </div>
                    <div className="text-xs text-neutral-400">
                        {alarmTimeToStr(alarmData.time)}
                    </div>
                </button>
            )}
        </>
    );
};

export default memo(AlarmBox);