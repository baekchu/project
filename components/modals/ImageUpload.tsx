"use client";

import Uploadlayout from "@/components/ui/upload-layout";
import React, { ChangeEvent, useState, ClipboardEvent, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { LuLoader2 } from "react-icons/lu";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Timestamp,
} from "firebase/firestore";
import {
    Form, FormControl, FormField,
    FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/textarea";
import { FileWithId, FilesWithId, ImagesPreview } from "@/config/types/file";
import { auth } from "@/config/firebase";
import { getImagesData } from "@/utils/validation";
import toast from "react-hot-toast";
import { ImagePreview } from "./image-preview";
import { InputOptions } from "../inputs/input-options";
import { Button } from "../ui/button";
import {
    FImgData, deleteStoredImgs, modificateImgData, uploadArtwork,
    uploadImageFiles
} from "../utility/ImgDataModule";
import useImgUploadState from "@/zustand/ImgUploadState";

const formSchema = z.object({
    images: z.array(z.string()).default([]),
    title: z.string().min(1, { message: "제목을 입력해주세요." }).default(""),
    desc: z.string().min(1, { message: "내용을 입력해주세요." }).default(""),
    category: z.string().min(1, { message: "카테고리를 입력해주세요." }).default(""),

    tags: z.string().min(1, { message: "태그를 입력해주세요." }).default(""),
    isCommentAble: z.boolean().default(true),
});

const ImageUpload = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImages, setSelectedImages] = useState<FilesWithId>([]);
    const [imagesPreview, setImagesPreview] = useState<ImagesPreview>([]);
    const previewCount = imagesPreview.length;
    const isUploadingImages = !!previewCount;

    // 업로드 / 수정 상태를 판별하는 변수
    const { isImgUploadOpen, changingDocData, setIsImgUploadOpen } = useImgUploadState();

    const inputRef = useRef<HTMLTextAreaElement>(null);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
                images: [],
                title: "",
                desc: "",
                category: "",

                tags: "",
                isCommentAble: true,
            },
    });

    useEffect(() => {
        if (changingDocData != null) {
            // 변경할 값이 있을 때 폼의 값에 데이터 추가
            form.setValue("title", changingDocData.title);
            form.setValue("desc", changingDocData.desc);
            form.setValue("category", changingDocData.category);
            form.setValue("tags", "#" + changingDocData.tags.join("#"));
            form.setValue("isCommentAble", changingDocData.isCommentAble);

            const newImagesPreview: ImagesPreview = changingDocData.images.map((imageSrc, index) => ({
                id: `image_${index}`, // 각 이미지에 고유한 id 할당
                src: imageSrc,
                alt: `Image ${index + 1}`,
            }));
            setImagesPreview(newImagesPreview);
        }
    }, [changingDocData]);

    useEffect(()=>{
        // 창 닫을 시 작성 내용 초기화
        if (!isImgUploadOpen) {
            form.reset();
            setSelectedImages([]);
            setImagesPreview([]);
        }
    },[isImgUploadOpen]);

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        const currentUser = auth.currentUser?.uid;
        if (!currentUser) throw new Error("로그인 상태를 다시 확인해주세요!");

        if (changingDocData == null) {  // 업로드 동작
            setIsLoading(true);
            const { title, desc, category, isCommentAble } = values;
            const tags = values.tags
                ? values.tags
                    .split("#")
                    .filter((item) => item !== "")
                    .map((item) => item.replace(/[^\w\sㄱ-힣]/g, ""))
                : "";
    
            const description = desc?.replace(/<[^>]*>/g, "").substring(0, 50);
    
            // 이미지 파일들을 업로드하고 url 배열을 제공받음
            const newImageUrls: string[] | null = await uploadImageFiles(selectedImages, currentUser);
            if (newImageUrls == null) return;
    
            const newArtData: FImgData = {
                type: "default",
                images: newImageUrls,
                time: Timestamp.now(),
                uid: currentUser,
    
                title: title,
                desc: description,
                category: category,
                tags: [...tags],
    
                insp: [],
                views: 0,
                reports: [],
                isCommentAble: isCommentAble,
    
                objectID: "",
            };
    
            const res = await uploadArtwork(newArtData);
            if (res) {
                toast.success("업로드에 성공했습니다.");
                setIsLoading(false);
                setIsImgUploadOpen(false);
            } else {
                // 이미지 정보 업데이트 실패 시 실행할 코드. storage에 업로드되었던 파일들 삭제
                await deleteStoredImgs(newImageUrls);
            }
        } else {    // 수정 동작
            setIsLoading(true);
            const { title, desc, category, isCommentAble } = values;
            const tags = values.tags
                ? values.tags
                    .split("#")
                    .filter((item) => item !== "")
                    .map((item) => item.replace(/[^\w\sㄱ-힣]/g, ""))
                : "";
    
            const description = desc?.replace(/<[^>]*>/g, "").substring(0, 50);

            const newData = {
                title: title,
                desc: description,
                tags: [...tags],
                category: category,
                isCommentAble: isCommentAble,
            };
            const res = await modificateImgData(changingDocData.objectID, newData);
            if (res) {
                toast.success("수정을 완료했습니다.");
                setIsImgUploadOpen(false);
            } else {
                toast.error("수정에 실패했습니다.");
            }
            setIsLoading(false);
        }

        
    }

    const handleImageUpload = (
        e: ChangeEvent<HTMLInputElement> | ClipboardEvent<HTMLTextAreaElement>
    ): void => {
        const isClipboardEvent = "clipboardData" in e;

        if (isClipboardEvent) {
            const isPastingText = e.clipboardData.getData("text");
            if (isPastingText) return;
        }

        const files = isClipboardEvent ? e.clipboardData.files : e.target.files;

        const imagesData = getImagesData(files, previewCount);

        if (!imagesData) {
            toast.error("GIF 또는 사진을 최대 20개까지 선택하세요.");
            return;
        }

        const { imagesPreviewData, selectedImagesData } = imagesData;

        setImagesPreview([...imagesPreview, ...imagesPreviewData]);
        setSelectedImages([...selectedImages, ...selectedImagesData]);

        inputRef.current?.focus();
    };
    const removeImage = async (targetId: string) => {
        const updatedImagesPreview: ImagesPreview = [];
        const updatedSelectedImages: FileWithId[] = [];

        imagesPreview.forEach((image) => {
            if (image.id !== targetId) {
                updatedImagesPreview.push(image);
            }
        });
        selectedImages.forEach((file) => {
            if (file.id !== targetId) {
                updatedSelectedImages.push(file);
            }
        })

        await setImagesPreview(updatedImagesPreview);
        await setSelectedImages(updatedSelectedImages);
    };

    const handleVisualMedia = async (newIds: string[]) => {
        const updatedImagesPreview: ImagesPreview = [];
        const updatedSelectedImges: FileWithId[] = [];

        for (let i = 0; i < newIds.length; i++) {
            const newId = newIds[i];

            const matchingImage = imagesPreview.find((image) => image.id === newId);
            const matchingFile = selectedImages.find((file) => file.id === newId);

            if (matchingImage) {
                updatedImagesPreview.push(matchingImage);
            }
            if (matchingFile) {
                updatedSelectedImges.push(matchingFile);
            }
        }
        await setImagesPreview(updatedImagesPreview);
        await setSelectedImages(updatedSelectedImges);
    };

    return (
        <>
            {isImgUploadOpen && (
                <Uploadlayout type="image">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="flex flex-col items-center justify-center w-[100%]"
                        >
                            <div className="w-full flex justify-center">
                                <h2 className="text-2xl md:text-[32px] font-bold mt-6 md:mt-[28px] mb-8 md:mb-12 text-center">
                                    이미지 업로드
                                </h2>
                            </div>
                            {/** 이미지 폼 */}
                            <div className="w-full grid my-8">
                                <InputOptions
                                    handleImageUpload={handleImageUpload}
                                    isUploadingImages={isUploadingImages}
                                    loading={isLoading}
                                    isEventPrevent={changingDocData!=null}
                                >
                                    {isUploadingImages && (
                                        <ImagePreview
                                            imagesPreview={imagesPreview}
                                            previewCount={previewCount}
                                            removeImage={!isLoading ? removeImage : undefined}
                                            setVisualMedia={handleVisualMedia}
                                            isEventPrevent={changingDocData!=null}
                                        />
                                    )}
                                </InputOptions>
                            </div>

                            {/** 텍스트 폼 */}
                            <div className="w-[90%] max-w-[70rem] grid my-8">
                                <div className="flex flex-col space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>제목</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="제목을 입력해주세요." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="desc"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>내용</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        rows={4}
                                                        placeholder="내용을 입력해주세요."
                                                        className="resize-none"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="tags"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>태그</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="#태그를 입력해주세요." {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>카테고리</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    name={field.name}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="카테고리를 선택해주세요." />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="일러스트">일러스트</SelectItem>
                                                        <SelectItem value="애니메이션">애니메이션</SelectItem>
                                                        <SelectItem value="캐릭터">캐릭터</SelectItem>
                                                        <SelectItem value="웹툰">웹툰</SelectItem>
                                                        <SelectItem value="제품 디자인">제품 디자인</SelectItem>
                                                        <SelectItem value="타이포그래피">타이포그래피</SelectItem>
                                                        <SelectItem value="웹 디자인">웹 디자인</SelectItem>
                                                        <SelectItem value="모바일 디자인">모바일 디자인</SelectItem>
                                                        <SelectItem value="브랜딩·로고">브랜딩·로고</SelectItem>
                                                        <SelectItem value="마케팅 디자인">마케팅 디자인</SelectItem>
                                                        <SelectItem value="기타">기타</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="isCommentAble"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center gap-4">
                                                <FormLabel>댓글 허용</FormLabel>
                                                <FormControl>
                                                    <Input type="checkbox" className="w-fit" style={{ "margin": 0 }}
                                                        {...field} value={field.value ? "true" : "false"} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>
                            <div className="w-[90%] justify-end flex max-w-[70rem] mb-5">
                                <Button
                                    disabled={isLoading}
                                    type="submit"
                                    className={`rounded-lg px-6 py-3 shadow-md text-[13px] font-semibold bg-PrimaryClor text-white hover:bg-primary/90
                                flex flex-row justift-center gap-1 ${isLoading ? "brightness-75" : "hover:brightness-90"}`}
                                >
                                    {isLoading && (
                                        <>
                                            <p>저장 중</p>
                                            <LuLoader2 className="animate-spin mr-2" size={18} />
                                        </>
                                    )}
                                    {!isLoading && <p>
                                        {changingDocData ? "수정" : "업로드"}
                                    </p>}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </Uploadlayout>
            )}
        </>
    );
};

export default ImageUpload;