import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontFamily } from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import { FontSize } from './FontSize';
import { useEffect, useRef } from 'react';
import {
  Bold, Italic, Underline as UnderlineIcon, AlignLeft, AlignCenter,
  AlignRight, Highlighter, List, ListOrdered, Undo, Redo, Image as ImageIcon, ChevronDown
} from 'lucide-react';

const FONTS = [
  { label: 'Nunito', value: 'Nunito, sans-serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Dancing Script', value: '"Dancing Script", cursive' },
  { label: 'Lato', value: 'Lato, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Pacifico', value: 'Pacifico, cursive' },
  { label: 'Quicksand', value: 'Quicksand, sans-serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", "Comic Sans", cursive' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
  { label: 'Caveat', value: 'Caveat, cursive' },
  { label: 'Indie Flower', value: '"Indie Flower", cursive' },
];

const FONT_SIZES = [12, 14, 16, 18, 20, 24, 28, 32, 36, 40, 48];

const ToolbarButton = ({ onClick, active, title, children, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded-lg transition-all duration-150 text-sm
      ${active
        ? 'bg-gradient-to-r from-pink-200 to-purple-200 text-purple-700 shadow-inner'
        : 'text-purple-500 hover:bg-pink-50 hover:text-pink-600'
      }
      ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
    `}
  >
    {children}
  </button>
);

export default function RichTextEditor({ content, onChange, onEditorReady }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Underline,
      TextStyle,
      FontFamily.configure({ types: ['textStyle'] }),
      FontSize,
      TextAlign.configure({ types: ['paragraph', 'heading'] }),
      Color.configure({ types: ['textStyle'] }),
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: true, allowBase64: true }),
      Placeholder.configure({
        placeholder: 'Dear Diary... write your heart out today 💕',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'ProseMirror focus:outline-none',
      },
    },
  });

  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // Just fail silently or use a generic alert since we didn't import toast here
        alert('Image must be less than 5MB!');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        editor.chain().focus().setImage({ src: event.target.result }).run();
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };



  // Pass editor up
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  // Sync external content changes
  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content || '', false);
    }
  }, [content, editor]);

  if (!editor) return null;

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-white/60 backdrop-blur-sm rounded-xl border border-pink-100">
        
        {/* History */}
        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo" disabled={!editor.can().undo()}>
          <Undo size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo" disabled={!editor.can().redo()}>
          <Redo size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-pink-200 mx-1" />

        {/* Text style */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight({ color: '#fce4ec' }).run()}
          active={editor.isActive('highlight')}
          title="Highlight"
        >
          <Highlighter size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-pink-200 mx-1" />

        {/* Align */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-pink-200 mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-pink-200 mx-1" />

        {/* Image Upload */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleImageUpload} 
          className="hidden" 
        />
        <ToolbarButton
          onClick={() => fileInputRef.current?.click()}
          title="Insert Image"
        >
          <ImageIcon size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-pink-200 mx-1" />

        {/* Text Color */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-purple-500">Color:</span>
          <input
            type="color"
            title="Text Color"
            defaultValue="#4a3f5c"
            onChange={e => editor.chain().focus().setColor(e.target.value).run()}
            className="w-7 h-7 rounded cursor-pointer border border-pink-200 p-0.5 bg-white"
          />
        </div>
      </div>

      {/* Editor Area */}
      <div
        className="bg-white/50 backdrop-blur-sm rounded-xl border border-pink-100 min-h-[400px]
                   focus-within:border-pink-300 focus-within:ring-2 focus-within:ring-pink-100
                   transition-all duration-200 overflow-hidden"
      >
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
