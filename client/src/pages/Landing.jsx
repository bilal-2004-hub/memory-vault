import { Link } from 'react-router-dom';

const features = [
  {
    icon: '📝',
    title: 'Capture memories',
    text: 'Save the moments that matter with stories, photos, moods, and meaningful context.',
  },
  {
    icon: '🗂️',
    title: 'Organize stories',
    text: 'Tag, filter, and revisit memory collections by mood, place, and year.',
  },
  {
    icon: '✨',
    title: 'Relive moments',
    text: 'Turn everyday life into a beautiful timeline and a personalized “On This Day” reflection.',
  },
];

const Landing = () => (
  <div className="min-h-screen bg-[#F8F7F4] text-slate-800">
    <header className="mx-auto max-w-6xl px-6 py-6">
      <nav className="flex items-center justify-between rounded-full border border-violet-100 bg-white/80 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-violet-600 text-lg text-white">🗄️</div>
          <p className="text-lg font-semibold">Memory Vault</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
            Login
          </Link>
          <Link to="/signup" className="rounded-full bg-violet-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-violet-200">
            Start Your Vault
          </Link>
        </div>
      </nav>
    </header>

    <main className="mx-auto max-w-6xl px-6 pb-16">
      <section className="grid items-center gap-10 py-10 md:grid-cols-[1.2fr_0.8fr] md:py-16">
        <div>
          <p className="mb-3 inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700">
            Your memories deserve a place.
          </p>
          <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
            Capture moments.
            <span className="block text-violet-600">Remember stories.</span>
            Relive them anytime.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-slate-600">
            Build a personal journal of milestones, everyday moments, and meaningful memories in one beautiful place.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link to="/signup" className="rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-500">
              Start Your Vault
            </Link>
            <Link to="/login" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700">
              Login
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -left-8 top-12 h-40 w-40 rounded-full bg-violet-200 blur-3xl" />
          <div className="absolute -right-4 bottom-8 h-36 w-36 rounded-full bg-amber-200 blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white p-4 shadow-xl shadow-violet-100">
            <img
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80"
              alt="Memory scrapbook"
              className="h-[440px] w-full rounded-[24px] object-cover"
            />
            <div className="absolute bottom-8 left-8 rounded-2xl bg-white/90 p-4 shadow-lg backdrop-blur-sm">
              <p className="text-xs uppercase tracking-[0.2em] text-violet-600">On This Day</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-800">"My First Internship Day"</h3>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 py-12 md:grid-cols-3">
        {features.map((feature) => (
          <div key={feature.title} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-2xl">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-slate-800">{feature.title}</h3>
            <p className="mt-3 text-slate-600">{feature.text}</p>
          </div>
        ))}
      </section>
    </main>

    <footer className="border-t border-slate-200 bg-white/70">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 text-sm text-slate-500">
        <p>© 2026 Memory Vault</p>
        <p>Made for moments that matter.</p>
      </div>
    </footer>
  </div>
);

export default Landing;
