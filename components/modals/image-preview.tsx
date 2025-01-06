import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { AiOutlineClose, AiOutlineDrag } from "react-icons/ai";

import type { MotionProps } from "framer-motion";
import type { ImagesPreview, ImageData } from "@/config/types/file";
import { preventBubbling } from "@/config/utils";
import { ImageModal } from "../ui/image-modal";
import { Modal } from "../ui/modal";
import { Button } from "../ui/button";
import { ToolTip } from "../ui/Tooltip";
import { NextImage } from "../ui/next-image";
import { useModal } from "../hooks/useModal";
import { cn } from "@/utils/utils";

import { useSortable, defaultAnimateLayoutChanges } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    MeasuringStrategy,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToParentElement } from "@dnd-kit/modifiers";

function animateLayoutChanges(args: any) {
    const { isSorting, wasDragging } = args;

    if (isSorting || wasDragging) {
        return defaultAnimateLayoutChanges(args);
    }

    return true;
}

const measuringConfig = {
    droppable: {
        strategy: MeasuringStrategy.Always,
    },
};

type ImagePreviewProps = {
    upload?: boolean;
    viewUpload?: boolean;
    previewCount: number;
    imagesPreview: ImagesPreview;
    isEventPrevent: boolean;
    removeImage?: (targetId: string) => void;
    setVisualMedia: (newIds: string[]) => void;
};

const variants: MotionProps = {
    initial: { opacity: 0, scale: 0.5 },
    animate: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.3 },
    },
    exit: { opacity: 0, scale: 0.5 },
    transition: { type: "spring", duration: 0.5 },
};

type PostImageBorderRadius = Record<number, string[]>;

const postImageBorderRadius: Readonly<PostImageBorderRadius> = {
    1: ["rounded-2xl"],
    2: ["rounded-tl-2xl rounded-bl-2xl", "rounded-tr-2xl rounded-br-2xl"],
    3: ["rounded-tl-2xl rounded-bl-2xl", "rounded-tr-2xl", "rounded-br-2xl"],
    4: ["rounded-tl-2xl", "rounded-tr-2xl", "rounded-bl-2xl", "rounded-br-2xl"],
};

