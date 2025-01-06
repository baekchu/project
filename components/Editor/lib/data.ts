import { AiOutlineBold } from "react-icons/ai";
  import {
    LuItalic,
    LuStrikethrough,
    LuUnderline,
  } from "react-icons/lu";
  import { IoCode } from "react-icons/io5";
  
  export const nodes = [
    { type: "paragraph", label: "텍스트" },
    { type: "h1", label: "제목 1" },
    { type: "h2", label: "제목 2" },
    { type: "h3", label: "제목 3" },
    { type: "taskList", label: "할 일 목록" },
    { type: "bulletList", label: "글머리 기호 목록" },
    { type: "orderedList", label: "번호 매기기 목록" },
    { type: "codeBlock", label: "코드" },
    { type: "blockquote", label: "인용" },
  ] as const;
  
  type NodeLabels = {
    // eslint-disable-next-line no-unused-vars
    [K in (typeof nodes)[number]["type"]]: (typeof nodes)[number]["label"];
  };
  export const EnumNodesTypeLabel: NodeLabels = nodes.reduce((acc, node) => {
    acc[node.type] = node.label;
    return acc;
  }, {} as NodeLabels);
  
  export type NodeType = (typeof nodes)[number]["type"];
  
  export const NodeTypeEnum: { [key in NodeType]: key } = nodes.reduce(
    (acc, node) => {
      // @ts-ignore
      acc[node.type] = node.type;
      return acc;
    },
    {} as { [key in NodeType]: key }
  );
  
  export const marks = [
    { type: "bold", toggleKeyword: "toggleBold", icon: AiOutlineBold },
    { type: "italic", toggleKeyword: "toggleItalic", icon: LuItalic },
    { type: "underline", toggleKeyword: "toggleUnderline", icon: LuUnderline },
    { type: "strike", toggleKeyword: "toggleStrike", icon: LuStrikethrough },
    { type: "code", toggleKeyword: "toggleCode", icon: IoCode },
  ] as const;
  
  export const colors = [
    { label: "회색", value: "#6b7280" },
    { label: "갈색", value: "#7c2d12" },
    { label: "주황색", value: "#f97316" },
    { label: "노랑색", value: "#eab308" },
    { label: "초록색", value: "#22c55e" },
    { label: "파란색", value: "#3b82f6" },
    { label: "보라색", value: "#a855f7" },
    { label: "분홍색", value: "#ec4899" },
    { label: "빨간색", value: "#ef4444" },
  ] as const;

  export const ColorsBackground = [
    { label: "회색 배경", value: "#6b7280" },
    { label: "갈색 배경", value: "#7c2d12" },
    { label: "주황색 배경", value: "#f97316" },
    { label: "노랑색 배경", value: "#eab308" },
    { label: "초록색 배경", value: "#22c55e" },
    { label: "파란색 배경", value: "#3b82f6" },
    { label: "보라색 배경", value: "#a855f7" },
    { label: "분홍색 배경", value: "#ec4899" },
    { label: "빨간색 배경", value: "#ef4444" },
  ] as const;
  
  export type TextColor = (typeof colors)[number]["label"];