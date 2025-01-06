import React, { useEffect, useState } from "react";
import {
    FUserData, getUserData, checkNickUseable,
    updateUserData
} from "../utility/UserDataModule";
import { auth } from "@/config/firebase";

import { IoMdClose } from "react-icons/io";

interface EditProfileProps {
    setModalClose: React.Dispatch<React.SetStateAction<boolean>>;
}

interface FUpdateUser {
    nickname: string,
    desc: string,
    category: string,
    tags: string[],
    profImg?: File,
    backImg?: File,
}

const EditProfile: React.FC<EditProfileProps> = ({ setModalClose }) => {
    const initData = {
        nickname: "",
        desc: "",
        category: "",
        tags: [],
        profImg: undefined,
        backImg: undefined,
    };
    const [myData, setMyData] = useState<FUpdateUser>(initData);
    const [initNick, setInitNick] = useState<string>("");
    const [initProf, setInitProf] = useState<string>("");
    const [initBack, setInitBack] = useState<string>("");

    useEffect(() => {
        const fetchMyData = async () => {
            if (!auth.currentUser?.uid) return;
            const d = await getUserData(auth.currentUser?.uid);
            setInitNick(d.nickname);
            setInitProf(d.profImg);
            setInitBack(d.backImg);
            setMyData({
                nickname: d.nickname,
                desc: d.desc,
                category: d.category,
                tags: d.tags,
            });
        };
        fetchMyData();
    }, [auth.currentUser?.uid]);


    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value, name } = event.target;
        setMyData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // 닉네임 중복검사
    const [nickUseable, setNickUseable] = useState<boolean | null>(null);
    const checkNick = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        if (myData?.nickname) {
            e.preventDefault();
            const res = await checkNickUseable(myData.nickname);
            const noChange: boolean = myData.nickname === initNick; // 처음 닉네임과 동일한 경우
            setNickUseable(res || noChange);
        }
    };
    useEffect(() => {
        setNickUseable(null);
    }, [myData?.nickname]);


    const [tempTag, setTempTag] = useState<string>("");

    const addNewTag = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (tempTag.trim() !== '' && !myData.tags.includes(tempTag) && myData.tags.length < 5) {
            setMyData((prevData) => ({
                ...prevData,
                tags: [...prevData.tags, tempTag],
                category: '',
            }));
            setTempTag("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setMyData((prevData) => ({
            ...prevData,
            tags: prevData.tags.filter((tag) => tag !== tagToRemove),
        }));
    };

    const [newProfImg, setNewPropImg] = useState<File | undefined>();
    const [newBackImg, setNewBackImg] = useState<File | undefined>();
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>, setImage: React.Dispatch<React.SetStateAction<File | undefined>>) => {
        const file = event.target.files?.[0];

        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(file);
            };
            reader.readAsDataURL(file);
        } else {
            setImage(undefined);
        }
    };

    // 모달 창 닫기
    const closeModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (confirm("편집을 취소하겠습니까?")) {
            setMyData(initData);
            setModalClose(false);
        };
    };

    // 모달 등록하기
    const submitForm = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (nickUseable === null) {
            alert("닉네임 중복 검사를 진행해 주세요");
            return;
        } else if (!nickUseable) {
            alert("닉네임이 중복되었습니다.");
            return;
        }
        if (!auth.currentUser?.uid) return;
        if (confirm("변경사항을 저장하시겠습니까?")) {
            const res = await updateUserData(auth.currentUser?.uid, myData.nickname, myData.desc, myData.category, myData.tags, newProfImg, newBackImg);
            if (res) {
                setModalClose(false);
                window.location.reload();
            } else {
                alert("업데이트에 실패했습니다.");
            }
        }
    };


    return (
        <div className="fixed top-0 w-screen h-screen bg-neutral-700 bg-opacity-25 backdrop-blur-sm z-50">
            <form
                className="fixed left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow w-full max-w-[520px] h-fit overflow-auto"
                style={{ maxHeight: "calc(100vh - 100px)" }}
                onSubmit={(e) => submitForm(e)}
            >
                <div className="relative w-full h-fit text-center font-bold">
                    프로필 편집
                    <button className="absolute right-0 rounded hover:bg-neutral-200 p-1" onClick={closeModal}><IoMdClose /></button>
                </div>

                <div className="w-full h-fit flex-1 overflow-auto flex flex-col gap-6 my-2 text-sm">
                    {/** 배경 이미지 */}
                    <div>
                        <div className="font-bold">프로필 배경 사진</div>
                        <input
                            type="file"
                            className="hidden"
                            id="backImg"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setNewBackImg)}
                        />
                        <label htmlFor="backImg"
                            className="rounded-lg w-full h-32 border border-neutral-400 bg-neutral-200 
                         cursor-pointer flex items-center justify-center overflow-hidden hover:bg-neutral-400">
                            {newBackImg
                                ? <img src={URL.createObjectURL(newBackImg)} alt={""} className="w-full h-auto object-cover" />
                                : <div className="relative overflow-hidden">
                                    <img src={initBack} alt={""} />
                                    <div className="absolute inset-0 flex items-center justify-center
                                     bg-black bg-opacity-30 hover:bg-opacity-50 text-center transition-opacity">
                                        <div className="font-bold text-white">변경하기</div>
                                    </div>
                                </div>}
                        </label>
                    </div>

                    {/** 프로필 이미지 */}
                    <div className="flex flex-col gap-1">
                        <div className="font-bold">프로필 사진</div>
                        <input
                            type="file"
                            className="hidden"
                            id="profImg"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setNewPropImg)}
                        />
                        <label htmlFor="profImg"
                            className="rounded-full w-32 h-32 border border-neutral-400 bg-neutral-200 
                         cursor-pointer flex items-center justify-center overflow-hidden hover:bg-neutral-400">
                            {newProfImg
                                ? <img src={URL.createObjectURL(newProfImg)} alt={""} className="w-full h-auto object-cover" />
                                : <div className="relative overflow-hidden">
                                    <img src={initProf} alt={""} />
                                    <div className="absolute inset-0 flex items-center justify-center
                                 bg-black bg-opacity-30 hover:bg-opacity-50 text-center transition-opacity">
                                        <div className="font-bold text-white">변경하기</div>
                                    </div>
                                </div>}
                        </label>
                    </div>

                    {/** 닉네임 */}
                    <div className="flex flex-col gap-1">
                        <div className="font-bold">닉네임</div>
                        <div className="flex flex-row items-center gap-2">
                            <input className="w-36 h-6 border border-neutral-200 rounded"
                                value={myData?.nickname} name="nickname" onChange={handleInputChange} />
                            <button
                                className={`rounded px-2 py-0.5 border ${nickUseable === null
                                    ? "border-[#B25FF3] text-[#B25FF3] hover:bg-neutral-200"
                                    : nickUseable
                                        ? "text-white bg-[#B25FF3]"
                                        : "text-white bg-red-500"
                                    }`}
                                disabled={(nickUseable !== null)}
                                onClick={e => { checkNick(e) }}>
                                {nickUseable === null ? "중복 검사" : nickUseable ? "사용 가능" : "사용 불가"}
                            </button>
                        </div>
                    </div>

                    {/** 자기소개 */}
                    <div className="flex flex-col gap-1">
                        <div className="font-bold">자기소개</div>
                        <textarea className="w-full h-36 border border-neutral-200 rounded resize-none"
                            value={myData?.desc} name="desc" onChange={handleInputChange} />
                    </div>

                    {/** 카테고리 */}
                    <div className="flex flex-col gap-1">
                        <div className="font-bold">카테고리</div>
                        <input className="w-32 h-6 border border-neutral-200 rounded resize-none"
                            value={myData?.category} name="category" onChange={handleInputChange} />
                    </div>

                    {/** 관심태그 */}
                    <div className="flex flex-col gap-1">
                        <div className="font-bold">
                            태그
                            <span className="text-neutral-500 text-xs ml-2">({myData.tags.length}/5)</span>
                        </div>
                        <div className="flex flex-row gap-2">
                            <input
                                className="w-36 h-6 border border-neutral-200 rounded"
                                value={tempTag}
                                onChange={(e) => { setTempTag(e.target.value) }}
                            />
                            <button className="border border-neutral-200 rounded hover:bg-neutral-200 px-2 h-6"
                                onClick={e => { addNewTag(e) }}>태그 추가</button>
                        </div>
                        <div className="flex flex-row gap-2 flex-wrap my-2">
                            {myData.tags.map((tag) => (
                                <div key={tag} onClick={() => removeTag(tag)}
                                    className="cursor-pointer rounded-full px-2 text-white bg-neutral-500 hover:line-through">
                                    #{tag}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-row gap-1 text w-full justify-end">
                    <button onClick={closeModal} className="rounded px-4 py-1 hover:bg-neutral-200 border border-neutral-200">
                        취소
                    </button>
                    <button type="submit" className="rounded px-4 py-1 bg-[#B25FF3] hover:bg-[#63308B] text-white">
                        저장
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;