"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useUploadModal from "../hooks/useUploadModal";
import FullModal from "./FullModal";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import Input from "../inputs/Input";
import Textarea from "../inputs/Textarea";
import BasicHeading from "../Hadings/BasicHeading";
import Tag from "../inputs/Tag";
import ImageUpload from "../inputs/Imageupload";
import Calendar from "../inputs/Calendar";
import { Range } from "react-date-range";
import BasicInput from "../inputs/BasicInput";
import Stepper from "@mui/material/Stepper";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import {
  StepConnector,
  StepIconProps,
  StepLabel,
  stepConnectorClasses,
  styled,
} from "@mui/material";
import Check from "@mui/icons-material/Check";
import CategorySelect from "../inputs/CategorySelect";
import authState from "@/zustand/AuthState";
import toast from "react-hot-toast";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, storage } from "@/config/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

enum STEPS {
  INFO = 0,
  IMAGES = 1,
  DATE = 2,
}

const UploadModal = () => {
  const UploadModl = useUploadModal();
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.INFO);
  const [selectedRange, setSelectedRange] = useState<number>(1);
  const [selectedComment, setSelectedComment] = useState<boolean>(true);
  const [file, setFile] = useState<FileList | null>(null);
  const [selectedFile, setSelectedFile] = useState<string>("");

  /*stepper에 관련된 것*/
  const QontoConnector = styled(StepConnector)(() => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 10,
      left: "calc(-50% + 16px)",
      right: "calc(50% + 16px)",
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: "#B15FF2",
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: "#B15FF2",
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#eaeaf0",
      borderTopWidth: 4,
      borderRadius: 3,
    },
  }));

  const QontoStepIconRoot = styled("div")<{ ownerState: { active?: boolean } }>(
    ({ ownerState }) => ({
      color: "#eaeaf0",
      display: "flex",
      height: 22,
      alignItems: "center",
      ...(ownerState.active && {
        color: "#B15FF2",
      }),
      "& .QontoStepIcon-completedIcon": {
        color: "#B15FF2",
        zIndex: 1,
        fontSize: 18,
      },
      "& .QontoStepIcon-circle": {
        width: 8,
        height: 8,
        borderRadius: "50%",
        backgroundColor: "currentColor",
      },
    })
  );

  function QontoStepIcon(props: StepIconProps) {
    const { active, completed, className } = props;

    return (
      <QontoStepIconRoot ownerState={{ active }} className={className}>
        {completed ? (
          <Check className="QontoStepIcon-completedIcon" />
        ) : (
          <div className="QontoStepIcon-circle" />
        )}
      </QontoStepIconRoot>
    );
  }

  const steps = ["INFO", "IMAGES", "DATE"];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      images: "",
      tag: "",
      category: null,
      selectedRange: "",
      selectedComment: "",
    },
  });
  // 입력 값들을 감시하는 변수들
  const category = watch("category");
  const images = watch("images");

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  //다음으로 넘어가기
  const onNext = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((value) => value + 1);
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.DATE) {
      return "업로드";
    }

    return "다음";
  }, [step]);

  //이전으로 가기

  const onBack = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setStep((value) => value - 1);
  };
  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.INFO) {
      return undefined;
    }

    return "이전";
  }, [step]);

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    if (step !== STEPS.DATE) {
      return onNext();
    }

    if (isLoading) return;
    setIsLoading(true);

    const currentUser = authState.getState().user;
    if (currentUser) {
      try {
        // currentUser.uid, currentUser.userImg 등의 사용자 속성에 접근할 수 있습니다.
        const docRef = await addDoc(collection(db, "Auction"), {
          id: currentUser.uid,
          userImg: currentUser.profImg,
          timestamp: serverTimestamp(),
          name: currentUser.nickname,
          title: data.title,
          description: data.description,
          username: currentUser.email,
          tags: data.tags,
          category: data.category,
          price: data.price,
        });
        const imageRefs = [];
        const downloadURLs = [];

        for (let i = 0; i < images.length; i++) {
          const image = images[i];
          const blob = await fetch(image.url).then((response) =>
            response.blob()
          ); // 이미지 URL을 Blob으로 변환

          const imageRef = ref(storage, `Auction/${docRef.id}/image_${i}`);

          await uploadBytes(imageRef, blob); // Blob 데이터를 업로드

          const downloadURL = await getDownloadURL(imageRef);

          imageRefs.push(imageRef);
          downloadURLs.push(downloadURL);
        }

        await updateDoc(doc(db, "Auction", docRef.id), {
          images: downloadURLs, // 이미지 URL 배열을 업로드합니다.
        });
        reset();
        setSelectedFile("");
        UploadModl.onClose();
        toast.success("업로드가 성공적으로 완료되었습니다.");
      } catch (error) {
        console.error("작품 등록 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  let bodyContent = (
    <div className="flex flex-col gap-[3rem] mt-7">
      <BasicHeading title="업로드" subtitle="당신의 작품을 게시하세요." />

      <div className="flex flex-col md:flex-row md:items-start gap-[2.5rem]">
        <div className="md:w-1/2">
          <ImageUpload setFile={setFile} imgUrlList={[]} />
        </div>
        <div className="md:w-1/2 gap-3">
          <BasicInput
            id="title"
            type="text"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            placeholder={"제목을 입력하세요."}
          />
          <hr className="flex-grow border-b-[1px] border-[#e8dbf2]" />
          <Textarea
            id="description"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            placeholder={"내용을 입력하세요."}
          />
          <CategorySelect
            value={category}
            onChange={(value) => setCustomValue("category", value)}
          />
        </div>
      </div>
    </div>
  );

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-[2.5rem] mt-7">
        <BasicHeading title="2단계" subtitle="카테고리, 태그를 입력하세요." />

        <Tag
          id="tag"
          label="관심 태그"
          placeholder="제목을 입력하세요."
          disabled={isLoading}
          register={register}
          errors={errors}
        />
      </div>
    );
  }
  if (step === STEPS.DATE) {
    bodyContent = (
      <div className="flex flex-col gap-[2.5rem] mt-7">
        <BasicHeading title="마지막" subtitle="선택 사항을 체크하세요." />
        <div className="flex items-center w-full">
          <div
            className="md:text-lg
            xs:text-base
            text-sm
            font-medium 
            w-1/5
            pl-2
            pr-2
            text-center "
          >
            공개 범위<span className="text-rose-500 text-xs absolute">*</span>
          </div>
          <div className="flex flex-row gap-4 ">
            <button
              value={1}
              className={
                selectedRange === 1
                  ? "selectComponent selected"
                  : "selectComponent"
              }
              onClick={() => setSelectedRange(1)}
            >
              전체 공개
            </button>
            <button
              value={2}
              className={
                selectedRange === 2
                  ? "selectComponent selected"
                  : "selectComponent"
              }
              onClick={() => setSelectedRange(2)}
            >
              구독자 전용
            </button>
            <button
              value={2}
              className={
                selectedRange === 3
                  ? "selectComponent selected"
                  : "selectComponent"
              }
              onClick={() => setSelectedRange(3)}
            >
              비공개
            </button>
          </div>
        </div>
        <div className="flex items-center w-full">
          <div
            className="md:text-lg
            xs:text-base
            text-sm
            font-medium 
            w-1/5
            pl-2
            pr-2
            text-center "
          >
            작품 댓글<span className="text-rose-500 text-xs absolute">*</span>
          </div>
          <div className="flex flex-row gap-4 ">
            <button
              value={1}
              className={
                selectedComment === true
                  ? "selectComponent selected"
                  : "selectComponent"
              }
              onClick={() => setSelectedComment(true)}
            >
              예
            </button>
            <button
              value={2}
              className={
                selectedComment === false
                  ? "selectComponent selected"
                  : "selectComponent"
              }
              onClick={() => setSelectedComment(false)}
            >
              아니오
            </button>
          </div>
        </div>
        <div className="p-4 mx-auto w-85">
          <b>
            아래에 해당하는 작품의 투고를 금지하고 있습니다.투고를 진행하기 전에
            확인해 주세요.
          </b>
          <ul>
            <li>
              타인이 제작한 작품, 시판되고 있는 상품의 이미지, 제3자가 권리를
              소유한 이미지, 게임이나 영상 작품의 캡처, 스크린샷 이미지가
              포함되는 작품.
            </li>
            <li>
              위와 같은 이미지를 유용하여, 처음부터 모든 것을 본인이 직접 그리지
              않은 작품.
            </li>
            <li>작품 이외의 피사체를 찍은 사진 이미지.</li>
          </ul>
          이용약관에 위반하는 작품의 투고 유저는 투고 작품 공개 정지, 계정
          정지의 대상이 됩니다.
          <div className="alert">
            작품 등록 시 귀사의{" "}
            <a href="http://localhost:3000/" target="_blank">
              이용 약관
            </a>
            에 동의한 것으로 간주합니다. 타인의 저작권을 침해하는 행위 시 법적
            제재가 가해질 수 있으며, 해당 작품은 삭제될 수 있습니다.
          </div>
        </div>
      </div>
    );
  }

  return (
    <FullModal
      isOpen={UploadModl.isOpen}
      actionLabel={actionLabel}
      title="의뢰 업로드"
      onClose={() => {
        reset();
        UploadModl.onClose();
      }}
      onSubmit={handleSubmit(onSubmit)}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.INFO ? undefined : onBack}
      body={
        <>
          <Stack sx={{ width: "100%" }} spacing={4}>
            <Stepper
              alternativeLabel
              activeStep={step}
              connector={<QontoConnector />}
            >
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel StepIconComponent={QontoStepIcon} />
                </Step>
              ))}
            </Stepper>
          </Stack>
          {bodyContent}
        </>
      }
    />
  );
};

export default UploadModal;
