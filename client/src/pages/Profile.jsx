import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';

const Profile = () => {
  const [profile, setProfile] = useState(null);
  const [memories, setMemories] = useState([]);
  const [formData, setFormData] = useState({ fullName: '', email: '', profilePicture: '' });
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [profileResponse, memoriesResponse] = await Promise.all([api.get('/users/profile'), api.get('/memories')]);
      const user = profileResponse.data.data;
      setProfile(user);
      setMemories(memoriesResponse.data.data || []);
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        profilePicture: user.profilePicture || '',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await api.put('/users/profile', formData);
      setProfile(response.data.data);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Profile update failed', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-[#F8F7F4] p-6 text-slate-500">Loading profile...</div>;
  }

  const favoriteCount = memories.filter((memory) => memory.isFavorite).length;

  return (
    <div className="min-h-screen bg-[#F8F7F4] p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <Navbar title="Profile" showSearch={false} />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-violet-100 text-3xl font-semibold text-violet-700">
                {profile?.profilePicture ? (
                  <img src={profile.profilePicture} alt="Profile avatar" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <span>{profile?.fullName?.charAt(0)?.toUpperCase() || 'M'}</span>
                )}
              </div>
              <h2 className="mt-5 text-2xl font-semibold text-slate-800">{profile?.fullName}</h2>
              <p className="text-slate-500">{profile?.email}</p>

              <div className="mt-6 grid w-full grid-cols-2 gap-3 text-left">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Memories</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">{memories.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Favorites</p>
                  <p className="mt-2 text-2xl font-semibold text-slate-800">{favoriteCount}</p>
                </div>
              </div>

              <p className="mt-6 text-sm text-slate-500">
                Member since: {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently'}
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-2xl font-semibold text-slate-800">Edit Profile</h3>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                <input
                  value={formData.fullName}
                  onChange={(event) => setFormData({ ...formData, fullName: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Profile picture URL</label>
                <input
                  type="url"
                  value={formData.profilePicture}
                  onChange={(event) => setFormData({ ...formData, profilePicture: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400"
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>

              <button type="submit" className="rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200">
                Save changes
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
