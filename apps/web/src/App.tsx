import { useEffect, useState } from 'react';
import { notesApi } from './api/notes';
import type { Note } from './api/notes';
import NotesList from './components/NotesList';
import NoteEditor from './components/NoteEditor';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const selectedNote = notes.find((n) => n.id === selectedId) ?? null;

  useEffect(() => {
    notesApi
      .list()
      .then((data) => {
        setNotes(data);
        if (data.length > 0) setSelectedId(data[0].id);
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    try {
      const note = await notesApi.create({ title: 'Untitled', content: '' });
      setNotes((prev) => [note, ...prev]);
      setSelectedId(note.id);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  const handleUpdate = async (id: number, data: { title: string; content: string }) => {
    const updated = await notesApi.update(id, data);
    setNotes((prev) => prev.map((n) => (n.id === id ? updated : n)));
    return updated;
  };

  const handleDelete = async (id: number) => {
    try {
      await notesApi.delete(id);
      const remaining = notes.filter((n) => n.id !== id);
      setNotes(remaining);
      setSelectedId(remaining[0]?.id ?? null);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  return (
    <div className="h-screen flex bg-white overflow-hidden">
      <NotesList
        notes={notes}
        selectedId={selectedId}
        loading={loading}
        onSelect={setSelectedId}
        onCreate={handleCreate}
      />

      <main className="flex-1 flex flex-col overflow-hidden">
        {error && (
          <div className="shrink-0 mx-6 mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
            <button
              className="ml-3 underline text-xs"
              onClick={() => setError(null)}
            >
              Dismiss
            </button>
          </div>
        )}

        {!loading && selectedNote ? (
          <NoteEditor
            key={selectedNote.id}
            note={selectedNote}
            onSave={(data) => handleUpdate(selectedNote.id, data)}
            onDelete={() => handleDelete(selectedNote.id)}
          />
        ) : !loading ? (
          <EmptyState onCreate={handleCreate} />
        ) : null}
      </main>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
      <p className="text-gray-400 text-sm mb-4">No note selected</p>
      <button
        onClick={onCreate}
        className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
      >
        New note
      </button>
    </div>
  );
}
