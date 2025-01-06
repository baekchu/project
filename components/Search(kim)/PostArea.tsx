import { memo } from "react";
import ShortPostBox from '@/components/Common(Kim)/BulletinCard/ShortPostCard';

const PostArea = ({
    tabNum, postList, searchWord
}: {
    tabNum: number,
    postList: any[],
    searchWord: string
}) => {
    return (
        <>
            <div className="w-full max-w-[1400px] py-1">
                {tabNum === 0 && <div className="text-lg font-bold text-white px-4 py-0.5 mb-2"
                    style={{ background: 'linear-gradient(to right, #B25FF3, white)' }}>
                    게시글</div>}
                {postList.length > 0 ? (
                    <div className="w-full flex flex-col gap-y-1">
                        {postList.map((post, index) => {
                            return (
                                <ShortPostBox postData={post} indexNum={index} key={index} />
                            );
                        })}
                    </div>) : (
                    <div className="w-full h-20 flex items-center justify-center text-sm text-neutral-600">
                        {`"${searchWord}"에 대한 게시글이 없습니다`}
                    </div>
                )}
            </div>
        </>
    );
};

export default memo(PostArea)