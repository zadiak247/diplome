import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const OptimizedImage = ({ src, alt, className, width, height, lazy = true }) => {
  return (
    <LazyLoadImage
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      loading={lazy ? 'lazy' : 'eager'}
    />
  );
};

export default OptimizedImage;