import React, { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  Bold, Italic, Underline, Strikethrough, Code, List, ListOrdered,
  Quote, Link, Image, Table, Minus, Undo, Redo, Eye, Edit2, Type,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  className?: string;
  label?: string;
  id?: string;
}

type HeadingLevel = 'p' | 'h1' | 'h2' | 'h3' | 'h4';

const HEADING_OPTIONS: { value: HeadingLevel; label: string }[] = [
  { value: 'p', label: 'Paragraph' },
  { value: 'h1', label: 'Heading 1' },
  { value: 'h2', label: 'Heading 2' },
  { value: 'h3', label: 'Heading 3' },
  { value: 'h4', label: 'Heading 4' },
];

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Type here...',
  minHeight = 180,
  className,
  label,
  id,
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const [isPreview, setIsPreview] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [currentHeading, setCurrentHeading] = useState<HeadingLevel>('p');
  const hideToolbarTimer = useRef<ReturnType<typeof setTimeout>>();
  const isMouseInToolbar = useRef(false);

  // ─── The key fix: treat contentEditable as UNCONTROLLED after mount ──────────
  // We ONLY initialize innerHTML on first mount.
  // We ONLY reset innerHTML when value becomes '' from outside (form reset signal).
  // We NEVER sync value→DOM while the user is interacting.
  const initialized = useRef(false);
  const prevValueRef = useRef(value);

  // Initialize on mount (runs before paint to avoid flash)
  useLayoutEffect(() => {
    if (editorRef.current && !initialized.current) {
      editorRef.current.innerHTML = value || '';
      prevValueRef.current = value;
      initialized.current = true;
      updateCharCount();
    }
  }, []); // intentionally empty — mount only

  // Sync when parent changes value externally (e.g. opening a different article to edit,
  // resetting the form, or loading existing content).
  // KEY INSIGHT: prevValueRef is updated in handleInput each time the user types.
  // So if value === prevValueRef.current it means the parent just echoed back what
  // the user typed → no DOM touch needed (cursor stays put).
  // If value !== prevValueRef.current it means a real external change → sync the DOM.
  useEffect(() => {
    if (!editorRef.current || !initialized.current) return;
    if (value !== prevValueRef.current) {
      editorRef.current.innerHTML = value || '';
      prevValueRef.current = value;
      updateCharCount();
    }
  }, [value]);

  const updateCharCount = () => {
    if (editorRef.current) {
      setCharCount(editorRef.current.innerText.replace(/\n/g, '').length);
    }
  };

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      prevValueRef.current = html; // keep in sync so our effect doesn't override
      onChange(html);
      updateCharCount();
    }
  }, [onChange]);

  const handleFocus = () => {
    clearTimeout(hideToolbarTimer.current);
    setIsToolbarVisible(true);
    setIsPreview(false);
  };

  const handleBlur = () => {
    if (!isMouseInToolbar.current) {
      hideToolbarTimer.current = setTimeout(() => {
        setIsToolbarVisible(false);
      }, 200);
    }
  };

  const execCmd = useCallback((command: string, cmdValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, cmdValue);
    handleInput();
  }, [handleInput]);

  const handleFormatBlock = (tag: HeadingLevel) => {
    setCurrentHeading(tag);
    setShowHeadingMenu(false);
    execCmd('formatBlock', tag === 'p' ? 'p' : tag);
  };

  const handleLink = () => {
    const url = prompt('Enter URL:', 'https://');
    if (url) execCmd('createLink', url);
  };

  const handleImageUrl = () => {
    const url = prompt('Enter image URL:', 'https://');
    if (url) execCmd('insertImage', url);
  };

  const handleTable = () => {
    let tableHtml = '<table border="1" style="border-collapse:collapse;width:100%;margin:8px 0;">';
    for (let r = 0; r < 3; r++) {
      tableHtml += '<tr>';
      for (let c = 0; c < 3; c++) {
        tableHtml += r === 0
          ? '<th style="padding:6px;background:#f0f0f0;">Header</th>'
          : '<td style="padding:6px;">Cell</td>';
      }
      tableHtml += '</tr>';
    }
    tableHtml += '</table>';
    execCmd('insertHTML', tableHtml);
  };

  const ToolbarButton: React.FC<{
    onClick: () => void;
    title: string;
    children: React.ReactNode;
    active?: boolean;
  }> = ({ onClick, title, children, active }) => (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={title}
      className={cn(
        'h-7 w-7 flex items-center justify-center rounded hover:bg-muted transition-colors text-foreground/70 hover:text-foreground',
        active && 'bg-primary/10 text-primary'
      )}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => <div className="w-px h-5 bg-border mx-0.5" />;

  const headingLabel = HEADING_OPTIONS.find(h => h.value === currentHeading)?.label || 'Heading';

  return (
    <div className={cn('relative', className)}>
      <div
        className={cn(
          'rounded-lg border-2 transition-all duration-200',
          isToolbarVisible ? 'border-primary shadow-sm' : 'border-input',
        )}
      >
        {/* Auto-show toolbar (animated) */}
        <AnimatePresence>
          {isToolbarVisible && !isPreview && (
            <motion.div
              initial={{ opacity: 0, y: -6, scaleY: 0.9 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -6, scaleY: 0.9 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="px-3 py-1.5 border-b flex items-center gap-0.5 flex-wrap bg-background rounded-t-lg origin-top"
              onMouseEnter={() => { isMouseInToolbar.current = true; clearTimeout(hideToolbarTimer.current); }}
              onMouseLeave={() => { isMouseInToolbar.current = false; }}
            >
              {/* Heading dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); setShowHeadingMenu(v => !v); }}
                  className="flex items-center gap-1 h-7 px-2 rounded hover:bg-muted transition-colors text-xs font-medium text-foreground/80"
                >
                  <Type size={13} />
                  <span className="hidden sm:inline">{headingLabel.length > 8 ? headingLabel.slice(0, 7) + '…' : headingLabel}</span>
                  <ChevronDown size={11} />
                </button>
                <AnimatePresence>
                  {showHeadingMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      className="absolute top-full left-0 mt-1 bg-popover border rounded-md shadow-md z-50 min-w-[130px] py-1"
                    >
                      {HEADING_OPTIONS.map((h) => (
                        <button
                          key={h.value}
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); handleFormatBlock(h.value); }}
                          className={cn(
                            'w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors',
                            currentHeading === h.value && 'text-primary font-medium'
                          )}
                        >
                          {h.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <ToolbarDivider />
              <ToolbarButton onClick={() => execCmd('bold')} title="Bold"><Bold size={14} /></ToolbarButton>
              <ToolbarButton onClick={() => execCmd('italic')} title="Italic"><Italic size={14} /></ToolbarButton>
              <ToolbarButton onClick={() => execCmd('underline')} title="Underline"><Underline size={14} /></ToolbarButton>
              <ToolbarButton onClick={() => execCmd('strikeThrough')} title="Strikethrough"><Strikethrough size={14} /></ToolbarButton>
              <ToolbarButton onClick={() => execCmd('formatBlock', 'pre')} title="Code"><Code size={14} /></ToolbarButton>
              <ToolbarDivider />
              <ToolbarButton onClick={() => execCmd('insertUnorderedList')} title="Bullet list"><List size={14} /></ToolbarButton>
              <ToolbarButton onClick={() => execCmd('insertOrderedList')} title="Ordered list"><ListOrdered size={14} /></ToolbarButton>
              <ToolbarButton onClick={() => execCmd('formatBlock', 'blockquote')} title="Quote"><Quote size={14} /></ToolbarButton>
              <ToolbarDivider />
              <ToolbarButton onClick={handleLink} title="Insert link"><Link size={14} /></ToolbarButton>
              <ToolbarButton onClick={handleImageUrl} title="Insert image"><Image size={14} /></ToolbarButton>
              <ToolbarButton onClick={handleTable} title="Insert table"><Table size={14} /></ToolbarButton>
              <ToolbarButton onClick={() => execCmd('insertHorizontalRule')} title="Horizontal rule"><Minus size={14} /></ToolbarButton>
              <ToolbarDivider />
              <ToolbarButton onClick={() => execCmd('undo')} title="Undo"><Undo size={14} /></ToolbarButton>
              <ToolbarButton onClick={() => execCmd('redo')} title="Redo"><Redo size={14} /></ToolbarButton>

              <div className="ml-auto flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{charCount} chars</span>
                <Button
                  type="button" size="sm" variant="outline"
                  className="h-6 px-2 text-xs gap-1 border-muted-foreground/30"
                  onMouseDown={(e) => { e.preventDefault(); setIsPreview(v => !v); }}
                >
                  <Eye size={11} /> Preview
                </Button>
                <Button
                  type="button" size="sm"
                  className="h-6 px-2 text-xs gap-1 bg-primary"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <Edit2 size={11} /> Edit
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Static ghost toolbar when blurred */}
        {!isToolbarVisible && (
          <div className="px-3 py-1.5 border-b flex items-center gap-1 bg-muted/30 rounded-t-lg">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Type size={12} /><span>Heading</span><ChevronDown size={11} />
            </div>
            <div className="w-px h-4 bg-border mx-1" />
            {[Bold, Italic, Underline, Strikethrough, Code, List, ListOrdered, Quote, Link, Image, Table, Minus, Undo, Redo].map((Icon, i) => (
              <div key={i} className="h-6 w-6 flex items-center justify-center text-muted-foreground/40">
                <Icon size={13} />
              </div>
            ))}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{charCount} chars</span>
              <Button type="button" size="sm" variant="outline" className="h-6 px-2 text-xs gap-1"
                onMouseDown={(e) => { e.preventDefault(); editorRef.current?.focus(); }}>
                <Eye size={11} />Preview
              </Button>
              <Button type="button" size="sm" className="h-6 px-2 text-xs gap-1 bg-primary"
                onMouseDown={(e) => { e.preventDefault(); editorRef.current?.focus(); }}>
                <Edit2 size={11} />Edit
              </Button>
            </div>
          </div>
        )}

        {/* Preview panel */}
        {isPreview ? (
          <div
            className="px-4 py-3 prose prose-sm max-w-none"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{ __html: prevValueRef.current || `<p class="text-muted-foreground italic">${placeholder}</p>` }}
          />
        ) : (
          /* The actual editable area — UNCONTROLLED after mount */
          <div
            ref={editorRef}
            id={id}
            contentEditable
            suppressContentEditableWarning
            onFocus={handleFocus}
            onBlur={handleBlur}
            onInput={handleInput}
            className={cn(
              'px-4 py-3 outline-none prose prose-sm max-w-none rounded-b-lg',
              'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground empty:before:italic empty:before:pointer-events-none'
            )}
            style={{ minHeight }}
            data-placeholder={placeholder}
          />
        )}
      </div>
    </div>
  );
};

export default RichTextEditor;
