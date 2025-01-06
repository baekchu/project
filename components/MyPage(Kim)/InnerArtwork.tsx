import React, { useEffect, useState, useRef } from "react";
import { FImgData } from "../utility/ImgDataModule";
import useImgState from "@/zustand/ImgState";
import { makeImgDataList } from "../utility/LogModule";
import { auth } from "@/config/firebase";

const InnerArtwork = ({ docIDs }: { docIDs: string[] }) => {
    const { setImgIndex, setImgArray } = useImgState();
    const [arts, setArts] = useState<FImgData[]>([]);

    useEffect(() => {
        const fetchD = async () => {
            const temp = await makeImgDataList(docIDs, auth.currentUser?.uid);
            const newArr = temp.reverse();
            setArts(newArr);
            setImgArray(newArr);
        };
        fetchD();
    }, [docIDs]);


    // 개별 카드
    const SingleCard = ({ src, title, imgIndex }
        : { src: string, title: string, imgIndex: number }
    ) => {
        return (
            <div className={`transition-opacity duration-200 hover:opacity-80 overflow-hidden aspect-square`}
                onClick={() => { 
                    setImgArray(arts);
                    setImgIndex(imgIndex, "default");
                }} >
                <img src={src} alt={title} className={`w-full h-full object-cover`} />
            </div>
        )
    };


    // 출력 개수 및 더보기 관리
    const [showNum, setShowNum] = useState<number>(0);
    useEffect(() => {
        if (arts.length > 0) {
            setShowNum(Math.min(arts.length, 12));
        }
    }, [arts]);
    const showMore = () => {
        setShowNum(Math.min(showNum + 12, arts.length));
    };


    return (
        <div className="w-full flex flex-col items-center gap-4">
            {arts.length > 0 ? <>
                <div className="grid grid-cols-3 gap-1 max-[700px]:grid-cols-2 max-[400px]:grid-cols-1">
                    {arts.map((imgData, index) => {
                        if (index < showNum) {
                            return (<SingleCard src={imgData.images[0]} title={imgData.title} imgIndex={index} key={index} />);
                        }
                    })}
                </div>

                {showNum < arts.length && (
                    <button className="px-3 py-0.5 rounded hover:bg-neutral-200 text-sm font-bold text-[#B25FF3]"
                        onClick={showMore}>
                        더보기
                    </button>
                )}
            </> : <div className="text-sm py-12 text-neutral-500">
                표시할 작품이 없습니다
            </div>}
        </div>
    );
};

export default InnerArtwork;