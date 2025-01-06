"use client";

import React, { useEffect, useState } from "react";
import Uploadlayout from "@/components/ui/upload-layout";
import { Input } from "../ui/Input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuid } from "uuid";
import { ScrollArea } from "../ui/ScrollArea";
import { Button } from "../ui/button";
import { LuLoader2 } from "react-icons/lu";
import { Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import Editor from "../Editor/editor";
import { auth } from "@/config/firebase";
import { FPost, getPostData, uploadBulletin } from "../utility/BulletinModule";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import usePortfolioUploadState from "@/zustand/PortfolioUploadState";

const formSchema = z.object({
  title: z.string().min(2, {
    message: "제목은 2자 이상이어야 합니다.",
  }),
  content: z.string().min(10, {
    message: "내용은 10자 이상이어야 합니다.",
  }),
  category: z
    .string()
    .min(1, { message: "카테고리를 입력해주세요." })
    .default(""),

  tags: z.string().min(1, { message: "태그를 입력해주세요." }).default(""),
});

export default function WriteUpload() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const [postId, setPostId] = useState("");
  const [initialData, setInitialData] = useState("");
  const {isPostUploadOpen} = usePortfolioUploadState();

  useEffect(() => {
    const id = searchParams.get("docid");
    const postExists = async (id: string) => {
      const newPostData = await getPostData(id);

      if (!newPostData) {
        throw new Error("Post not found");
      }

      form.setValue("title", newPostData.title);
      console.log(newPostData);
      setInitialData(newPostData.desc);
    };

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
      category: "",
      tags: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const currentUser = auth.currentUser?.uid;
    if (!currentUser)
      throw new Error("You must be logged in to create a post.");

    const { title, content, category } = values;
    const tags = values.tags
      ? values.tags
        .split("#")
        .filter((item) => item !== "")
        .map((item) => item.replace(/[^\w\sㄱ-힣]/g, ""))
      : "";
    const description = content;

    const newPostData: FPost = {
      title: title,

      desc: description,
      category: category,
      tags: [...tags],

      time: Timestamp.now(),
      uid: currentUser,
      views: 0,
      reports: [],

      inspirations: [],
      inspNum: 0,
      objectID: ""
    };

    const res = await uploadBulletin(newPostData);
    if (res) {
      toast.success("업로드에 성공했습니다.");
      setIsLoading(false);
    }
  };
  return (
    <>
      {isPostUploadOpen && (
        <Uploadlayout type="post">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col items-center justify-center w-[100%]"
            >
              <div className="w-full flex justify-center">
                <h2 className="text-2xl md:text-[32px] font-[900]  mt-6 md:mt-[28px] mb-8 md:mb-12 text-center">
                  게시글 업로드
                </h2>
              </div>
              <div className="w-[90%] max-w-[70rem] grid my-8 min-h-fit">
                <div className="flex flex-col h-full space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormControl>
                          <Input
                            placeholder="제목 없음"
                            {...field}
                            className="text-4xl font-bold relative h-20 flex flex-col justify-center w-full outline-none py-5 border-0"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <ScrollArea
                    className="h-[calc(65vh_-_48px)] rounded shadow-sm"
                    type="always"
                  >
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field: { onChange } }) => (
                        <FormItem className="h-full">
                          <FormControl className="h-full">
                            <Editor data={initialData} onChange={onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </ScrollArea>
                </div>
              </div>
              <div className="w-[100%] justify-end flex max-w-[70rem] mb-5">
                <Dialog>
                  <DialogTrigger>
                    <div className="rounded-lg px-6 py-3 shadow-md text-[13px] font-semibold bg-PrimaryClor text-white hover:bg-primary/90">
                      계속
                    </div>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        게시글에 맞는 태그와 카테고리를 설정하세요.
                      </DialogTitle>
                      <DialogDescription>
                        <div className="mt-5">
                          <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>태그</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="#태그를 입력해주세요."
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="mt-3 mb-3">
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
                                    <SelectItem value="docID">잡담</SelectItem>
                                    <SelectItem value="질문 및 토론">
                                      질문 및 토론
                                    </SelectItem>
                                    <SelectItem value="창작">창작</SelectItem>
                                    <SelectItem value="건의">건의</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className=" justify-end flex mt-5">
                          <Button
                            disabled={isLoading}
                            type="submit"
                            className={`rounded-lg px-6 py-3 shadow-md text-[13px] font-semibold bg-PrimaryClor text-white hover:bg-primary/90
                            flex flex-row justift-center gap-1 ${isLoading
                                ? "brightness-75"
                                : "hover:brightness-90"
                              }`}
                            onClick={form.handleSubmit(onSubmit)}
                          >
                            {isLoading && (
                              <>
                                <LuLoader2 className="animate-spin" size={18} />
                              </>
                            )}
                            {!isLoading && <p>업로드</p>}
                          </Button>
                        </div>
                      </DialogDescription>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </Form>
        </Uploadlayout>
      )}
    </>

  );
}