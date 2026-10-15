const StatsCard = ({ label, value, accent = 'violet' }) => {
  const accentMap = {
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-200',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200',
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-200',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200',
  };

  const cardMap = {
    violet: 'border-violet-200 bg-violet-100/50 dark:border-violet-900/50 dark:bg-violet-950/25',
    rose: 'border-rose-200 bg-rose-100/50 dark:border-rose-900/50 dark:bg-rose-950/25',
    teal: 'border-teal-200 bg-teal-100/50 dark:border-teal-900/50 dark:bg-teal-950/25',
    amber: 'border-amber-200 bg-amber-100/50 dark:border-amber-900/50 dark:bg-amber-950/25',
  };

  const textMap = {
    violet: 'text-violet-700 dark:text-violet-200',
    rose: 'text-rose-700 dark:text-rose-200',
    teal: 'text-teal-700 dark:text-teal-200',
    amber: 'text-amber-700 dark:text-amber-200',
  };

  return (
    <div className={`rounded-[24px] border p-5 shadow-sm ${cardMap[accent]}`}>
      <div className={`mb-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${accentMap[accent]}`}>
        {label}
      </div>
      <p className={`text-3xl font-semibold ${textMap[accent]}`}>{value}</p>
    </div>
  );
};

export default StatsCard;
