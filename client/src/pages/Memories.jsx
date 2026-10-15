import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import MemoryCard from '../components/MemoryCard';
import Navbar from '../components/Navbar';
import api from '../services/api';

const tagFilters = ['All', 'Travel', 'Family', 'University', 'Friends', 'Work'];
const categoryKeywords = {
  Travel: ['travel', 'traveler', 'traveling', 'trip', 'trips', 'vacation', 'holiday', 'journey', 'tourism', 'adventure', 'roadtrip'],
  Family: ['family', 'mom', 'mother', 'dad', 'father', 'parent', 'parents', 'sibling', 'brother', 'sister', 'grandma', 'grandmother', 'grandpa', 'grandfather', 'cousin', 'relative'],
  University: ['university', 'college', 'campus', 'student', 'study', 'studies', 'class', 'lecture', 'exam', 'graduation', 'graduate', 'internship'],
  Friends: ['friend', 'friends', 'friendship', 'buddy', 'buddies', 'bestie', 'besties', 'squad'],
  Work: ['work', 'job', 'office', 'career', 'internship', 'intern', 'colleague', 'coworker', 'business', 'professional'],
};

const Memories = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') || '';
  const [memories, setMemories] = useState([]);
  const [activeTag, setActiveTag] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadMemories = async () => {
    try {
      const response = await api.get('/memories');
      setMemories(response.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMemories();
  }, []);

  const filteredMemories = useMemo(() => {
    return memories.filter((memory) => {
      const matchesSearch =
        search.trim() === '' ||
        [memory.title, memory.description, memory.location, (memory.tags || []).join(' ')]
          .join(' ')
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesTag =
        activeTag === 'All' ||
        (memory.tags || []).some((tag) => {
          const words = String(tag).toLowerCase().replace(/^#+/, '').split(/[^a-z0-9]+/);
          return words.some((word) => categoryKeywords[activeTag]?.includes(word));
        });
      return matchesSearch && matchesTag;
    });
  }, [memories, search, activeTag]);

  const handleSearchChange = (value) => {
    const nextSearchParams = new URLSearchParams(searchParams);
    if (value) {
      nextSearchParams.set('search', value);
    } else {
      nextSearchParams.delete('search');
    }
    setSearchParams(nextSearchParams, { replace: true });
  };

  const handleFavoriteToggle = async (memoryId) => {
    try {
      const response = await api.patch(`/memories/${memoryId}/favorite`);
      const updatedMemory = response.data.data;
      setMemories((current) =>
        current.map((memory) => (memory._id === memoryId ? { ...memory, isFavorite: updatedMemory.isFavorite } : memory))
      );
    } catch (error) {
      console.error('Unable to toggle favorite', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <Navbar title="My Memories" showSearch />

        <div className="mb-6 flex flex-col gap-4 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {tagFilters.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => setActiveTag(tag)}
                className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                  activeTag === tag ? 'bg-violet-600 text-white' : 'border border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>

          <Link to="/memories/create" className="rounded-full bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-200">
            + Add Memory
          </Link>
        </div>

        {loading ? (
          <p className="text-slate-500">Loading memories...</p>
        ) : filteredMemories.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm">
            <p className="text-4xl">📸</p>
            <h3 className="mt-4 text-2xl font-semibold text-slate-800">Your vault is empty.</h3>
            <p className="mt-2 text-slate-500">Start saving your first memory.</p>
            <Link to="/memories/create" className="mt-5 inline-block rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white">
              + Create Memory
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredMemories.map((memory) => (
              <MemoryCard key={memory._id} memory={memory} onToggleFavorite={handleFavoriteToggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Memories;
