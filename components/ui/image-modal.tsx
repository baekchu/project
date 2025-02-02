import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { AiOutlineArrowLeft, AiOutlineArrowRight } from 'react-icons/ai';

import { Loading } from './loading';
import { backdrop, modal } from './modal';
import type { VariantLabels } from 'framer-motion';
import type { ImageData } from "@/config/types/file";
import { preventBubbling } from '@/config/utils';
import { Button } from './button';
import { cn } from '@/utils/utils';

type ImageModalProps = {
    tweet?: boolean;
    imageData: ImageData;
    previewCount: number;
    selectedIndex?: number;
    handleNextIndex?: (type: 'prev' | 'next') => () => void;
};

type ArrowButton = ['prev' | 'next', string | null, React.ComponentType];

const arrowButtons: Readonly<ArrowButton[]> = [
    ['prev', null, AiOutlineArrowLeft],
    ['next', 'order-1', AiOutlineArrowRight]
];

export function ImageModal({
    tweet,
    imageData,
    previewCount,
    selectedIndex,
    handleNextIndex
}: ImageModalProps): JSX.Element {
    const [indexes, setIndexes] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    const { src, alt } = imageData;

    const requireArrows = handleNextIndex && previewCount > 1;

    useEffect(() => {
        if (
            tweet &&
            selectedIndex !== undefined &&
            !indexes.includes(selectedIndex)
        ) {
            setLoading(true);
            setIndexes([...indexes, selectedIndex]);
        }

        const image = new Image();
        image.src = src;
        image.onload = (): void => setLoading(false);
    }, [...(tweet && previewCount > 1 ? [src] : [])]);

    useEffect(() => {
        if (!requireArrows) return;

        const handleKeyDown = ({ key }: KeyboardEvent): void => {
            const callback =
                key === 'ArrowLeft'
                    ? handleNextIndex('prev')
                    : key === 'ArrowRight'
                        ? handleNextIndex('next')
                        : null;

            if (callback) callback();
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleNextIndex]);

    return (
        <>
            {requireArrows &&
                arrowButtons.map(([name, className, IconComponent]) => (
                    <Button
                        className={cn(
                            `absolute z-10 text-3xl text-light-white  
               `,
                            name === 'prev' ? 'left-2' : 'right-2',
                            className
                        )}
                        onClick={preventBubbling(handleNextIndex(name))}
                        key={name}
                    >
                        <IconComponent /> {/* react-icons 아이콘 컴포넌트로 변경 */}
                    </Button>
                ))}
            <AnimatePresence mode='wait'>
                {loading ? (
                    <motion.div
                        className='mx-auto'
                        {...backdrop}
                        exit={tweet ? (backdrop.exit as VariantLabels) : undefined}
                        transition={{ duration: 0.15 }}
                    >
                        <Loading iconClassName='w-20 h-20' />
                    </motion.div>
                ) : (
                    <motion.div className='relative mx-auto' {...modal} key={src}>
                        <picture className='group relative flex max-w-3xl'>
                            <source srcSet={src} type='image/*' />
                            <img
                                className='max-h-[75vh] rounded-md object-contain md:max-h-[80vh]'
                                src={src}
                                alt={alt}
                                onClick={preventBubbling()}
                            />
                            <a
                                className='trim-alt accent-tab absolute bottom-0 right-0 mx-2 mb-2 translate-y-4
                           rounded-md bg-main-background/40 px-2 py-1 text-sm text-light-primary/80 opacity-0
                           transition hover:bg-main-accent hover:text-white focus-visible:translate-y-0
                           focus-visible:bg-main-accent focus-visible:text-white focus-visible:opacity-100
                           group-hover:translate-y-0 group-hover:opacity-100 dark:text-dark-primary/80'
                                href={src}
                                target='_blank'
                                rel='noreferrer'
                                onClick={preventBubbling(null, true)}
                            >
                                {alt}
                            </a>
                        </picture>
                        <a
                            className='custom-underline absolute left-0 -bottom-7 font-medium text-light-primary/80
                         decoration-transparent underline-offset-2 transition hover:text-light-primary hover:underline
                         hover:decoration-light-primary focus-visible:text-light-primary dark:text-dark-primary/80 
                         dark:hover:text-dark-primary dark:hover:decoration-dark-primary dark:focus-visible:text-dark-primary'
                            href={src}
                            target='_blank'
                            rel='noreferrer'
                            onClick={preventBubbling(null, true)}
                        >
                            원본으로 보기
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
