import { useEffect, useState } from 'react';
import api from '../services/api';

const MemoryImage = ({ src, ...imageProps }) => {
  const isLocalImage = typeof src === 'string' && src.startsWith('/memories/images/');
  const [loadedImage, setLoadedImage] = useState({ source: '', objectUrl: '' });

  useEffect(() => {
    if (!isLocalImage) return undefined;

    let objectUrl;
    let cancelled = false;

    api.get(src, { responseType: 'blob' }).then(({ data }) => {
      objectUrl = URL.createObjectURL(data);
      if (cancelled) {
        URL.revokeObjectURL(objectUrl);
      } else {
        setLoadedImage({ source: src, objectUrl });
      }
    }).catch(() => {});

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src, isLocalImage]);

  const imageSource = isLocalImage
    ? loadedImage.source === src ? loadedImage.objectUrl : undefined
    : src;

  return <img src={imageSource} {...imageProps} />;
};

export default MemoryImage;