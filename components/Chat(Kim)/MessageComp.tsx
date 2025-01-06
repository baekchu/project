import React, { useState } from "react";
import { FUserData } from "../utility/UserDataModule";
import { FMessage, timestampToStr } from "../utility/ChatModule";
import Image from "next/image";

interface MessageCompProps {
    messageData: FMessage,
    userData: FUserData,
}

const MessageComp: React.FC<MessageCompProps> = ({ messageData, userData }) => {
    const profileSchema = "https://firebasestorage.googleapis.com/v0/b/fir-40c48.appspot.com/o/profile-circle-icon-2048x2048-cqe5466q.png?alt=media&token=7e79c955-af0b-406f-976d-6ab08da3c1c2";
    const [validImg, setValidImg] = useState<boolean>(true);

    return (
        <>
            <div className="flex flex-col gap-1.5">
                <div className="flex flex-row items-center justify-between text-sm">
                    {/** 유저 정보 */}
                    <div className="flex flex-row items-center gap-1">
                        <Image width={28} height={28} src={userData?.profImg ?? profileSchema} alt={userData?.nickname ?? ""}
                            className="w-7 h-7 rounded-full object-cover" />
                        <div className="font-bold">{userData?.nickname}</div>
                    </div>
                    {/** 채팅 시간 */}
                    <div className="text-xs text-neutral-600">
                        {timestampToStr(messageData?.time)}
                    </div>
                </div>

                {/** 채팅 내용 */}
                <div className="text-sm">
                    {messageData?.content}
                </div>

                {/** 첨부파일 있다면 보여줌 */}
                {(messageData?.file) && (
                    <>
                        {validImg ? <Image width={500} height={400}
                            src={messageData.file}
                            alt={`유효기간이 만료했습니다.`}
                            loading={'lazy'}
                            className="w-full h-auto rounded"
                            onError={() => setValidImg(false)}
                        /> : <div className="w-full h-14 text-sm flex items-center justify-center bg-neutral-50">
                            유효기간이 만료했습니다.
                        </div>}
                    </>


                )}
            </div>
        </>
    );
};

export default MessageComp;