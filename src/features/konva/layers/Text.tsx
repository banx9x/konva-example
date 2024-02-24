import { Text as KonvaText } from 'react-konva';
import type { TextConfig } from '../types';

const Text = (props: TextConfig) => {
  return <KonvaText {...props} />;
};

export default Text;
