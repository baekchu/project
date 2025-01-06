import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import { storage } from "./firebase";
import { FilesWithId, ImagesPreview } from "./types/file";

import type { SyntheticEvent } from 'react';
import type { MotionProps } from 'framer-motion';

export function preventBubbling(
    callback?: ((...args: never[]) => unknown) | null,
    noPreventDefault?: boolean
) {
    return (e: SyntheticEvent): void => {
        e.stopPropagation();

        if (!noPreventDefault) e.preventDefault();
        if (callback) callback();
    };
}

export function delayScroll(ms: number) {
    return (): NodeJS.Timeout => setTimeout(() => window.scrollTo(0, 0), ms);
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getStatsMove(movePixels: number): MotionProps {
    return {
        initial: {
            opacity: 0,
            y: -movePixels
        },
        animate: {
            opacity: 1,
            y: 0
        },
        exit: {
            opacity: 0,
            y: movePixels
        },
        transition: {
            type: 'tween',
            duration: 0.15
        }
    };
}

export function isPlural(count: number): string {
    return count > 1 ? 's' : '';
}

export async function uploadImages(
    userId: string,
    files: FilesWithId
): Promise<ImagesPreview | null> {
    if (!files.length) return null;

    const imagesPreview = await Promise.all(
        files.map(async (file) => {
            let src: string;

            const { id, name: alt } = file;

            const storageRef = ref(storage, `images/${userId}/${alt}`);

            try {
                src = await getDownloadURL(storageRef);
            } catch {
                await uploadBytesResumable(storageRef, file);
                src = await getDownloadURL(storageRef);
            }

            return { id, src, alt };
        })
    );

    return imagesPreview;
}