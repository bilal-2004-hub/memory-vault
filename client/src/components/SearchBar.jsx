const SearchBar = ({ value, onChange, placeholder = 'Search memories...' }) => (
  <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
    />
  </div>
);

export default SearchBar;
