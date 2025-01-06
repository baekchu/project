"use client"
import React, { useEffect, useState, useRef } from "react";
import { checkNickUseable, updateUserData } from "../utility/UserDataModule";
import { auth } from "@/config/firebase";
import { useRouter } from "next/navigation";
import useInitState from "@/zustand/InitState";


interface FUpdateUser {
    nickname: string,
    desc: string,
    category: string,
    tags: string[],
    profImg?: File,
    backImg?: File,
}

const InitModal = () => {
    const { isInitModalOpen, setInitModalOpen } = useInitState();
    const router = useRouter();
    const initData = {
        nickname: "",
        desc: "",
        category: "",
        tags: [],
        profImg: undefined,
        backImg: undefined,
    };
    const [myData, setMyData] = useState<FUpdateUser>(initData);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<HTMLTextAreaElement>) => {
        const { value, name } = event.target;
        setMyData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // 닉네임 중복검사
    const [nickUseable, setNickUseable] = useState<boolean | null>(null);
    const checkNick = async (e: React.MouseEvent<HTMLButtonElement>) => {
        if (myData?.nickname) {
            e.preventDefault();
            const res = await checkNickUseable(myData.nickname);
            setNickUseable(res);
        }
    };
    useEffect(() => {
        setNickUseable(null);
    }, [myData?.nickname]);


    const [tempTag, setTempTag] = useState<string>("");

    const addNewTag = (e: React.FormEvent<HTMLFormElement>) => {
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

    // 모달 창 초기화
    const closeModal = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        e.preventDefault();
        if (confirm("초기화하겠습니까?")) {
            setMyData(initData);
        };
    };

    // 모달 등록하기
    const categoryInputRef = useRef<HTMLInputElement>(null);
    const tagsInputRef = useRef<HTMLInputElement>(null);
    const submitForm = async (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        if (!auth.currentUser?.uid) return;
        if (nickUseable === null) {
            alert("닉네임 중복 검사를 진행해 주세요");
            return;
        } else if (!nickUseable) {
            alert("닉네임이 중복되었습니다.");
            return;
        }

        if (myData.category === "") {
            alert("카테고리를 작성해주세요");
            if (categoryInputRef.current) {
                categoryInputRef.current.focus();
            }
            return;
        } else if (myData.tags.length <= 0) {
            alert("관련 태그를 하나 이상 등록해주세요");
            if (tagsInputRef.current) {
                tagsInputRef.current.focus();
            }
            return;
        }

        if (confirm("저장하시겠습니까?")) {
            const res = await updateUserData(auth.currentUser?.uid, myData.nickname, myData.desc, myData.category, myData.tags, newProfImg, newBackImg);
            if (res) {
                router.push('/');  // 메인 페이지로 이동
                setInitModalOpen(false);
            } else {
                alert("저장에 실패했습니다.");
            }
        }
    };


    return (
        <>
            {isInitModalOpen && (
                <div className="w-screen h-screen fixed z-50 top-0 left-0 flex items-center justify-center">
                    <div className="absolute top-0 left-0 w-screen h-screen bg-black opacity-70">

                    </div>

                    <div
                        className="absolute bg-white rounded w-full px-4 py-2 max-w-[600px] max-h-full my-6 overflow-auto"
                    >
                        <div className="relative w-full h-fit text-center font-bold mt-5">
                            프로필 작성
                        </div>

                        <div className="w-full h-fit flex-1 overflow-auto flex flex-col gap-7 my-2 text-sm">
                            {/** 배경 이미지 */}
                            <div className="flex flex-col gap-2">
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
                         cursor-pointer flex items-center justify-center text-center overflow-hidden hover:bg-neutral-300">
                                    {newBackImg
                                        ? <img src={URL.createObjectURL(newBackImg)} alt={""} className="w-full h-auto object-cover" />
                                        : <div className=" font-bold text-neutral-500">등록하기</div>}
                                </label>
                            </div>

                            {/** 프로필 이미지 */}
                            <div className="flex flex-row w-full justify-between items-end">
                                {/** 프로필 입력 */}
                                <div className="flex flex-col gap-2">
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
                            cursor-pointer flex items-center justify-center overflow-hidden hover:bg-neutral-300">
                                        {newProfImg
                                            ? <img src={URL.createObjectURL(newProfImg)} alt={""} className="w-full h-auto object-cover" />
                                            : <div className="font-bold text-neutral-500">등록하기</div>}
                                    </label>
                                </div>

                                {/** 미리보기 */}
                                <div className="flex flex-col rounded border border-neutral-200 p-2 gap-2 w-fit min-w-[160px] h-fit shadow bg-[#fffff3]">
                                    <div className="text-neutral-500 font-bold">이렇게 보여져요!</div>
                                    <div className="flex flex-row items-center gap-4">
                                        <img src={newProfImg ? URL.createObjectURL(newProfImg) : ""} alt={""} className="w-8 h-8 rounded-full object-cover" />
                                        <div className="">{myData.nickname ? `${myData.nickname}` : "닉네임"}</div>
                                    </div>
                                </div>
                            </div>

                            {/** 닉네임 */}
                            <div className="flex flex-col gap-2">
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
                            <div className="flex flex-col gap-2">
                                <div className="font-bold">자기소개</div>
                                <textarea className="w-full h-36 border border-neutral-200 rounded resize-none"
                                    value={myData?.desc} name="desc" onChange={handleInputChange} />
                            </div>

                            {/** 카테고리 */}
                            <div className="flex flex-col gap-2">
                                <div className="font-bold">카테고리</div>
                                <input className="w-32 h-6 border border-neutral-200 rounded resize-none"
                                    value={myData?.category}
                                    name="category"
                                    onChange={handleInputChange}
                                    ref={categoryInputRef} />
                            </div>

                            {/** 관심태그 */}
                            <div className="flex flex-col gap-2">
                                <div className="font-bold">
                                    태그
                                    <span className="text-neutral-500 text-xs ml-2">({myData.tags.length}/5)</span>
                                </div>
                                <form className="flex flex-row gap-2"
                                    onSubmit={e => { addNewTag(e) }}>
                                    <input
                                        className="w-36 h-6 border border-neutral-200 rounded"
                                        value={tempTag}
                                        onChange={(e) => { setTempTag(e.target.value) }}
                                        ref={tagsInputRef}
                                    />
                                    <button className="border border-neutral-200 rounded hover:bg-neutral-200 px-2 h-6"
                                        type="submit">태그 추가</button>
                                </form>
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

                        <div className="flex flex-row gap-2 w-full justify-end">
                            <button onClick={closeModal} className="rounded px-3 py-0.5 hover:bg-neutral-200 border border-neutral-200">
                                초기화
                            </button>
                            <button className="rounded px-6 py-1 bg-[#B25FF3] hover:bg-[#63308B] text-white"
                                onClick={(e) => submitForm(e)}>저장</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default InitModal;