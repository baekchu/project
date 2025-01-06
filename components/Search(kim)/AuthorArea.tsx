import { memo } from "react";
import Masonry from 'react-masonry-css';
import { FUserData } from "../utility/UserDataModule";
import AuthorCard from "../AuthorCard/AuthorCard";

const breakPointsObj = {
    default: 4,
    3000: 6,
    2000: 5,
    1200: 3,
    1000: 2,
    500: 1,
};

const AuthorArea = (
    {
        tabNum, authorArray, searchWord
    }: {
        tabNum: number,
        authorArray: FUserData[],
        searchWord: string
    }
) => {
    return (
        <div className="w-full max-w-[1400px] py-1">
            {tabNum === 0 && <div className="text-lg font-bold text-white px-4 py-0.5 mb-2"
                style={{ background: 'linear-gradient(to right, #B25FF3, white)' }}>
                작가</div>}
            {authorArray.length > 0 ? (
                <Masonry className='flex gap-2' breakpointCols={breakPointsObj}>
                    {authorArray.map((author, index) => {
                        return (
                            <div className="my-2" key={index}>
                                <AuthorCard uid={author.uid} key={index} />
                            </div>
                        );
                    })}
                </Masonry>
            ) : (
                <div className="w-full h-20 flex items-center justify-center text-sm text-neutral-600">
                    {`"${searchWord}"에 대한 작가 검색 결과가 없습니다`}
                </div>
            )}

        </div>
    );
};

export default memo(AuthorArea)