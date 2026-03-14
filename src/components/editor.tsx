import type { ComponentType, SVGProps } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor as TiptapEditor } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import {
  Bold, Italic, Strikethrough, Code, Heading1, Heading2,
  List, ListOrdered, Quote, Undo, Redo
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface EditorProps {
  onChange?: (value: string) => void;
  initialContent?: string;
  readOnly?: boolean;
}

type ToolBtnProps = {
  action: () => void;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  isActive?: boolean;
};

const ToolBtn = ({ action, icon: Icon, isActive = false }: ToolBtnProps) => (
  <Button
    variant="ghost"
    size="sm"
    onClick={action}
    className={isActive ? "bg-slate-200" : ""}
  >
    <Icon className="h-4 w-4" />
  </Button>
);

interface ToolbarProps {
  editor: TiptapEditor | null;
}

const Toolbar = ({ editor }: ToolbarProps) => {
  if (!editor) return null;

  return (
    <div className="p-2 flex items-center gap-1 flex-wrap bg-slate-50/50 border-b">
      <ToolBtn action={() => editor.chain().focus().toggleBold().run()} icon={Bold} isActive={editor.isActive("bold")} />
      <ToolBtn action={() => editor.chain().focus().toggleItalic().run()} icon={Italic} isActive={editor.isActive("italic")} />
      <ToolBtn action={() => editor.chain().focus().toggleStrike().run()} icon={Strikethrough} isActive={editor.isActive("strike")} />
      <ToolBtn action={() => editor.chain().focus().toggleCode().run()} icon={Code} isActive={editor.isActive("code")} />

      <Separator orientation="vertical" className="h-6 mx-2" />

      <ToolBtn action={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} icon={Heading1} isActive={editor.isActive("heading", { level: 1 })} />
      <ToolBtn action={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} icon={Heading2} isActive={editor.isActive("heading", { level: 2 })} />

      <Separator orientation="vertical" className="h-6 mx-2" />

      <ToolBtn action={() => editor.chain().focus().toggleBulletList().run()} icon={List} isActive={editor.isActive("bulletList")} />
      <ToolBtn action={() => editor.chain().focus().toggleOrderedList().run()} icon={ListOrdered} isActive={editor.isActive("orderedList")} />
      <ToolBtn action={() => editor.chain().focus().toggleBlockquote().run()} icon={Quote} isActive={editor.isActive("blockquote")} />

      <Separator orientation="vertical" className="h-6 mx-2" />

      <label className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
        Text
        <input
          type="color"
          aria-label="Text color"
          className="h-4 w-6 cursor-pointer border-0 bg-transparent p-0"
          onInput={(event) => {
            editor.chain().focus().setColor(event.currentTarget.value).run();
          }}
        />
      </label>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().unsetColor().run()}
      >
        Reset Text
      </Button>

      <label className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600">
        Background
        <input
          type="color"
          aria-label="Text background color"
          className="h-4 w-6 cursor-pointer border-0 bg-transparent p-0"
          onInput={(event) => {
            editor.chain().focus().setHighlight({ color: event.currentTarget.value }).run();
          }}
        />
      </label>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().unsetHighlight().run()}
      >
        Reset Bg
      </Button>

      <div className="flex-1" />
      
      <ToolBtn action={() => editor.chain().focus().undo().run()} icon={Undo} />
      <ToolBtn action={() => editor.chain().focus().redo().run()} icon={Redo} />
    </div>
  );
};

const Editor = ({ onChange, initialContent, readOnly = false }: EditorProps) => {
  const editor = useEditor({
    editable: !readOnly,
    extensions: [
      StarterKit,
      TextStyle,
      Color.configure({ types: ["textStyle"] }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: "Type '/' for commands..." }),
    ],
    content: initialContent || "",
    editorProps: {
      attributes: {
        class: readOnly
          ? "doc-editor-content doc-editor-readonly h-full w-full focus:outline-none"
          : "doc-editor-content doc-editor-editable h-full w-full focus:outline-none",
      },
    },
    onUpdate({ editor }) {
      onChange?.(editor.getHTML());
    },
  });

  return (
    <div className={readOnly ? "h-full" : "h-full flex flex-col overflow-hidden rounded-lg border border-slate-300 bg-white"}>
      {!readOnly && <Toolbar editor={editor} />}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

export default Editor;