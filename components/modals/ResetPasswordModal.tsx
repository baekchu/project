"use client"

import useResetPasswordModal from "../hooks/useResetPasswordModal";
import React, { useState } from "react";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Modal from "./Modal";
import Input from "../inputs/Input";
import Heading from "../Hadings/Heading";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

const ResetPassword = () => {
  const ResetPasswordModal = useResetPasswordModal();
  const [isLoading, setIsLoading] = useState(false);

  const auth = getAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      // 비밀번호 재설정 이메일을 성공적으로 보냈습니다.
      toast.success("비밀번호 재설정 이메일을 성공적으로 보냈습니다.");
      // 여기에서 성공 메시지를 처리하거나 리디렉션을 수행할 수 있습니다.
      ResetPasswordModal.onClose();
    } catch (error) {
      // 에러 메시지를 처리하거나 사용자에게 오류를 표시할 수 있습니다.
      toast.error("비밀번호 재설정 이메일을 보내는 데 실패했습니다.");
    }
    setIsLoading(false);
  };

  const bodyContent = (
    <div className="flex flex-col gap-4 text-[#B25FF3]">
      <Heading
        center
        title="비밀번호 찾기"
        subtitle="당신의 아이디어가 혁신을 일으킵니다."
      />
      <Input
        id="email"
        label="이메일"
        disabled={isLoading}
        register={register}
        errors={errors}
        required
      />
    </div>
  );

  return (
    <Modal
      disabled={isLoading}
      isOpen={ResetPasswordModal.isOpen}
      actionLabel="보내기"
      onClose={()=>{
        reset();
        ResetPasswordModal.onClose();
        }}
      onSubmit={handleSubmit(onSubmit)}
      body={bodyContent}
    />
  );
};

export default ResetPassword;