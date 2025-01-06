import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { BiImageAdd } from "react-icons/bi";

const ImageInput = ({
  setFile,
  imgUrlList,
}: {
  setFile: Dispatch<SetStateAction<FileList | null>>;
  imgUrlList: string[];
}) => {
  interface ImageInfo {
    name: string;
    url: string;
  }
  const [imageList, setImageList] = useState<string[]>([]);
  const [images, setImages] = useState<ImageInfo[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleFileSelect(event: any) {
    const files = event.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setImage(files);
      setFile(files);
      if (!/^image\/(jpg|png|jpeg|bmp|tif|heic)$/.test(file.type)) {
        alert(
          "이미지 파일 확장자는 jpg, png, jpeg, bmp, tif, heic만 가능합니다."
        );
        return;
      }

      if (file.size > 32 * 1024 * 1024) {
        alert("이미지 용량은 32MB 이내로 등록 가능합니다.");
        return;
      }
    } else {
      alert("이미지 파일을 선택해주세요.");
    }
    for (let i = 0; i < files.length; i++) {
      if (files[i].type.split("/")[0] !== "image") continue;

      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        if (readerEvent.target) {
          const result = readerEvent.target.result as string; // 타입 단언
          setSelectedFile(result);

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
      };

      reader.readAsDataURL(files[i]);
    }
  }
  
  useEffect(() => {
    setImageList(imgUrlList);
  }, [imgUrlList]);

  const setImage = async (files: FileList) => {
    if (files) {
      if (files.length <= 20) {
        const fileArray = Array.from(files);
        const newImages: string[] = [];

        for (const file of fileArray) {
          const imageUrl = URL.createObjectURL(file);
          newImages.push(imageUrl);
        }

        setImageList(newImages);
      } else {
        alert("최대 20장의 이미지까지만 선택할 수 있습니다.");
      }
    }
  };
  function selectFilesAndHandleUpload() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }
  function deleteImage(index: number) {
    setImages((prevImages) => prevImages.filter((_, i) => i !== index));
  }
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
      if (!images.some((e) => e.name == files[i].name)) {
        setImages((prevIamges) => [
          ...prevIamges,
          {
            name: files[i].name,
            url: URL.createObjectURL(files[i]),
          },
        ]);
      }
    }
  }
  return (
    <div className="card">
      <div
        className="drag-area"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {isDragging ? (
          <span className="select">이곳에 이미지를 놓아주세요.</span>
        ) : (
          <div className="button-container flex flex-col items-center">
            <button
              className="btn-a flex items-center justify-center"
              role="button"
              onClick={selectFilesAndHandleUpload}
            >
              <span className="mr-3 text-lg ">
                <BiImageAdd class="fa fa-plus" />
              </span>
              이미지 추가
            </button>
            <div className="mt-4 text-sm text-zinc-900">
              <p>이미지 추가는 jpg / png / jpeg / bmp / tif / heic</p>
              <p>1장당 32MB 이내, 최대 20장까지</p>
              <p>업로드하실 수 있습니다.</p>
            </div>
          </div>
        )}
        <input
          multiple
          accept=".jpg, .jpeg, .gif, .png"
          name="file"
          type="file"
          className="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
        />
      </div>
      <div className="container">
        {images.map((images, index) => (
          <div className="image" key={index}>
            <span className="delete" onClick={() => deleteImage(index)}>
              &times;
            </span>
            <img src={images.url} alt={images.name} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageInput;
