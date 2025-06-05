// frontend/src/components/ui/RichTextEditor.tsx
'use client';

import React, { useRef, useCallback, useEffect, useState } from 'react';
import { 
  Bold, Italic, Underline, List, ListOrdered, 
  Image, Link, Undo, Redo, AlignLeft, AlignCenter, AlignRight 
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = "Enter your content...", 
  disabled = false,
  className = "",
  error = false
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Initialize editor content
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Handle content changes
  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  }, [onChange]);

  // Execute formatting commands
  const execCommand = useCallback((command: string, value?: string) => {
    if (disabled) return;
    
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  }, [disabled, handleInput]);

  // Format text
  const formatText = useCallback((command: string) => {
    execCommand(command);
  }, [execCommand]);

  // Insert image
  const insertImage = useCallback(() => {
    const url = prompt('Enter image URL:');
    if (url) {
      execCommand('insertImage', url);
    }
  }, [execCommand]);

  // Insert link
  const insertLink = useCallback(() => {
    const url = prompt('Enter link URL:');
    if (url) {
      execCommand('createLink', url);
    }
  }, [execCommand]);

  // Handle paste to clean up formatting
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
    handleInput();
  }, [handleInput]);

  // Handle key commands
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault();
          formatText('bold');
          break;
        case 'i':
          e.preventDefault();
          formatText('italic');
          break;
        case 'u':
          e.preventDefault();
          formatText('underline');
          break;
        case 'z':
          e.preventDefault();
          if (e.shiftKey) {
            execCommand('redo');
          } else {
            execCommand('undo');
          }
          break;
      }
    }
  }, [formatText, execCommand]);

  const toolbarButtons = [
    {
      icon: Bold,
      command: 'bold',
      title: 'Bold (Ctrl+B)',
      action: () => formatText('bold')
    },
    {
      icon: Italic,
      command: 'italic',
      title: 'Italic (Ctrl+I)',
      action: () => formatText('italic')
    },
    {
      icon: Underline,
      command: 'underline',
      title: 'Underline (Ctrl+U)',
      action: () => formatText('underline')
    },
    { type: 'separator' },
    {
      icon: List,
      command: 'insertUnorderedList',
      title: 'Bullet List',
      action: () => execCommand('insertUnorderedList')
    },
    {
      icon: ListOrdered,
      command: 'insertOrderedList',
      title: 'Numbered List',
      action: () => execCommand('insertOrderedList')
    },
    { type: 'separator' },
    {
      icon: AlignLeft,
      command: 'justifyLeft',
      title: 'Align Left',
      action: () => execCommand('justifyLeft')
    },
    {
      icon: AlignCenter,
      command: 'justifyCenter',
      title: 'Align Center',
      action: () => execCommand('justifyCenter')
    },
    {
      icon: AlignRight,
      command: 'justifyRight',
      title: 'Align Right',
      action: () => execCommand('justifyRight')
    },
    { type: 'separator' },
    {
      icon: Image,
      command: 'insertImage',
      title: 'Insert Image',
      action: insertImage
    },
    {
      icon: Link,
      command: 'createLink',
      title: 'Insert Link',
      action: insertLink
    },
    { type: 'separator' },
    {
      icon: Undo,
      command: 'undo',
      title: 'Undo (Ctrl+Z)',
      action: () => execCommand('undo')
    },
    {
      icon: Redo,
      command: 'redo',
      title: 'Redo (Ctrl+Shift+Z)',
      action: () => execCommand('redo')
    }
  ];

  return (
    <div className={`border rounded-lg ${error ? 'border-error' : 'border-base-300'} ${className}`}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-base-300 bg-base-200/50">
        {toolbarButtons.map((button, index) => {
          if (button.type === 'separator') {
            return (
              <div key={index} className="w-px h-6 bg-base-300 mx-1" />
            );
          }

          const Icon = button.icon!;
          return (
            <button
              key={index}
              type="button"
              className="btn btn-ghost btn-sm p-2 min-h-0 h-8"
              onClick={button.action}
              disabled={disabled}
              title={button.title}
            >
              <Icon size={16} />
            </button>
          );
        })}
      </div>

      {/* Editor */}
      <div className="relative">
        <div
          ref={editorRef}
          contentEditable={!disabled}
          onInput={handleInput}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`
            min-h-48 p-4 focus:outline-none
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'}
            prose prose-sm max-w-none
            [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded
            [&_a]:text-primary [&_a]:underline
            [&_ul]:list-disc [&_ul]:ml-6
            [&_ol]:list-decimal [&_ol]:ml-6
            [&_li]:my-1
            [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:my-4
            [&_h2]:text-xl [&_h2]:font-bold [&_h2]:my-3
            [&_h3]:text-lg [&_h3]:font-bold [&_h3]:my-2
            [&_p]:my-2
            [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic
          `}
          style={{ 
            wordBreak: 'break-word',
            overflowWrap: 'break-word'
          }}
          suppressContentEditableWarning={true}
        />
        
        {/* Placeholder */}
        {!value && !isFocused && (
          <div className="absolute top-4 left-4 text-base-content/50 pointer-events-none">
            {placeholder}
          </div>
        )}
      </div>

      {/* Character count */}
      <div className="flex justify-between items-center p-2 text-xs text-base-content/60 border-t border-base-300">
        <span>Characters: {value.replace(/<[^>]*>/g, '').length}</span>
        <span className="text-base-content/40">
          Tip: Use Ctrl+B for bold, Ctrl+I for italic
        </span>
      </div>
    </div>
  );
}

// Export a simpler hook for form usage
export function useRichTextEditor(initialValue: string = '') {
  const [content, setContent] = useState(initialValue);

  const clear = useCallback(() => {
    setContent('');
  }, []);

  const insertText = useCallback((text: string) => {
    setContent(prev => prev + text);
  }, []);

  return {
    content,
    setContent,
    clear,
    insertText
  };
}