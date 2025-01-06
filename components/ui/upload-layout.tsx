'use client';

import { LuX } from "react-icons/lu";
import { useRouter } from 'next/navigation';
import { useCallback, useRef, ReactNode } from 'react';
import useImgUploadState from "@/zustand/ImgUploadState";
import usePortfolioUploadState from "@/zustand/PortfolioUploadState";
import { FaLessThanEqual } from "react-icons/fa";

export default function WorkLayout({ children, type="image" }: { children: ReactNode, type:"image"|"post"|"portfolio" }) {
    const router = useRouter();
    const overlay = useRef<HTMLDivElement>(null);
    const wrapper = useRef<HTMLDivElement>(null);
    const {setIsImgUploadOpen} = useImgUploadState();
    const {setIsPostUploadOpen, setIsPortfolioUploadOpen} = usePortfolioUploadState();

    const onDismiss = useCallback(() => {
        if (type=="image") {
            setIsImgUploadOpen(false);
        } else if (type="post") {
            setIsPostUploadOpen(false);
        } else { // type == "portfolio"
            setIsPortfolioUploadOpen(false);
        }
    }, [router]);

    const handleClick = useCallback(
        (e: React.MouseEvent<HTMLDivElement>) => {
            if (e.target === overlay.current && onDismiss) {
                onDismiss();
            }
        },
        [onDismiss, overlay]
    );

    return (
        <div
            ref={overlay}
            className='fixed z-10 left-0 right-0 top-0 bottom-0 mx-auto bg-black/80 hover:cursor-pointer'
            onClick={(e) => handleClick(e)}
        >
            <button
                type='button'
                onClick={onDismiss}
                className='absolute top-3 right-3 lg:top-2 lg:right-2 z-10'
            >
                <LuX className='text-black lg:text-white w-5 h-5 lg:w-6 lg:h-6 opacity-90 hover:opacity-100' />
            </button>

            <div
                ref={wrapper}
                className='flex justify-start items-center flex-col absolute h-screen lg:h-[calc(100vh_-_40px)] animate-slide-up w-full bottom-0 bg-white lg:rounded-t-xl overflow-y-scroll hover:cursor-default'
            >
                {children}
            </div>
        </div>
    );
}
