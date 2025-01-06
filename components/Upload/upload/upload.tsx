import { SyntheticEvent, useState, useEffect } from "react";
import * as z from "zod";
import { v4 as uuidv4 } from "uuid";

import { db } from "@/config/firebase";
import { Timestamp, doc, setDoc } from "firebase/firestore";
import { zodResolver } from "@hookform/resolvers/zod";
import authState from "@/zustand/AuthState";
import useUploadModal from "@/components/hooks/useUploadModal";
import uploadImageToStorage from "../UploadImageToStorage";

import { useRouter } from "next/navigation";
import Preview from "../FileUpload/Preview";
import FullModal from "@/components/modals/FullModal";
import { useForm } from "react-hook-form";
import Input from "@/components/inputs/Input";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().min(100, {
    message: "Content must be at least 100 characters.",
  }),
  tag: z.string(),
});



const Upload = () => {
  const currentUser = authState.getState().user;
  const UploadModal = useUploadModal();
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");

  const [file, setFile] = useState<FileList | null>(null);
  const [clientWitch, setClientWitch] = useState(
    document.documentElement.clientWidth
  );
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      tag: "",
    },
  });
  useEffect(() => {
    window.addEventListener("resize", () => {
      setClientWitch(document.documentElement.clientWidth);
    });
  }, []);

  const router = useRouter();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    if (!currentUser) {
      throw new Error("You must be logged in to create a post.");
    }
    const { title, content } = values;

    const tag = values.tag
      ? values.tag
          .split("#")
          .filter((item) => item !== "")
          .map((item) => item.replace(/[^\w\sㄱ-힣]/g, ""))
      : "";

    const description = content.replace(/<[^>]*>/g, "").substring(0, 50);
    //post 부분은 데이터 구조를 손을 봐야합니다.
    if (title.trim() === "") {
      alert("제목을 입력해 주세요");
      return;
    }

    try {
      if (currentUser) {
        const id = uuidv4();
        const userDocRef = doc(
          db,
          currentUser.uid,
          currentUser.uid,
          "feed",
          id
        );

        if (file === null) {
          alert("사진을 선택해주세요");
          return;
        }

        const downloadURLs = await uploadImageToStorage(
          file,
          `feed/${currentUser.uid}`,
          id
        );

        const uploadData = {
          title: title,
          text: text,
          timestamp: Timestamp.now(),
          imageUrl: downloadURLs,
          id: id,
        };

        await setDoc(userDocRef, uploadData);

      } else {
        console.error("사용자가 로그인되지 않았습니다.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const bodyContent = (
    <div className="fle w-full mt-6">
      <Preview setFile={setFile} />
      <Input
        id="title"
        label="작품 제목"
        type="text"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
      <hr className="flex-grow border-b-[1px] border-[#e8dbf2]" />
      <Textarea
        id="description"
        label="작품 내용"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
    </div>
  );

  return (
    <FullModal
      disabled={isLoading}
      isOpen={UploadModal.isOpen}
      actionLabel="업로드"
      onClose={() => {
        reset();
        UploadModal.onClose();
      }}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
    />
  );
};

export default Upload;
