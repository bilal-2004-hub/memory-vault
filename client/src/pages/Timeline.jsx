import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import api from '../services/api';

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const Timeline = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMemories = async () => {
      try {
        const response = await api.get('/memories');
        setMemories((response.data.data || []).sort((a, b) => new Date(b.date) - new Date(a.date)));
      } finally {
        setLoading(false);
      }
    };

    loadMemories();
  }, []);

  const grouped = memories.reduce((acc, memory) => {
    const date = new Date(memory.date);
    const year = date.getFullYear();
    const month = date.toLocaleString('en-US', { month: 'long' });

    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(memory);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[#F8F7F4] p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <Navbar title="Timeline" />

        {loading ? (
          <p className="text-slate-500">Loading timeline...</p>
        ) : (
          <div className="space-y-8 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            {Object.keys(grouped)
              .sort((a, b) => Number(b) - Number(a))
              .map((year) => (
                <div key={year}>
                  <h3 className="mb-5 text-2xl font-semibold text-slate-800">{year}</h3>
                  <div className="border-l-2 border-violet-200 pl-6">
                    {Object.keys(grouped[year])
                      .sort((a, b) => new Date(`${b} 1, ${year}`) - new Date(`${a} 1, ${year}`))
                      .map((month) => (
                        <div key={month} className="mb-6">
                          <h4 className="mb-3 text-lg font-semibold text-slate-700">{month}</h4>
                          <div className="space-y-4">
                            {grouped[year][month].map((memory) => (
                              <div key={memory._id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-sm text-slate-500">{formatDate(memory.date)}</p>
                                  <Link to={`/memories/${memory._id}`} className="text-sm font-medium text-violet-600">
                                    View
                                  </Link>
                                </div>
                                <h5 className="mt-2 text-lg font-semibold text-slate-800">{memory.title}</h5>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Timeline;
