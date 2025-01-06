"use client";

import useUploadModal from "../hooks/useUploadModal";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import FullModal from "./FullModal";
import Heading from "../Hadings/Heading";

import { useRouter, useSearchParams } from "next/navigation";
import { createAndUpdatePost, getPost } from "@/config/db";
import { v4 as uuid } from "uuid";

import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { doc, documentId, serverTimestamp } from "firebase/firestore";
import authState from "@/zustand/AuthState";
import { Input } from "../inputs/BasicInput";
import Editor from "../Editor/editor";
import { ScrollArea } from "../ui/ScrollArea";
import { isValidObjectID } from "@/utils/utils";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  content: z.string().min(100, {
    message: "Content must be at least 100 characters.",
  }),
  tag: z.string(),
});
interface ParamsProps {
  params: { documentId: string };
}

const Upload: React.FC<ParamsProps> = ({ params: { documentId } }) => {
  const router = useRouter();
  const UploadModal = useUploadModal();
  const [isLoading, setIsLoading] = useState(false);
  const validObjectID = isValidObjectID(documentId);

  const [initialData, setInitialData] = useState("");
  const searchParams = useSearchParams();
  const [postId, setPostId] = useState("");

  const currentUser = authState.getState().user;

  useEffect(() => {
    const id = searchParams.get("postid");
    async function postExists(id: string) {
      const post = await getPost(id);

      if (!post) {
        throw new Error("Post not found");
      }

      form.setValue("title", post.title);
      setInitialData(post.content);
      form.setValue("tag", "#" + post.tag.join("#"));
    }

    if (id) {
      setPostId(id);
      postExists(id);
    } else {
      setPostId(uuid());
    }
  }, []);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      tag: "",
    },
  });

  const {
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
    const post = {
      title: title,
      content: content,
      description: description,
      createdAt: serverTimestamp(),
      tag: tag,
      author: currentUser.uid,
      authorName: currentUser.displayName,
      authorAvatar: currentUser.photoURL,
    };

    createAndUpdatePost(post, postId)
      .then(() => {
        setIsLoading(false);
        router.push(`/post/${postId}`);
      })
      .catch((error) => {});
  }

  const bodyContent = (
    <div className="w-full mt-6">
      <ScrollArea className="h-[calc(100vh_-_48px)]" type="always">
        <main className="flex flex-col h-[inherit]">
          <section className="flex flex-col flex-1 w-full">
            <Editor id={documentId} editorJson={undefined}  />
          </section>
        </main>
      </ScrollArea>
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
