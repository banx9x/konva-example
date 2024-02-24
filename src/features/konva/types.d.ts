import { GroupConfig } from 'konva/lib/Group';
import { RectConfig } from 'konva/lib/shapes/Rect';
import { TextConfig } from 'konva/lib/shapes/Text';
import { ComponentProps, Dispatch } from 'react';
import { Text, Image, Group } from 'react-konva';

type KonvaContextObject = {
  state: KonvaState;
  dispatch: Dispatch<KonvaAction>;
};

type KonvaState = {};

type KonvaAction = {};

type TextConfig = ComponentProps<typeof Text> & {
  type: 'Text';
};

type ImageConfig = Omit<ComponentProps<typeof Image>, 'image'> & {
  type: 'Image';
  src: string;
};

type Children = TextConfig | ImageConfig | GroupConfig;

type GroupConfig = ComponentProps<typeof Group> & {
  type: 'Group';
  children: Children[];
};
