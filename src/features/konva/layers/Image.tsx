import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import type { ImageConfig } from '../types';

const Image = ({ type, src, ...props }: ImageConfig) => {
  const [image] = useImage(src);

  return (
    <KonvaImage
      {...props}
      image={image}
    />
  );
};

export default Image;
