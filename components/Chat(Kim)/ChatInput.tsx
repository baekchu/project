import { useEffect, useState } from "react";
import { auth } from "@/config/firebase";
import { updateNewChat, updateLastTime, createNewChatroom } from "../utility/ChatModule";

import { MdOutlineImage, MdSend, MdClose } from "react-icons/md";
import useMessageState from "@/zustand/MessageState";


interface ChatInputPros {
    roomID: string,
}

const ChatInput: React.FC<ChatInputPros> = ({ roomID }) => {
    // 새 채팅방일 경우의 상태를 나타내주는 변수
    const { newGetter, setChatRoomID } = useMessageState();
    const [isNew, setIsNew] = useState<boolean>(false);
    useEffect(()=>{ // 새 상대방 uid가 있고 방 이름이 "new"라면 새 채팅방인 상태를 나타냄
        if (newGetter && roomID === "new") setIsNew(true);
        else setIsNew(false);
    },[roomID]);

    const [newMes, setNewMes] = useState<string>("");
    const [file, setFile] = useState<File|undefined>();

    // 파일 선택
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files && e.target.files[0];
        if (selectedFile) {
            // 이미지 파일인지 확인
            if (selectedFile.type.includes("image/")) {
                // 크기 확인 (100MB 이하)
                if (selectedFile.size <= 100 * 1024 * 1024) {
                    setFile(selectedFile);
                } else {
                    alert("파일 크기는 100MB 이하여야 합니다.");
                }
            } else {
                alert("이미지 파일을 선택해주세요.");
            }
        }
    };

    // 메세지 등록
    const submitMessage = async () => {
        if (!auth.currentUser?.uid || (newMes.trim()==="" && !file)) return;

        if (!isNew) {   // 새 채팅 모드가 아니라면
            await updateNewChat(auth.currentUser?.uid, roomID, newMes, file);
            setNewMes("");
            setFile(undefined);
            await updateLastTime(auth.currentUser?.uid, roomID);
        } else {        // 새 채팅 모드라면
            const newRoom = await createNewChatroom(auth.currentUser?.uid, newGetter, newMes, file);
            setChatRoomID(newRoom);
            setNewMes("");
            setFile(undefined);
        }
    };

    const [isImgHover, setIsImgHover] = useState<boolean>(false);
    useEffect(()=>{
        if (file === undefined) {
            setIsImgHover(false);
        }
    },[file]);

    return (
        <div className="flex flex-col w-full h-fit relative">
            {file !== undefined && (<div className="absolute left-0 -top-[84px] w-20 h-20 rounded p-1 shadow bg-neutral-100 
            transition-150 transition brightness-100 hover:brightness-90 cursor-pointer"
                onClick={()=>{setFile(undefined)}}
                onMouseOver={()=>{setIsImgHover(true)}}
                onMouseLeave={()=>{setIsImgHover(false)}} >
                <div className='w-full h-full flex items-center justify-center relative overflow-hidden'>
                    {isImgHover && (<div className="absolute font-xl text-2xl text-red-400 -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 "><MdClose /></div>)}
                    <img className="w-full h-full object-cover" src={URL.createObjectURL(file)} alt="attached image" />
                </div>
            </div>)}
            

            <div className="border-b border-neutral-300 w-full my-0.5" />

            <form
                className="flex flex-row w-full items-center justify-center text-2xl gap-2 h-11"
                onSubmit={(e) => {
                    e.preventDefault();
                    submitMessage()
                }}>

                {/** 메세지 입력 */}
                <input className="flex-1 resize-none border border-neutral-300 h-8 rounded text-sm"
                    value={newMes}
                    onChange={(e) => { setNewMes(e.target.value) }} />

                {/** 파일 선택 */}
                <label htmlFor="fileInput" className={`${file ? "text-[#B25FF3]" : "text-neutral-400"} cursor-pointer`}>
                    <MdOutlineImage />
                    <input
                        id="fileInput"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={handleFileChange}
                    />
                </label>

                {/** 전송 */}
                <button className="text-[#B25FF3]" type="submit">
                    <MdSend />
                </button>
            </form>
        </div>
    );
};

export default ChatInput;