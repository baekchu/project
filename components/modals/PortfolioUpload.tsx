'use client'

import Uploadlayout from "@/components/ui/upload-layout";
import React, { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "../ui/ScrollArea";
import { Button } from "../ui/button";
import { LuLoader2 } from "react-icons/lu";
import { Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";
import Editor from "../Editor/editor";
import { auth } from "@/config/firebase";
import { FPortfoilo, uploadPortfoilo, modificatePortfoiloData} from "../utility/PortfoiloModule";
import usePortfolioUploadState from "@/zustand/PortfolioUploadState";


const formSchema = z.object({
  desc: z.string().min(10, {
    message: "내용은 10자 이상이어야 합니다.",
  }),
});

export default function WriteUpload() {
  const [isLoading, setIsLoading] = useState(false);
  const [initialData, setInitialData] = useState("");
  const { isPortfolioUploadOpen, changingDocData, setIsPortfolioUploadOpen } =
    usePortfolioUploadState();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      desc: "",
    },
  });

  useEffect(() => {
    // 수정 모드일 때만 initialData 설정
    if (changingDocData != null) {
      form.setValue("desc", changingDocData.desc);
    } else {
      // 수정 모드가 아니라면 초기 데이터를 빈 문자열로 설정
      form.setValue("desc", "");
    }
  }, [changingDocData]);

  useEffect(() => {
    // 창 닫을 시 작성 내용 초기화
    if (!isPortfolioUploadOpen) {
      form.reset();
    }
  }, [isPortfolioUploadOpen]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const currentUser = auth.currentUser?.uid;
    if (!currentUser) throw new Error("로그인 상태를 다시 확인해주세요!");

    if (changingDocData == null) {
      // 업로드 동작
      setIsLoading(true);
      const { desc } = values;
      const description = desc;

      const newPortfolioData: FPortfoilo = {
        desc: description,
        time: Timestamp.now(),
        uid: currentUser,
        views: 0,
        inspirations: [],
        inspNum: 0,
        objectID: "",
      };

      const res = await uploadPortfoilo(newPortfolioData);
      if (res) {
        toast.success("업로드에 성공했습니다.");
        setIsLoading(false);
        setIsPortfolioUploadOpen(false);
      } else {
        toast.error("업로드에 실패했습니다.");
      }
    } else {
      // 수정 동작
      setIsLoading(true);
      const { desc } = values;
      const description = desc;

      const newData = {
        desc: description,
        time: Timestamp.now(),
      };

      const res = await modificatePortfoiloData(
        changingDocData.objectID,
        newData
      );
      if (res) {
        toast.success("수정을 완료했습니다.");
        setIsPortfolioUploadOpen(false);
      } else {
        toast.error("수정에 실패했습니다.");
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      {isPortfolioUploadOpen && (
        <Uploadlayout type="portfolio">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex flex-col items-center justify-center w-[100%]"
            >
              <div className="w-full flex justify-center">
                <h2 className="text-2xl md:text-[32px] font-[900]  mt-6 md:mt-[28px] mb-8 md:mb-12 text-center">
                  포토폴리오 작성
                </h2>
              </div>
              <div className="w-[90%] max-w-[70rem] grid my-8 min-h-fit">
                <div className="flex flex-col h-full space-y-4">
                  <ScrollArea
                    className="h-[calc(65vh_-_48px)] rounded-0 shadow-sm"
                    type="always"
                  >
                    <FormField
                      control={form.control}
                      name="desc"
                      render={({ field: { onChange } }) => (
                        <FormItem className="h-full">
                          <FormControl className="h-full">
                            <Editor data={changingDocData?.desc ?? initialData} onChange={onChange} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </ScrollArea>
                </div>
              </div>
              <div className="w-[90%] justify-end flex max-w-[70rem] mb-5">
                <Button
                  disabled={isLoading}
                  type="submit"
                  className={`rounded-lg px-6 py-3 shadow-md text-[13px] font-semibold bg-PrimaryClor text-white hover:bg-primary/90
                                flex flex-row justift-center gap-1 ${
                                  isLoading
                                    ? "brightness-75"
                                    : "hover:brightness-90"
                                }`}
                >
                  {isLoading && (
                    <>
                      <LuLoader2 className="animate-spin" size={18} />
                    </>
                  )}
                  {!isLoading && <p>{changingDocData ? "수정" : "저장"}</p>}
                </Button>
              </div>
            </form>
          </Form>
        </Uploadlayout>
      )}
    </>
  );
}