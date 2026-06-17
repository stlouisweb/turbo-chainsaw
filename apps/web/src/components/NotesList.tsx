import type { Note } from '../api/notes';

interface Props {
  notes: Note[];
  selectedId: number | null;
  loading: boolean;
  onSelect: (id: number) => void;
  onCreate: () => void;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function NotesList({ notes, selectedId, loading, onSelect, onCreate }: Props) {
  return (
    <aside className="w-64 shrink-0 border-r border-gray-200 bg-gray-50 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h1 className="text-sm font-semibold text-gray-700 tracking-wide">Notes</h1>
        <button
          onClick={onCreate}
          title="New note"
          className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors text-lg leading-none"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <p className="text-xs text-gray-400 px-4 py-6">Loading...</p>
        ) : notes.length === 0 ? (
          <p className="text-xs text-gray-400 px-4 py-6">No notes yet. Click + to start.</p>
        ) : (
          <ul>
            {notes.map((note) => (
              <li key={note.id}>
                <button
                  onClick={() => onSelect(note.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 transition-colors ${
                    note.id === selectedId
                      ? 'bg-blue-50 border-l-2 border-l-blue-500'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {note.title || 'Untitled'}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 line-clamp-2 leading-relaxed">
                    {note.content || <span className="italic">No content</span>}
                  </p>
                  <p className="text-xs text-gray-300 mt-1">{formatDate(note.updated_at)}</p>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  );
}
