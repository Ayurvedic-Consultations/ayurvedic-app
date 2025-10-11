import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Placeholder from "@tiptap/extension-placeholder";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Heading from "@tiptap/extension-heading";

import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    List,
    ListOrdered,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Image as ImageIcon,
    Link as LinkIcon,
    Highlighter,
    Heading1,
} from "lucide-react";

import "./RichTextEditor.css";

const RichTextEditor = ({ content, onChange }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: false,
            }),
            Heading.configure({
                levels: [1, 2, 3, 4, 5, 6],
                HTMLAttributes: {
                    class: "my-heading",
                },
            }),
            Underline,
            TextStyle,
            Color,
            Highlight,
            Link.configure({ openOnClick: false }),
            Image,
            TextAlign.configure({
                types: ["heading", "paragraph"],
            }),
            BulletList,
            OrderedList,
            ListItem,
            Placeholder.configure({
                placeholder: "Write your amazing blog here...",
            }),
        ],
        content,
        // The onUpdate function is crucial here to trigger re-renders
        // when the editor state changes, which allows isActive() to work.
        onUpdate: ({ editor }) => onChange(editor.getHTML()),
    });

    if (!editor) return null;

    const handleHeadingChange = (e) => {
        const level = e.target.value;
        if (level === "paragraph") editor.chain().focus().setParagraph().run();
        else editor.chain().focus().toggleHeading({ level: parseInt(level) }).run();
    };

    // Helper to get the current heading level for the dropdown
    const getCurrentHeadingLevel = () => {
        for (let i = 1; i <= 6; i++) {
            if (editor.isActive('heading', { level: i })) {
                return String(i);
            }
        }
        return "paragraph";
    };

    return (
        <div className="rte-container">
            <div className="rte-toolbar">
                {/* 1. Heading Dropdown Fix (using value and onChange) */}
                <div className="rte-heading-select">
                    <Heading1 size={18} />
                    <select
                        onChange={handleHeadingChange}
                        value={getCurrentHeadingLevel()} // Set the current active value
                    >
                        <option value="paragraph">Paragraph</option>
                        <option value="1">H1</option>
                        <option value="2">H2</option>
                        <option value="3">H3</option>
                        <option value="4">H4</option>
                        <option value="5">H5</option>
                        <option value="6">H6</option>
                    </select>
                </div>

                {/* 2. Bold Button Fix (using editor.isActive() and a conditional class) */}
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    // Conditionally add a class when the formatting is active
                    className={editor.isActive("bold") ? "is-active" : ""}
                >
                    <Bold size={18} />
                </button>

                {/* Italic Button Fix */}
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive("italic") ? "is-active" : ""}
                >
                    <Italic size={18} />
                </button>

                {/* Underline Button Fix */}
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive("underline") ? "is-active" : ""}
                >
                    <UnderlineIcon size={18} />
                </button>

                {/* Bullet List Fix */}
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive("bulletList") ? "is-active" : ""}
                >
                    <List size={18} />
                </button>

                {/* Ordered List Fix */}
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive("orderedList") ? "is-active" : ""}
                >
                    <ListOrdered size={18} />
                </button>

                {/* Text Align Buttons Fix */}
                <button
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    className={editor.isActive({ textAlign: "left" }) ? "is-active" : ""}
                >
                    <AlignLeft size={18} />
                </button>

                <button
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    className={editor.isActive({ textAlign: "center" }) ? "is-active" : ""}
                >
                    <AlignCenter size={18} />
                </button>

                <button
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    className={editor.isActive({ textAlign: "right" }) ? "is-active" : ""}
                >
                    <AlignRight size={18} />
                </button>

                {/* Highlight Button Fix */}
                <button
                    onClick={() => editor.chain().focus().toggleHighlight().run()}
                    className={editor.isActive("highlight") ? "is-active" : ""}
                >
                    <Highlighter size={18} />
                </button>

                {/* Link and Image buttons don't typically have an active state in the same way,
                    but you could check if a link is active for a "remove link" button if you wanted. 
                    I'll keep them as they are for simplicity here. */}
                <button
                    onClick={() => {
                        const url = window.prompt("Enter image URL:");
                        if (url) editor.chain().focus().setImage({ src: url }).run();
                    }}
                >
                    <ImageIcon size={18} />
                </button>

                <button
                    onClick={() => {
                        const url = window.prompt("Enter link URL:");
                        if (url) editor.chain().focus().setLink({ href: url }).run();
                        else editor.chain().focus().unsetLink().run(); // Optional: remove link if prompt is empty/cancelled
                    }}
                    // Conditionally highlight if a link is active
                    className={editor.isActive("link") ? "is-active" : ""}
                >
                    <LinkIcon size={18} />
                </button>
            </div>
            <EditorContent editor={editor} className="rte-editor" />
        </div>
    );
};

export default RichTextEditor;