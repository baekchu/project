import { createElement } from "react";
import { Editor, Range } from "@tiptap/core";
import { MediaOptions } from './../resizableMedia/resizableMedia';

interface Command {
  editor: Editor;
  range: Range;
}

function createElementNextImage(image: string, alt: string, sizes: number) {
  return createElement(
    // @ts-expect-error
    require.resolve("next/image").default,
    {
      src: `/images/commands/${image}`,
      alt,
      className: `w-[${sizes}px] h-[${sizes}px]`,
      width: sizes,
      height: sizes,
    },
    null
  );
}

export const slashNodes = [
  {
    title: "텍스트",
    description: "일반 텍스트로 입력을 시작하세요.",
    icon: createElementNextImage("text.png", "text", 46),
    tooltipSrc: "/images/commands/tooltip-text.png",
    command: ({ editor, range }: Command) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
  },

  {
    title: "제목 1",
    description: "큰 섹션 제목",
    tooltipSrc: "/images/commands/tooltip-header.png",
    icon: createElementNextImage("header.png", "header", 46),
    command: ({ editor, range }: Command) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
  },
  {
    title: "제목 2",
    description: "중간 섹션 제목",
    tooltipSrc: "/images/commands/tooltip-subheader.png",
    icon: createElementNextImage("subheader.png", "subheader", 46),
    command: ({ editor, range }: Command) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
  },
  {
    title: "제목 3",
    description: "작은 섹션 제목",
    tooltipSrc: "/images/commands/tooltip-subsubheader.png",
    icon: createElementNextImage("subsubheader.png", "subsubheader", 46),
    command: ({ editor, range }: Command) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
  },
  {
    title: "이미지 파일",
    description: "내 컴퓨터에서 이미지 파일을 선택해 업로드합니다.",
    tooltipSrc: "/images/commands/tooltip-image.png",
    icon: createElementNextImage("image.png", "subsubheader", 46),
    command: ({ editor, range }: Command) => {
      // 파일 선택 창을 띄우고 선택한 이미지 파일의 URL을 가져옵니다.
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.click();

      input.addEventListener("change", async () => {
        if (input.files && input.files.length > 0) {
          const file = input.files[0];
          const reader = new FileReader();

          reader.onload = () => {
            const imageUrl = reader.result as string;

            if (imageUrl) {
              editor
                .chain()
                .focus()
                .deleteRange(range)
                .setImage({ src: imageUrl })
                .run();
            }
          };

          reader.readAsDataURL(file);
        }
      });
    },
  },
  {
    title: "이미지 주소",
    description: "이미지 주소를 입력해 이미지를 삽입합니다.",
    tooltipSrc: "/images/commands/tooltip-image.png",
    icon: createElementNextImage("image.png", "subsubheader", 46),
    command: ({ editor, range }: Command) => {
      const imageUrl = window.prompt("삽입합 이미지의 경로를 입력하세요");
      editor.chain().focus().deleteRange(range).setMedia
      if (imageUrl) {
        editor
          .chain()
          .focus()
          .setImage({ src: imageUrl })
          .run();
      }
    },
  },
  {
    title: "할 일 목록",
    description: "할 일 목록으로 작업을 하세요.",
    tooltipSrc: "/images/commands/tooltip-to-do.png",
    icon: createElementNextImage("to-do.png", "to-do list", 46),
    command: ({ editor, range }: Command) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "글머리 기호 목록",
    description: "간단한 글머리 기호 목록을 만듭니다.",
    tooltipSrc: "/images/commands/tooltip-bulleted-list.png",
    icon: createElementNextImage("bulleted-list.png", "bulleted list", 46),
    command: ({ editor, range }: Command) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "번호 매기기 목록",
    description: "번호가 매겨진 목록을 만듭니다.",
    tooltipSrc: "/images/commands/tooltip-numbered-list.png",
    icon: createElementNextImage("numbered-list.png", "numbered list", 46),
    command: ({ editor, range }: Command) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "인용",
    description: "인용문을 작성하세요.",
    tooltipSrc: "/images/commands/tooltip-quote.png",
    icon: createElementNextImage("quote.png", "quote", 46),
    command: ({ editor, range }: Command) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
      editor.chain().focus().deleteRange(range).setBlockquote().run();
    },
  },
  {
    title: "구분선",
    description: "블록을 시각적으로 나눕니다.",
    tooltipSrc: "/images/commands/tooltip-divider.png",
    icon: createElementNextImage("divider.png", "horizontal line", 46),
    command: ({ editor, range }: Command) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "코드",
    description: "코드 스니펫을 작성하세요.",
    tooltipSrc: "/images/commands/tooltip-code.png",
    icon: createElementNextImage("code.png", "code", 46),
    command: ({ editor, range }: Command) => {
      editor.chain().focus().deleteRange(range).setCodeBlock().run();
    },
  },
] as const;