export function ImagePreview({
    upload,
    viewUpload,
    previewCount,
    imagesPreview,
    isEventPrevent,
    removeImage,
    setVisualMedia,
}: ImagePreviewProps): JSX.Element {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);

    const { open, openModal, closeModal } = useModal();
    const { attributes, listeners, setNodeRef, transform, transition } =
        useSortable({ id: previewCount, animateLayoutChanges });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    useEffect(() => {
        const imageData = imagesPreview[selectedIndex];
        setSelectedImage(imageData);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedIndex]);


    const handleSelectedImage = (index: number) => () => {
        setSelectedIndex(index);
        openModal();
    };

    const handleNextIndex = (type: "prev" | "next") => () => {
        const nextIndex =
            type === "prev"
                ? selectedIndex === 0
                    ? previewCount - 1
                    : selectedIndex - 1
                : selectedIndex === previewCount - 1
                    ? 0
                    : selectedIndex + 1;

        setSelectedIndex(nextIndex);
    };

    function handleDragEnd(event: any) {
        const { active, over } = event;

        if (active.id !== over.id) {
            const oldIndex = itemIds.findIndex((item: any) => item === active.id);
            const newIndex = itemIds.findIndex((item: any) => item === over.id);

            // 새로 정렬된 아이디 배열을 만들어 setVisualMedia에 전달
            const newIds: string[] = [...itemIds];
            newIds.splice(oldIndex, 1);
            newIds.splice(newIndex, 0, active.id);
            setVisualMedia(newIds);
        }
    }


    const isUpload = upload ?? viewUpload;

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );
    const itemIds = useMemo(
        () => imagesPreview.map((item) => item.id),
        [imagesPreview]
    );

    const SortableItem = ({ id, children }: { id: string; children: any }) => {
        const { attributes, listeners, setNodeRef, transform, transition } =
            useSortable({ id: id });

        const style = {
            transform: CSS.Transform.toString(transform),
            transition,
        };

        return (
            <div className="relative" style={style}>
                {children}
                {!isEventPrevent && (
                    <div
                        {...attributes}
                        {...listeners}
                        className=" absolute left-[50%] top-[50%]  z-10 translate-x-[-50%] translate-y-[-50%] touch-none rounded-full bg-black/20 p-4 text-white"
                        ref={setNodeRef}
                    >
                        <AiOutlineDrag
                            stroke="white"
                            strokeWidth={2}
                            width={50}
                            height={50}
                        />
                    </div>

                )}
            </div>
        );
    };


    return (
        <div
            className={cn(
                `grid grid-cols-5 grid-rows-2 rounded-2xl w-full`,
                /*
                        viewUpload
                          ? 'h-[40vw] xs:h-[42vw] md:h-[305px]'
                          : 'h-[30vw] xs:h-[37vw] md:h-[271px]',
                        */
                isUpload ? "mt-2 gap-0.5" : "gap-3"
            )}
        >
            <Modal
                modalClassName={cn(
                    "flex justify-center w-full items-center relative",
                    isUpload && "h-[90%]"
                )}
                open={open}
                closeModal={closeModal}
                closePanelOnClick
            >
                <ImageModal
                    tweet={isUpload}
                    imageData={selectedImage as ImageData}
                    previewCount={previewCount}
                    selectedIndex={selectedIndex}
                    handleNextIndex={handleNextIndex}
                />
            </Modal>
            <AnimatePresence mode="popLayout">
                <DndContext
                    sensors={!isEventPrevent ? sensors : undefined}
                    collisionDetection={!isEventPrevent ? closestCenter : undefined}
                    onDragEnd={!isEventPrevent ? handleDragEnd : undefined}
                    measuring={!isEventPrevent ? measuringConfig : undefined}
                >
                    <SortableContext items={itemIds} strategy={rectSortingStrategy}>
                        {imagesPreview.map(({ id, src, alt }, index) => (
                            <>
                                <SortableItem id={id}>
                                    <motion.button
                                        type="button"
                                        className={cn(
                                            "accent-tab relative transition-shadow w-full h-full",
                                            isUpload
                                                ? postImageBorderRadius[previewCount][index]
                                                : "rounded-2xl",
                                            {
                                                //'col-span-2 row-span-2': previewCount === 1,
                                                "row-span-2":
                                                    index % 5 === 0 &&
                                                    previewCount > 3 &&
                                                    previewCount < 6,
                                            }
                                        )}
                                        {...variants}
                                        onClick={preventBubbling(handleSelectedImage(index))}
                                        layout={!isUpload ? true : false}
                                        key={id}
                                    >
                                        <NextImage
                                            className={`relative h-full ${previewCount < 4 ? "min-h-[12rem]" : "min-h-[8rem]"
                                                } w-full 
                                cursor-pointer transition hover:brightness-75 hover:duration-200`}
                                            imgClassName={cn(
                                                isUpload
                                                    ? postImageBorderRadius[previewCount][index]
                                                    : "rounded-2xl"
                                            )}
                                            previewCount={previewCount}
                                            layout="fill"
                                            src={src}
                                            alt={alt}
                                            useSkeleton={isUpload}
                                        />
                                        {removeImage && !isEventPrevent && (
                                            <Button
                                                className="group absolute top-1 right-4 translate-x-1 translate-y-1
                           bg-[#00000036] p-1 backdrop-blur-sm 
                           hover:bg-[#01010146] rounded-md "
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage(id);
                                                }}
                                            >
                                                <AiOutlineClose
                                                    className="h-5 w-5 text-white"
                                                    iconName="XMarkIcon"
                                                />
                                                <ToolTip className="translate-y-2" tip="삭제" />
                                            </Button>
                                        )}
                                    </motion.button>
                                </SortableItem>
                            </>
                        ))}
                    </SortableContext>
                </DndContext>
            </AnimatePresence>
        </div>
    );
}