"use client"

import React, { useState, useEffect } from "react";
import {
    FAlarm, deleteAllAlarm, getAlarmIDs,
} from "../utility/AlarmModule";
import useAlarmState from "@/zustand/AlarmState";

// css 관련
import { AiOutlineClose } from 'react-icons/ai';
import AlarmBox from "./AlarmBox";
import { auth } from "@/config/firebase";

const Alarm = () => {
    const { isOpenAlarm, openAlarm, callAlarm, updateAlarm } = useAlarmState();

    const [alarmIDs, setAlarmIDs] = useState<string[]>([]);
    useEffect(()=>{
        const fetchAl = async () => {
            if (!auth.currentUser?.uid) return;
            const ids = await getAlarmIDs(auth.currentUser?.uid);
            setAlarmIDs(ids);
        }
        fetchAl();
    },[callAlarm, isOpenAlarm]);

    // 모두 읽기
    const handleReadAll = async () => {
        if (auth.currentUser?.uid) {
            deleteAllAlarm(auth.currentUser?.uid);
            updateAlarm()
        };
    };

    return (
        <>
            {isOpenAlarm && (
                <div className="w-full max-w-[320px] h-full max-h-[400px] fixed xs:right-2 right-0 top-[58px] z-[12] rounded shadow border border-neutral-200
                bg-white flex flex-col p-2">
                    <div className="w-full flex flex-row justify-between items-center">
                        <div className="flex flex-row gap-1 items-center">
                            <div className="font-bold">알람</div>
                            {alarmIDs.length > 0 && (
                                <div className="text-xs text-white px-1 py-0.5 min-w-[20px] flex items-center justify-center font-bold rounded-2xl bg-[#B25FF3]">
                                    {alarmIDs.length}
                                </div>
                            )}
                        </div>
                        <button className="rounded-full w-7 h-7 flex items-center justify-center hover:bg-neutral-200 text-sm" onClick={openAlarm}>
                            <AiOutlineClose />
                        </button>
                    </div>
                    <div className="w-full border-b border-neutral-200 py-0.5"></div>

                    {(alarmIDs.length > 0) ? (
                        <>
                            <button className="text-xs text-[#B25FF3] hover:underline ml-auto py-0.5 font-bold" 
                            onClick={handleReadAll}>모두 읽기</button>

                            <div className="w-full flex-1 mt-0.5 overflow-hidden">
                                {/** 알람 */}
                                <div className="w-full h-full overflow-auto flex flex-col gap-1">
                                    {alarmIDs.map((alarmID, index) => {
                                        return (
                                            <AlarmBox docID={alarmID} key={index} />
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (<div className="w-full flex-1 flex items-center justify-center text-sm text-neutral-400">
                            알람을 모두 확인했어요
                        </div>)}
                </div>
            )}
        </>

    );
};


export default Alarm;