import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { Note } from '../api/notes';

type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

interface Props {
  note: Note;
  onSave: (data: { title: string; content: string }) => Promise<Note>;
  onDelete: () => void;
}

export default function NoteEditor({ note, onSave, onDelete }: Props) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (t: string, c: string) => {
      setSaveStatus('saving');
      try {
        await onSave({ title: t, content: c });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    },
    [onSave],
  );

  const scheduleAutoSave = useCallback(
    (t: string, c: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => save(t, c), 1500);
    },
    [save],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (debounceRef.current) clearTimeout(debounceRef.current);
        save(title, content);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [save, title, content]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    setSaveStatus('unsaved');
    scheduleAutoSave(e.target.value, content);
  };

  const handleContentChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setSaveStatus('unsaved');
    scheduleAutoSave(title, e.target.value);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this note? This cannot be undone.')) onDelete();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-200 bg-white shrink-0">
        <SaveIndicator status={saveStatus} />
        <button
          onClick={handleDelete}
          className="text-xs text-red-500 hover:text-red-700 transition-colors px-2 py-1 rounded hover:bg-red-50"
        >
          Delete note
        </button>
      </div>

      <div className="flex flex-col flex-1 overflow-hidden px-8 py-6">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Untitled"
          className="w-full text-2xl font-bold text-gray-900 outline-none border-none bg-transparent placeholder-gray-300 mb-4 shrink-0"
        />
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing…"
          className="flex-1 w-full resize-none outline-none border-none bg-transparent text-gray-700 text-sm leading-relaxed placeholder-gray-300"
        />
      </div>
    </div>
  );
}

function SaveIndicator({ status }: { status: SaveStatus }) {
  const map: Record<SaveStatus, { label: string; className: string }> = {
    saved: { label: 'All changes saved', className: 'text-green-600' },
    saving: { label: 'Saving…', className: 'text-gray-400' },
    unsaved: { label: 'Unsaved changes', className: 'text-amber-500' },
    error: { label: 'Failed to save', className: 'text-red-500' },
  };
  const { label, className } = map[status];
  return <span className={`text-xs ${className}`}>{label}</span>;
}
