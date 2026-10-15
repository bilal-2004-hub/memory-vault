import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MemoryCard from '../components/MemoryCard';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Favorites = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = async () => {
    try {
      const response = await api.get('/memories');
      setMemories((response.data.data || []).filter((memory) => memory.isFavorite));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const handleFavoriteToggle = async (memoryId) => {
    try {
      await api.patch(`/memories/${memoryId}/favorite`);
      setMemories((current) => current.filter((memory) => memory._id !== memoryId));
    } catch (error) {
      console.error('Unable to remove favorite', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <Navbar title="My Favorite Memories" />

        {loading ? (
          <p className="text-slate-500">Loading favorites...</p>
        ) : memories.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <p className="text-4xl">❤️</p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-800">No favorite memories yet.</h3>
            <p className="mt-2 text-slate-500">Save your special moments here.</p>
            <Link to="/memories" className="mt-5 inline-block rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white">
              Explore Memories
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {memories.map((memory) => (
              <MemoryCard key={memory._id} memory={memory} onToggleFavorite={handleFavoriteToggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
