import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import MemoryCard from '../components/MemoryCard';
import Navbar from '../components/Navbar';
import StatsCard from '../components/StatsCard';
import useAuth from '../hooks/useAuth';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [memories, setMemories] = useState([]);
  const [onThisDay, setOnThisDay] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [memoriesResponse, onThisDayResponse] = await Promise.all([
        api.get('/memories'),
        api.get('/memories/on-this-day'),
      ]);
      setMemories(memoriesResponse.data.data || []);
      setOnThisDay(onThisDayResponse.data.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const totalMemories = memories.length;
    const favoriteCount = memories.filter((memory) => memory.isFavorite).length;
    const currentYearCount = memories.filter((memory) => new Date(memory.date).getFullYear() === currentYear).length;

    const moodCounts = memories.reduce((acc, memory) => {
      const mood = memory.mood || '😊 Happy';
      acc[mood] = (acc[mood] || 0) + 1;
      return acc;
    }, {});

    const tagCounts = memories.reduce((acc, memory) => {
      (memory.tags || []).forEach((tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
      });
      return acc;
    }, {});

    const moodEntries = Object.entries(moodCounts);
    const highestMoodCount = Math.max(0, ...moodEntries.map(([, count]) => count));
    const mostUsedMoods = moodEntries.filter(([, count]) => count === highestMoodCount).map(([mood]) => mood);
    const mostUsedMood = mostUsedMoods.length > 1 ? `Tie: ${mostUsedMoods.join(' / ')}` : mostUsedMoods[0] || null;
    const mostUsedTag = Object.entries(tagCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

    return { totalMemories, favoriteCount, currentYearCount, mostUsedMood, mostUsedTag };
  }, [memories]);

  const handleFavoriteToggle = async (memoryId, isFavorite) => {
    try {
      const response = await api.patch(`/memories/${memoryId}/favorite`);
      const updatedMemory = response.data.data;
      setMemories((current) =>
        current.map((memory) => (memory._id === memoryId ? { ...memory, isFavorite: updatedMemory.isFavorite } : memory))
      );
    } catch (error) {
      console.error('Unable to update favorite', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] p-6 text-slate-500">
        <div className="mx-auto max-w-6xl">Loading your dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        <Navbar title="Dashboard" />

        <section className="mb-8 rounded-[30px] border border-slate-200 bg-gradient-to-r from-violet-600 to-violet-500 p-6 text-white shadow-xl shadow-violet-200 md:p-8">
          <p className="text-sm uppercase tracking-[0.22em] text-violet-100">Good evening, {user?.fullName || 'Friend'} 👋</p>
          <h2 className="mt-4 text-3xl font-semibold">"Every moment becomes a memory."</h2>
        </section>

        <div className="grid gap-4 md:grid-cols-4">
          <StatsCard label="Total Memories" value={stats.totalMemories} accent="violet" />
          <StatsCard label="Favorites" value={stats.favoriteCount} accent="rose" />
          <StatsCard label="This Year" value={stats.currentYearCount} accent="teal" />
          <StatsCard
            label="Most Used Mood"
            value={stats.mostUsedMood || '—'}
            accent="amber"
          />
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-800">Recent Memories</h3>
              <Link to="/memories" className="text-sm font-medium text-violet-600">
                View all
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {memories.slice(0, 4).map((memory) => (
                <MemoryCard key={memory._id} memory={memory} onToggleFavorite={handleFavoriteToggle} />
              ))}
            </div>
          </section>

          <aside className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold text-slate-800">✨ On This Day</h3>
              {onThisDay.length === 0 ? (
                <p className="text-sm text-slate-500">No memories from previous years on this day yet.</p>
              ) : (
                <div className="space-y-3">
                  {onThisDay.slice(0, 3).map((memory) => {
                    const memoryDate = new Date(memory.date);
                    const yearsAgo = new Date().getFullYear() - memoryDate.getFullYear();
                    const label = yearsAgo === 0 ? 'This year' : yearsAgo === 1 ? '1 year ago today' : `${yearsAgo} years ago today`;

                    return (
                      <div key={memory._id} className="rounded-2xl border border-violet-100 bg-violet-50 p-3">
                        <p className="text-xs uppercase tracking-[0.18em] text-violet-600">{label}</p>
                        <h4 className="mt-1 font-semibold text-slate-800">{memory.title}</h4>
                        <Link to={`/memories/${memory._id}`} className="mt-2 inline-block text-sm font-medium text-violet-600">
                          View Memory
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-xl font-semibold text-slate-800">Your Memory Stats</h3>
              {stats.totalMemories === 0 ? (
                <p className="text-sm text-slate-500">Start creating memories to unlock your mood and tag insights.</p>
              ) : (
                <div className="space-y-3 text-sm text-slate-600">
                  <p>Total Memories: <span className="font-semibold text-slate-800">{stats.totalMemories}</span></p>
                  <p>Favorites: <span className="font-semibold text-slate-800">{stats.favoriteCount}</span></p>
                  <p>Most Used Mood: <span className="font-semibold text-slate-800">{stats.mostUsedMood || '—'}</span></p>
                  <p>Most Used Tag: <span className="font-semibold text-slate-800">{stats.mostUsedTag ? `#${stats.mostUsedTag}` : '—'}</span></p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
