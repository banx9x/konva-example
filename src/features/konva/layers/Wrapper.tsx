import Konva from 'konva';
import Image from './Image';
import Text from './Text';
import type { TextConfig, ImageConfig, GroupConfig } from '../types';
import { useCallback } from 'react';
import { Group } from 'react-konva';

const Wrapper = (props: TextConfig | ImageConfig | GroupConfig) => {
  const { type } = props;

  const onDragEnd = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
    const target = e.target;

    const stage = target.getStage()!;
    const tr: Konva.Transformer = stage.findOne('Transformer')!;

    const isSelected = tr.nodes().find((node) => target.id() === node.id());

    if (!isSelected) {
      tr.nodes([target]);
    }
  }, []);

  switch (type) {
    case 'Text':
      return (
        <Text
          {...props}
          onDragEnd={onDragEnd}
        />
      );
    case 'Image':
      return (
        <Image
          {...props}
          onDragEnd={onDragEnd}
        />
      );
    case 'Group':
      return (
        <Group
          {...props}
          onDragEnd={onDragEnd}
        />
      );
    default:
      return null;
  }
};

export default Wrapper;
