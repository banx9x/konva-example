import {
  PropsWithChildren,
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import Konva from 'konva';
import {
  Stage as KonvaStage,
  Layer as KonvaLayer,
  Transformer as KonvaTransformer,
} from 'react-konva';
import { BsType, BsImage, BsStack } from 'react-icons/bs';
import { IconButton, HStack } from '@chakra-ui/react';
import Wrapper from './layers/Wrapper';
import { GroupConfig } from './types';

export type KonvaWrapperProps = {
  nodes: any[];
  onChange: (node: Konva.NodeConfig) => void;
};

export type KonvaHandle = {
  addLayer: (node: any) => void;
};

const KonvaWrapper = forwardRef<
  KonvaHandle,
  PropsWithChildren<KonvaWrapperProps>
>(({ nodes, onChange = () => {} }, ref) => {
  const stageRef = useRef<Konva.Stage | null>(null);
  const layerRef = useRef<Konva.Layer | null>(null);
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const [layers, changeLayers] = useState(nodes);
  const mapRef = useRef(new Map<string, Konva.Node>());

  useImperativeHandle(ref, () => ({
    addLayer(node) {},
  }));

  // useEffect(() => {
  //   const setStageSize = throttle(() => {
  //     const stage = stageRef.current;
  //     const wrapper = document.querySelector<HTMLDivElement>('.konva-wrapper');

  //     if (!stage || !wrapper) return;

  //     stage.width(wrapper.clientWidth);
  //     stage.height(wrapper.clientHeight);
  //   }, 300);

  //   setStageSize();

  //   window.addEventListener('resize', setStageSize);

  //   return () => {
  //     window.removeEventListener('resize', setStageSize);
  //   };
  // }, [stageRef]);

  useEffect(() => {
    const tr = transformerRef.current;

    if (!tr) return;

    if (tr.isVisible()) tr.moveToTop();
  });

  useEffect(() => {
    const stage = stageRef.current;

    if (!stage) return;

    const map = mapRef.current;

    layers.forEach((layer) => {
      const node = stage.findOne(`#${layer.id}`)!;
      map.set(layer.id, node);
    });
  }, [stageRef, layers]);

  const onClickStage = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = stageRef.current;

      if (!stage) return;

      const tr = stage.findOne<Konva.Transformer>('Transformer');

      if (!tr) return;

      if (e.target === stage) {
        tr.nodes([]);
        return;
      }
      const isSelected = tr.nodes().find((node) => node.id() === e.target.id());

      if (e.evt.shiftKey) {
        if (isSelected) {
          tr.setNodes(tr.nodes().filter((node) => node.id() != e.target.id()));
        } else {
          tr.setNodes(tr.nodes().concat(e.target));
        }
      } else {
        if (isSelected && tr.nodes().length === 1) {
          return;
        } else {
          tr.setNodes([e.target]);
        }
      }
    },
    [stageRef, transformerRef],
  );

  const onClickAddLayer = useCallback(
    (type: string) => {
      const layer = layerRef.current;
      const tr = transformerRef.current;

      if (!layer || !tr) return;

      const defaultConfig: Konva.NodeConfig = {
        id: Date.now().toString(),
        draggable: true,
        x: 0,
        y: 0,
      };

      switch (type) {
        case 'Text': {
          const layer: Konva.TextConfig = {
            ...defaultConfig,
            type: 'Text',
            text: 'Your text',
            fontSize: 30,
            fill: 'black',
          };

          changeLayers([...layers, layer]);
          return;
        }
        case 'Image': {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            if (input.files && input.files.length > 0) {
              const file = input.files[0];
              const url = URL.createObjectURL(file);

              const layer: Omit<Konva.ImageConfig, 'image'> & { src: string } =
                {
                  ...defaultConfig,
                  type: 'Image',
                  src: url,
                };

              changeLayers([...layers, layer]);
            }
          };
          input.click();
          return;
        }
        default: {
        }
      }
    },
    [layers, layerRef, transformerRef],
  );

  const onClickCreateGroup = useCallback(() => {
    const tr = transformerRef.current;

    if (!tr) return;

    const nodes = tr.nodes();

    const nodeMap = new Map();

  }, [transformerRef]);

  return (
    <div className='editor-wrapper relative'>
      <div className='left-50 absolute top-0'>
        <HStack>
          <IconButton
            borderRadius={0}
            size='sm'
            icon={<BsType />}
            aria-label='text'
            onClick={() => onClickAddLayer('Text')}
          />
          <IconButton
            borderRadius={0}
            size='sm'
            icon={<BsImage />}
            aria-label='text'
            onClick={() => onClickAddLayer('Image')}
          />
          <IconButton
            borderRadius={0}
            size='sm'
            icon={<BsStack />}
            aria-label='group'
            onClick={onClickCreateGroup}
          />
        </HStack>
      </div>
      <KonvaStage
        className='konva-wrapper'
        draggable
        ref={stageRef}
        onClick={onClickStage}
        width={600}
        height={600}
      >
        <KonvaLayer ref={layerRef}>
          <KonvaTransformer
            name='Transformer'
            ref={transformerRef}
            anchorFill='#ffffff'
            anchorStrokeWidth={0.5}
            anchorCornerRadius={5}
            anchorStroke='#999999'
            anchorSize={10}
            rotateAnchorOffset={30}
            borderStroke='#999999'
            borderDash={[5, 10]}
          />
          {layers.map((layer) => (
            <Wrapper
              key={layer.id}
              {...layer}
            />
          ))}
        </KonvaLayer>
      </KonvaStage>
    </div>
  );
});

export default memo(KonvaWrapper, (prev, next) => true);
