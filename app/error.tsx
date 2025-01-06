"use client"

import { useRouter } from 'next/navigation'

export default function ErrorPage({ error }: { error: Error & { digest?: string } }) {
    const router = useRouter();
    return (
        <div className='w-screen flex icen justify-center bg-neutral-200 mt-32'>
            <div className="my-12 flex flex-col gap-6">
                <div className="flex flex-row gap-4 items-end">
                    <div className="text-[#B25FF3] text-9xl">Error</div>
                    <div className="font-bold text-5xl">에러가 발생했습니다</div>
                </div>
                <div className="text-3xl">
                    <p>예기치 못한 에러가 발생했어요.</p>
                    <p>다른 페이지를 찾아보실래요?</p>
                    <p className="text-xs">
                        {error?.message}
                    </p>
                </div>
                <div className="flex flex-col gap-2">
                    <button className="font-bold text-xl text-[#B25FF3] rounded-full shadow bg-white w-[160px] py-1 hover:bg-neutral-200"
                        onClick={() => { window.location.reload() }}>새로고침</button>
                    <button className="font-bold text-xl text-[#B25FF3] rounded-full shadow bg-white w-[160px] py-1 hover:bg-neutral-200"
                        onClick={() => { router.push('/') }}>홈으로</button>
                </div>
            </div>
        </div>
    )
}