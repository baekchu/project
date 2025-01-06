import { useRef, useState } from "react";
import type { ChangeEvent, ClipboardEvent, ReactNode } from "react";
import { Button } from "../ui/button";
import { BiImageAdd } from "react-icons/bi";

type Options = {
    name: string;
    icon: JSX.Element;
    disabled: boolean;
    onClick?: () => void;
}[];

const options: Readonly<Options> = [
    {
        name: "Media",
        icon: <BiImageAdd />,
        disabled: false,
    },
];

type InputOptionsProps = {
    modal?: boolean;
    loading: boolean;
    children: ReactNode;
    isEventPrevent: boolean;
    handleImageUpload: (
        e: ChangeEvent<HTMLInputElement> | ClipboardEvent<HTMLTextAreaElement>
    ) => void;
    isUploadingImages: boolean;
};

export function InputOptions({
    modal,
    isUploadingImages,
    loading,
    children,
    isEventPrevent,
    handleImageUpload,
}: InputOptionsProps): JSX.Element {
    interface ImageInfo {
        name: string;
        url: string;
    }

    const inputFileRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [images, setImages] = useState<ImageInfo[]>([]);
    const onClick = (): void => {
        inputFileRef.current?.click();
    };
    function onDragOver(event: any) {
        event.preventDefault();
        setIsDragging(true);
        event.dataTransfer.dropEffect = "copy";
    }

    function onDragLeave(event: any) {
        event.preventDefault();
        setIsDragging(false);
    }

    function onDrop(event: any) {
        event.preventDefault();
        setIsDragging(false);
        const files = event.dataTransfer.files;
        if (!files || files.length === 0) return; // 파일이 없거나 파일의 길이가 0인 경우 처리하지 않습니다.
        for (let i = 0; i < files.length; i++) {
            if (files[i].type.split("/")[0] !== "image") continue;
            if (!images.some((e) => e.name === files[i].name)) {
                setImages((prevImages) => [
                    ...prevImages,
                    {
                        name: files[i].name,
                        url: URL.createObjectURL(files[i]),
                    },
                ]);
            }
        }
    }

    return (

        <div
            // className="card"
            className="w-full min-h-[16rem] border-y-2 border-[#B25FF3] overflow-hidden text-center py-4 bg-[#f7efff]">
            <div
                className="drag-area w-full h-full flex items-center justify-center"
                onDragOver={loading ? undefined : onDragOver}
                onDragLeave={loading ? undefined : onDragLeave}
                onDrop={loading ? undefined : onDrop}
            >
                {isEventPrevent ? (
                    <div className="w-[90%] max-w-[70rem] h-fit">
                        {children}
                        <button className={`w-full h-14 mt-2 rounded text-sm font-bold text-red-600
                        flex items-center justify-center bg-neutral-200 shadow`}
                            disabled={true}>
                            업로드한 이미지는 수정할 수 없습니다.
                        </button>
                    </div>
                ) : (<>
                    {isUploadingImages ? (
                        // 이미지가 업로드 중인 경우
                        <div className="w-[90%] max-w-[70rem] h-fit">
                            {children}
                            <button className={`w-full h-14 mt-2 rounded bg-white text-sm font-bold text-[#B25FF3] 
                        flex items-center justify-center ${!loading && "hover:bg-neutral-300"} transition-colors shadow`}
                                onClick={() => {
                                    inputFileRef.current?.click();
                                }}
                                disabled={loading}>
                                이미지 추가하기
                            </button>
                        </div>
                    ) : (
                        // 이미지가 업로드 중이 아닌 경우
                        <>
                            {options.map(({ name, disabled }, index) => (
                                <div className="button-container flex flex-col items-center h-full">
                                    <Button
                                        className="btn-a flex items-center justify-center"
                                        onClick={index === 0 ? onClick : undefined}
                                        disabled={disabled}
                                        key={name}
                                    >
                                        {" "}
                                        <span className="mr-3 text-lg ">
                                            <BiImageAdd class="fa fa-plus" />
                                        </span>
                                        이미지 추가
                                    </Button>
                                    <div className="mt-4 text-sm text-zinc-900">
                                        <p>이미지 추가는 jpg / png / jpeg / bmp / tif / heic</p>
                                        <p>1장당 32MB 이내, 최대 20장까지</p>
                                        <p>업로드하실 수 있습니다.</p>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </>)}

                <input
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    ref={inputFileRef}
                    multiple
                    min={loading ? 1 : modal && !isUploadingImages ? 3 : 1}
                    max={isUploadingImages ? 5 : 15}
                />
            </div>
        </div>
    );
}
