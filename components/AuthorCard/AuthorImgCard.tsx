import React, { useEffect, useState, memo } from "react";
import { getAuthorImgs } from "../utility/SearchModule";
import useImgState from "@/zustand/ImgState";
import { FImgData } from "../utility/ImgDataModule";

const AuthorImgCard = ({uid}:{uid: string}) => {
    const [authorImgs, setAuthorImgs] = useState<FImgData[]>([]);
    useEffect(() => {
        const fetchAI = async () => {
            const i = await getAuthorImgs(uid);
            setAuthorImgs(i);
        };
        fetchAI();
    }, [uid]);

    const { setFollowingImgArray, setImgIndex } = useImgState();
    const imgClicked = async (idx: number) => {
        setFollowingImgArray(authorImgs);
        setImgIndex(idx, "following");
    };

    return (<div className="w-full max-h-[230px] overflow-hidden">
        {authorImgs.length >= 4 ? <>
            {/** 대표 이미지 4개 */}
            <div className="flex flex-row gap-0.5 w-full h-full">
                {/** 좌측 가장 큰 이미지 */}
                <img className="w-1/2 object-cover cursor-pointer" src={authorImgs[0].images[0]} onClick={()=>{imgClicked(0)}}/>
                <div className="w-1/2 flex flex-col gap-0.5">
                    {/** 우측 상단 이미지 */}
                    <img className="h-3/5 object-cover cursor-pointer" src={authorImgs[1].images[0]} onClick={()=>{imgClicked(1)}}/>
                    <div className="h-2/5 flex flex-row gap-0.5">
                        {/** 작은 이미지 2개 */}
                        <img className="w-1/2 h-full object-cover cursor-pointer" src={authorImgs[2].images[0]} onClick={()=>{imgClicked(2)}}/>
                        <img className="w-1/2 h-full object-cover cursor-pointer" src={authorImgs[3].images[0]} onClick={()=>{imgClicked(3)}}/>
                    </div>
                </div>
            </div>
        </> : <>
            {authorImgs.length === 3 ? <>
                {/** 대표 이미지 3개 */}
                <div className="flex flex-row gap-0.5 w-full h-full">
                    {/** 좌측 가장 큰 이미지 */}
                    <img className="w-1/2 object-cover cursor-pointer" src={authorImgs[0].images[0]} onClick={()=>{imgClicked(0)}}/>
                    <div className="w-1/2 flex flex-col gap-0.5">
                        {/** 우측 상단 이미지 */}
                        <img className="h-3/5 object-cover cursor-pointer" src={authorImgs[1].images[0]} onClick={()=>{imgClicked(1)}}/>
                        <div className="h-2/5 flex flex-row gap-0.5">
                            {/** 작은 이미지 */}
                            <img className="w-full h-full object-cover cursor-pointer" src={authorImgs[2].images[0]} onClick={()=>{imgClicked(2)}}/>
                        </div>
                    </div>
                </div>
            </> : <>
                {authorImgs.length === 2 ? <>
                    {/** 대표 이미지 2개 */}
                    <div className="flex flex-row gap-0.5 w-full h-full">
                        {/** 좌측 가장 큰 이미지 */}
                        <img className="w-1/2 object-cover cursor-pointer" src={authorImgs[0].images[0]} onClick={()=>{imgClicked(0)}}/>
                        <div className="w-1/2 flex flex-col gap-0.5">
                            {/** 우측 상단 이미지 */}
                            <img className="h-full object-cover cursor-pointer" src={authorImgs[1].images[0]} onClick={()=>{imgClicked(1)}}/>
                        </div>
                    </div>
                </> : <>
                    {authorImgs.length === 1 && <>
                    {/** 대표 이미지 1개 */}
                    <div className="flex flex-row gap-0.5 w-full h-full">
                        {/** 좌측 가장 큰 이미지 */}
                        <img className="w-full object-cover cursor-pointer" src={authorImgs[0].images[0]} onClick={()=>{imgClicked(0)}}/>
                    </div>
                    </>}
                </>}
            </>}
        </>}

        {authorImgs.length > 0 && (
            <div className="w-full border border-neutral-200 mt-2" />
        )}
    </div>);
};

export default memo(AuthorImgCard);