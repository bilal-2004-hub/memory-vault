import MemoryImage from './MemoryImage';

const ImageUploader = ({ images = [], onChange }) => {
  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    const uploaded = await Promise.all(
      files.map(
        (file) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve({ file, preview: reader.result });
            reader.onerror = reject;
            reader.readAsDataURL(file);
          })
      )
    );

    onChange([...images, ...uploaded]);
    event.target.value = '';
  };

  const removeImage = (index) => {
    onChange(images.filter((_, itemIndex) => itemIndex !== index));
  };

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-violet-200 bg-violet-50 p-5 text-center text-sm text-violet-700 transition hover:border-violet-400 hover:bg-violet-100">
        <span className="text-2xl">📷</span>
        <span className="mt-2 font-medium">Upload photos</span>
        <input type="file" multiple accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFiles} />
      </label>

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {images.map((image, index) => (
            <div key={`${typeof image === 'string' ? image : image.preview}-${index}`} className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <MemoryImage
                src={typeof image === 'string' ? image : image.preview}
                alt={`preview-${index}`}
                className="h-28 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium text-slate-700"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
