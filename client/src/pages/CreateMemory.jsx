import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ImageUploader from '../components/ImageUploader';
import Navbar from '../components/Navbar';
import api from '../services/api';

const moodOptions = ['😊 Happy', '😂 Excited', '❤️ Loved', '😢 Sad', '😌 Peaceful', '🔥 Proud', '🤩 Amazing'];

const defaultForm = {
  title: '',
  description: '',
  date: new Date().toISOString().slice(0, 10),
  location: '',
  mood: '😊 Happy',
};

const CreateMemory = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const [formData, setFormData] = useState(defaultForm);
  const [tagsInput, setTagsInput] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(Boolean(id));
  const [isMoodMenuOpen, setIsMoodMenuOpen] = useState(false);
  const moodMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (moodMenuRef.current && !moodMenuRef.current.contains(event.target)) {
        setIsMoodMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchMemory = async () => {
      if (!id) return;

      try {
        const response = await api.get(`/memories/${id}`);
        const memory = response.data.data;
        setFormData({
          title: memory.title,
          description: memory.description,
          date: new Date(memory.date).toISOString().slice(0, 10),
          location: memory.location || '',
          mood: memory.mood || '😊 Happy',
        });
        setTagsInput((memory.tags || []).join(', '));
        setImages(memory.images || []);
      } catch (error) {
        console.error('Failed to fetch memory', error);
      } finally {
        setPageLoading(false);
      }
    };

    fetchMemory();
  }, [id]);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
      payload.append(
        'tags',
        JSON.stringify(tagsInput
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean))
      );
      payload.append('existingImages', JSON.stringify(images.filter((image) => typeof image === 'string')));
      images.forEach((image) => {
        if (typeof image !== 'string') payload.append('images', image.file);
      });

      if (isEditing) {
        await api.put(`/memories/${id}`, payload);
      } else {
        await api.post('/memories', payload);
      }

      navigate('/memories');
    } catch (error) {
      console.error('Error saving memory', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] p-4 md:p-6">
      <div className="mx-auto max-w-4xl">
        <Navbar title={isEditing ? 'Edit Memory' : 'Create Memory'} />

        {pageLoading ? (
          <p className="text-slate-500">Loading memory...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label htmlFor="memory-title" className="mb-2 block text-sm font-medium text-slate-700">Title</label>
                <input
                  id="memory-title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                  placeholder="My First Internship Day"
                  required
                />
              </div>

              <div>
                <label htmlFor="memory-date" className="mb-2 block text-sm font-medium text-slate-700">Date</label>
                <input
                  id="memory-date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                  required
                />
              </div>

              <div ref={moodMenuRef} className="relative">
                <label className="mb-2 block text-sm font-medium text-slate-700">Mood</label>
                <button
                  type="button"
                  onClick={() => setIsMoodMenuOpen((prev) => !prev)}
                  className="memory-dropdown-trigger flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left shadow-sm transition duration-200 hover:border-violet-300 focus:border-violet-400 focus:outline-none focus:ring-4 focus:ring-violet-100"
                  aria-expanded={isMoodMenuOpen}
                >
                  <span className="flex items-center gap-3 text-slate-700">
                    <span className="text-lg leading-none">{formData.mood.split(' ')[0]}</span>
                    <span className="font-medium">{formData.mood.replace(/^[^\s]+\s/, '')}</span>
                  </span>
                  <span className={`text-xl text-violet-600 transition-transform duration-200 ${isMoodMenuOpen ? 'rotate-180' : ''}`}>
                    ▾
                  </span>
                </button>

                {isMoodMenuOpen && (
                  <div className="mood-menu absolute left-0 right-0 z-20 mt-2 overflow-hidden rounded-2xl border border-violet-100 bg-white p-1 shadow-[0_20px_45px_rgba(76,29,149,0.12)]">
                    {moodOptions.map((option) => {
                      const [emoji, ...labelParts] = option.split(' ');
                      const label = labelParts.join(' ');
                      const isSelected = formData.mood === option;

                      return (
                        <button
                          key={option}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({ ...prev, mood: option }));
                            setIsMoodMenuOpen(false);
                          }}
                          className={`mood-option flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-base font-medium transition ${
                            isSelected ? 'is-selected' : ''
                          }`}
                        >
                          <span className="text-xl leading-none">{emoji}</span>
                          <span>{label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label htmlFor="memory-location" className="mb-2 block text-sm font-medium text-slate-700">Location</label>
                <input
                  id="memory-location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                  placeholder="Lahore, Pakistan"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="memory-tags" className="mb-2 block text-sm font-medium text-slate-700">Tags</label>
                <input
                  id="memory-tags"
                  value={tagsInput}
                  onChange={(event) => setTagsInput(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                  placeholder="internship, career, university"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="memory-description" className="mb-2 block text-sm font-medium text-slate-700">Story / Description</label>
                <textarea
                  id="memory-description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="7"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-400"
                  placeholder="Write your memory..."
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-slate-700">Photos</label>
                <ImageUploader images={images} onChange={setImages} />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button type="button" onClick={() => navigate('/memories')} className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 disabled:cursor-not-allowed disabled:opacity-70">
                {loading ? 'Saving...' : isEditing ? 'Update Memory' : 'Save Memory'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateMemory;
