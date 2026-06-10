import { Markdown } from "tiptap-markdown";

declare module "@tiptap/core" {
  interface Editor {
    storage: {
      markdown: {
        getMarkdown: () => string;
      };
      [key: string]: any;
    };
  }
}
