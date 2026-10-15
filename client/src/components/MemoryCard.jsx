import { Link } from 'react-router-dom';
import MemoryImage from './MemoryImage';

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

const MemoryCard = ({ memory, onToggleFavorite }) => {
  const imageUrl = memory.images?.[0] || 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=900&q=80';

  return (
    <article className="group overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/memories/${memory._id}`} className="block overflow-hidden">
        <MemoryImage
          src={imageUrl}
          alt={memory.title}
          className="h-52 w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </Link>

      <div className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <Link to={`/memories/${memory._id}`} className="text-lg font-semibold text-slate-800 hover:text-violet-600">
              {memory.title}
            </Link>
            <p className="mt-1 text-sm text-slate-500">{formatDate(memory.date)}</p>
          </div>

          <button
            type="button"
            onClick={() => onToggleFavorite(memory._id, memory.isFavorite)}
            className="rounded-full border border-slate-200 bg-slate-50 p-2 text-lg transition hover:border-red-200 hover:bg-red-50"
            aria-label="Toggle favorite"
          >
            {memory.isFavorite ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="space-y-2 text-sm text-slate-600">
          <p>📍 {memory.location || 'Location not added'}</p>
          <p>{memory.mood || '😊 Happy'}</p>
          <div className="flex flex-wrap gap-2">
            {(memory.tags || []).slice(0, 3).map((tag) => (
              <span key={tag} className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
};

export default MemoryCard;
