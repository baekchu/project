import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { RegisterFormFields } from "../types/register";
import { FileWithId, FilesWithId, ImagesPreview } from "@/config/types/file";
import { getRandomId } from "./random";

export const registerValidation = () =>
  yupResolver(
    yup.object().shape<Partial<Record<keyof RegisterFormFields, any>>>({
      email: yup
        .string()
        .required("이메일은 필수 입력 사항입니다.")
        .email("유효한 이메일 형식이어야 합니다."),
      password: yup
        .string()
        .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
        .matches(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
          "비밀번호는 특수문자, 숫자, 대소문자를 모두 포함해야 합니다."
        )
        .notRequired(),
      confirmpassword: yup
        .string()
        .oneOf([yup.ref("password")], "비밀번호가 일치하지 않습니다.")
        .notRequired(),
    })
  );
const IMAGE_EXTENSIONS = [
  "apng",
  "avif",
  "gif",
  "jpg",
  "jpeg",
  "jfif",
  "pjpeg",
  "pjp",
  "png",
  "svg",
  "webp",
] as const;

type ImageExtensions = (typeof IMAGE_EXTENSIONS)[number];
function isValidImageExtension(
  extension: string
): extension is ImageExtensions {
  return IMAGE_EXTENSIONS.includes(
    extension.split(".").pop()?.toLowerCase() as ImageExtensions
  );
}

export function isValidImage(name: string, bytes: number): boolean {
  return isValidImageExtension(name) && bytes < 20 * Math.pow(1024, 2);
}

type ImagesData = {
  imagesPreviewData: ImagesPreview;
  selectedImagesData: FilesWithId;
};

export function getImagesData(
  files: FileList | null,
  currentFiles?: number
): ImagesData | null {
  if (!files || !files.length) return null;

  const singleEditingMode = currentFiles === undefined;

  const rawImages =
    singleEditingMode ||
      !(currentFiles === 20 || files.length > 20 - currentFiles)
      ? Array.from(files).filter(({ name, size }) => isValidImage(name, size))
      : null;

  if (!rawImages || !rawImages.length) return null;

  const imagesId = rawImages.map(({ name }) => {
    const randomId = getRandomId();
    return {
      id: randomId,
      name: name === "image.png" ? `${randomId}.png` : null,
    };
  });

  const imagesPreviewData = rawImages.map((image, index) => ({
    id: imagesId[index].id,
    src: URL.createObjectURL(image),
    alt: imagesId[index].name ?? image.name,
  }));

  const selectedImagesData = rawImages.map((image, index) =>
    renameFile(image, imagesId[index].id, imagesId[index].name)
  );

  return { imagesPreviewData, selectedImagesData };
}

function renameFile(
  file: File,
  newId: string,
  newName: string | null
): FileWithId {
  return Object.assign(
    newName
      ? new File([file], newName, {
        type: file.type,
        lastModified: file.lastModified
      })
      : file,
    { id: newId }
  );
}
