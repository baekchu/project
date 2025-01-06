import { memo } from "react";
import { FImgData } from "../utility/ImgDataModule";
import Masonry from 'react-masonry-css';
import ImgCard from '@/components/Common(Kim)/ImgCard/ImgCard';
import useImgState from "@/zustand/ImgState";

const breakPointsObj = {
    default: 4,
    3000: 6,
    2000: 5,
    1200: 3,
    1000: 2,
    500: 1,
};

const ImgArea = ({
    tabNum, imgArray, searchWord
}: {
    tabNum: number,
    imgArray: FImgData[],
    searchWord: string
}
) => {
    const { setImgArray, setImgIndex } = useImgState();
    return (
        <div className="w-full max-w-[1400px] py-1">
            {tabNum === 0 && <div className="text-lg font-bold text-white px-4 py-0.5"
                style={{ background: 'linear-gradient(to right, #B25FF3, white)' }}>
                캔버스</div>}
            {imgArray.length > 0 ? (
                <Masonry className='flex gap-2' breakpointCols={breakPointsObj}>
                    {imgArray.length > 0 && imgArray.map((dat, index) => {
                        return (
                            <div
                                className=""
                                key={index}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    await setImgArray(imgArray);
                                    setImgIndex(index, "default");
                                }}>
                                <ImgCard type='default' docID={dat.objectID} imgIndex={index} key={index} />
                            </div>
                        )
                    })}
                </Masonry>) : (
                <div className="w-full h-20 flex items-center justify-center text-sm text-neutral-600">
                    {`"${searchWord}"에 대한 이미지 검색 결과가 없습니다`}
                </div>
            )}
        </div>
    );
};

export default memo(ImgArea);