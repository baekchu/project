import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ResizableMediaNodeView } from "./ResizableMediaNodeView";
import {
  UploadFnType,
  getMediaPasteDropPlugin,
} from "./mediaPasteDropPlugin/mediaPasteDropPlugin";

// Tiptap 확장을 위한 추가 타입 및 명령을 정의합니다.
declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    resizableMedia: {
      /**
       * 미디어 설정
       */
      setMedia: (options: {
        "media-type": "img" | "video";
        src: string;
        alt?: string;
        title?: string;
        width?: string;
        height?: string;
      }) => ReturnType;
    };
  }
}

// 미디어 옵션을 정의하는 인터페이스
export interface MediaOptions {
  HTMLAttributes: Record<string, any>;
  uploadFn: UploadFnType;
}

// 이미지 입력을 위한 정규식
export const IMAGE_INPUT_REGEX =
  /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

// 비디오 입력을 위한 정규식
export const VIDEO_INPUT_REGEX =
  /!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\)/;

// Tiptap 노드를 생성합니다.
export const ResizeableMedia = Node.create({
  name: "resizableMedia",

  // 옵션 추가
  addOptions() {
    return {
      HTMLAttributes: {},
      uploadFn: async () => {
        return "";
      },
    };
  },

  inline: false,
  group: "block",
  draggable: true,

  // 노드의 속성을 정의
  addAttributes() {
    return {
      src: { default: null },
      "media-type": { default: null },
      alt: { default: null },
      title: { default: null },
      width: { default: "100%" },
      height: { default: "auto" },
      dataAlign: { default: "left" },
      dataFloat: { default: null },
    };
  },

  selectable: true,

  // HTML에서 파싱할 때 사용되는 규칙을 정의
  parseHTML() {
    return [
      {
        tag: 'img[src]:not([src^="data:"])',
        getAttrs: (el) => ({
          src: (el as HTMLImageElement).getAttribute("src"),
          "media-type": "img",
        }),
      },
      {
        tag: "video",
        getAttrs: (el) => ({
          src: (el as HTMLVideoElement).getAttribute("src"),
          "media-type": "video",
        }),
      },
    ];
  },

  // HTML로 렌더링할 때 사용되는 규칙을 정의
  renderHTML({ HTMLAttributes }) {
    const { "media-type": mediaType } = HTMLAttributes;

    if (mediaType === "img") {
      return [
        "img",
        mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
      ];
    }
    if (mediaType === "video") {
      return [
        "video",
        { controls: "true", style: "width: 100%", ...HTMLAttributes },
        ["source", HTMLAttributes],
      ];
    }

    if (!mediaType)
      console.error(
        "TiptapMediaExtension-renderHTML method: 미디어 유형이 설정되지 않았습니다. 기본값으로 이미지가 사용됩니다."
      );

    return [
      "img",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
    ];
  },

  // 노드에 대한 명령을 추가
  addCommands() {
    return {
      setMedia:
        (options) =>
        ({ commands }) => {
          const { "media-type": mediaType } = options;

          if (mediaType === "img") {
            return commands.insertContent({
              type: this.name,
              attrs: options,
            });
          }
          if (mediaType === "video") {
            return commands.insertContent({
              type: this.name,
              attrs: {
                ...options,
                controls: "true",
              },
            });
          }

          if (!mediaType)
            console.error(
              "TiptapMediaExtension-setMedia: 미디어 유형이 설정되지 않았습니다. 기본값으로 이미지가 사용됩니다."
            );

          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  // 노드 뷰를 추가
  addNodeView() {
    return ReactNodeViewRenderer(ResizableMediaNodeView);
  },

  // 입력 규칙을 추가
  addInputRules() {
    return [
      nodeInputRule({
        find: IMAGE_INPUT_REGEX,
        type: this.type,
        getAttributes: (match) => {
          const [, , alt, src, title] = match;

          return {
            src,
            alt,
            title,
            "media-type": "img",
          };
        },
      }),
      nodeInputRule({
        find: VIDEO_INPUT_REGEX,
        type: this.type,
        getAttributes: (match) => {
          const [, , src] = match;

          return {
            src,
            "media-type": "video",
          };
        },
      }),
    ];
  },

  // ProseMirror 플러그인을 추가
  addProseMirrorPlugins() {
    return [getMediaPasteDropPlugin(this.options.uploadFn)];
  },
});
