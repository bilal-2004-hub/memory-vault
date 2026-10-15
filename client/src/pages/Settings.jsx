import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import useTheme from '../context/theme';
import { useToast } from '../context/ToastContext';
import api from '../services/api';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { showToast } = useToast();
  const [profile, setProfile] = useState({ fullName: '', email: '' });
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    notifications: true,
  });

  const loadProfile = async () => {
    try {
      const response = await api.get('/users/profile');
      const user = response.data.data;
      setProfile(user);
      setForm((current) => ({
        ...current,
        fullName: user.fullName || '',
        email: user.email || '',
      }));
    } catch (error) {
      console.error('Failed to load profile settings', error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        fullName: form.fullName,
        email: form.email,
        currentPassword: form.currentPassword || undefined,
        newPassword: form.newPassword || undefined,
      };

      await api.put('/users/profile', payload);
      showToast('Settings updated successfully');
    } catch (error) {
      showToast(error.response?.data?.message || 'Unable to update settings', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] p-4 md:p-6">
      <div className="mx-auto max-w-5xl">
        <Navbar title="Settings" showSearch={false} />

        <form onSubmit={handleSubmit} className="space-y-6 rounded-[30px] border border-slate-200 bg-white p-6 shadow-sm">
          <section>
            <h3 className="mb-4 text-xl font-semibold text-slate-800">Account</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Name</label>
                <input
                  value={form.fullName}
                  onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Current password</label>
                <input
                  type="password"
                  value={form.currentPassword}
                  onChange={(event) => setForm({ ...form, currentPassword: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">New password</label>
                <input
                  type="password"
                  value={form.newPassword}
                  onChange={(event) => setForm({ ...form, newPassword: event.target.value })}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-400"
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-4 text-xl font-semibold text-slate-800">Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="font-medium text-slate-700">Dark mode</span>
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={() => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))}
                />
              </label>

              <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <span className="font-medium text-slate-700">Notification preference</span>
                <input type="checkbox" checked={form.notifications} onChange={() => setForm({ ...form, notifications: !form.notifications })} />
              </label>
            </div>
          </section>

          <div className="flex justify-end">
            <button type="submit" className="rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200">
              Save settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
