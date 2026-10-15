import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MemoryImage from '../components/MemoryImage';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const MemoryDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [memory, setMemory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadMemory = async () => {
    try {
      const response = await api.get(`/memories/${id}`);
      setMemory(response.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemory();
  }, [id]);

  const toggleFavorite = async () => {
    try {
      const response = await api.patch(`/memories/${id}/favorite`);
      setMemory((current) => ({ ...current, isFavorite: response.data.data.isFavorite }));
    } catch (error) {
      console.error('Unable to toggle favorite', error);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await api.delete(`/memories/${id}`);
      showToast('Memory deleted successfully');
      navigate('/memories');
    } catch (error) {
      console.error('Unable to delete memory', error);
      showToast('Unable to delete memory', 'error');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F8F7F4] p-6 text-slate-500">Loading memory...</div>;
  }

  if (!memory) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] p-6 text-center">
        <h2 className="text-2xl font-semibold text-slate-800">Memory not found</h2>
        <Link to="/memories" className="mt-4 inline-block rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white">
          Back to memories
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] p-4 md:p-6">
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-[2px] dark:bg-slate-950/80">
          <div className="w-full max-w-md rounded-[30px] border border-slate-200 bg-white p-6 text-slate-900 shadow-[0_25px_80px_rgba(15,23,42,0.35)] ring-1 ring-slate-200/80 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700/80">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-violet-400">Delete memory</p>
            <h3 className="mt-3 text-2xl font-semibold text-slate-900 dark:text-slate-50">Delete this memory?</h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">This action cannot be undone.</p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-transform duration-150 hover:scale-105 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-red-200 transition-transform duration-150 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:scale-100 dark:shadow-red-950/50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
            ← Back to Memories
          </button>
          <div className="flex gap-2">
            <Link to={`/memories/${id}/edit`} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
              ✏️ Edit
            </Link>
            <button onClick={() => setShowDeleteConfirm(true)} className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
              🗑️ Delete
            </button>
          </div>
        </div>

        <article className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-4 p-6 md:grid-cols-[1.2fr_0.8fr] md:p-8">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-violet-500">Journal entry</p>
              <h1 className="mt-4 text-4xl font-semibold text-violet-700 dark:text-violet-300">{memory.title}</h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-600">
                <span>📅 {formatDate(memory.date)}</span>
                <span>📍 {memory.location || 'Location not added'}</span>
                <span>{memory.mood || '😊 Happy'}</span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {(memory.tags || []).map((tag) => (
                  <span key={tag} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={toggleFavorite}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700"
              >
                {memory.isFavorite ? '❤️ Favorite' : '🤍 Favorite'}
              </button>
            </div>
          </div>

          {memory.images?.length > 0 && (
            <div className="space-y-4 border-t border-slate-200 p-6 md:p-8">
              <MemoryImage src={memory.images[0]} alt={memory.title} className="h-[420px] w-full rounded-[28px] object-cover" />
              {memory.images.length > 1 && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  {memory.images.slice(1).map((image, index) => (
                    <MemoryImage key={`${image}-${index}`} src={image} alt={`${memory.title}-${index}`} className="h-24 w-full rounded-2xl object-cover" />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="border-t border-slate-200 p-6 md:p-8">
            <h3 className="text-xl font-semibold text-slate-800">My Story</h3>
            <p className="mt-4 whitespace-pre-line text-base leading-8 text-slate-600">{memory.description}</p>
          </div>
        </article>
      </div>
    </div>
  );
};

export default MemoryDetails;
