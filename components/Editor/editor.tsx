"use client";

import { useEditor, EditorContent } from "@tiptap/react";

import { useState, useEffect } from "react";

import TextMenu from "./BubbleMenu/TextMenu";
import Skeleton from "./components/Skeleton";
import { TipTapEditorExtensions } from "./lib/extensions-editor";
import { TipTapEditorProps } from "./lib/props";

type Props = {
  data: string; // 초기 데이터
  onChange: (data: string) => void; // 데이터 변경 시 호출될 함수
};

const Editor = ({ data, onChange }: Props) => {
  const [hydrated, setHydrated] = useState<boolean>(false);


  const editor = useEditor({
    extensions: TipTapEditorExtensions, // 사용할 에디터 확장들을 설정, 여기서 '명령어를 보려면 '/'를 입력하세요.'를 불러와야 됨
    editorProps: TipTapEditorProps, // 에디터의 속성을 설정
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML()); // 에디터 내용이 변경될 때마다 onChange 함수를 호출
    },
    content: data ?? "", // 초기 데이터를 설정
  });

  /* 에디터가 준비되면 hydrated 상태를 true로 설정 */
  useEffect(() => {
    if (editor && !hydrated) {
      setHydrated(true);
    }
  }, [editor, hydrated]);

  /* 에디터 컨테이너를 반환 */
  return (
    <div
      id="editor-container"
      className="relative w-full cursor-text flex-1 px-2 py-2 selection:text-[unset] selection:bg-sky-200"
    >
      {/* 에디터가 준비된 경우 다음을 렌더링 */}
      {hydrated ? (
        <div id="menu-two" className="w-full mx-auto min-h-[10rem]">
          <TextMenu editor={editor} /> {/* 텍스트 메뉴를 표시 */}
          <EditorContent editor={editor} /> {/* 에디터 내용을 표시 */}
        </div>
      ) : (
        <div className="w-full mx-auto h-full">
          <Skeleton />
          {/* 에디터가 준비되지 않은 동안 스켈레톤 로딩*/}
        </div>
      )}
    </div>
  );
}

export default Editor;