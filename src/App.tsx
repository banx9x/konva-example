import Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import useImage from 'use-image';
import { ConfigProvider } from 'antd';
import KonvaWrapper, { type KonvaHandle } from './features/konva/KonvaWrapper';
import Header from './features/header/Header';

function App() {
  const konvaRef = useRef<KonvaHandle | null>(null);
  const wrapperRef = useRef();
  const stageRef = useRef();
  const layerRef = useRef();
  const trRef = useRef();
  const rectRef = useRef();
  const [image] = useImage('avatar.jpeg');
  const [isDragging, setDragging] = useState(false);
  const [clipPos, setClipPos] = useState([
    { x: 0, y: 0 },
    { x: 300, y: 0 },
    { x: 300, y: 300 },
    { x: 0, y: 300 },
  ]);

  const [layers, setLayers] = useState([
    {
      id: Date.now().toString(),
      type: 'rect',
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: 'red',
      name: 'My Rect',
    },
  ]);
  const [text, setText] = useState('');
  const [selectedNode, setSelectedNode] = useState();
  const [textBackground, setTextBackground] = useState();

  const addRect = () => {
    setLayers((layers) => [
      ...layers,
      {
        type: 'rect',
        x: Math.random() * stageRef.current.width(),
        y: Math.random() * stageRef.current.height(),
        width: (Math.random() * stageRef.current.width()) / 5,
        height: (Math.random() * stageRef.current.height()) / 5,
        fill: 'red',
      },
    ]);
  };

  const addText = () => {
    setLayers((layers) => [
      ...layers,
      {
        type: 'text',
        x: Math.random() * stageRef.current.width(),
        y: Math.random() * stageRef.current.height(),
        text: text,
        fontSize: 60,
        fontStyle: 'bold',
        name: Date.now().toString(),
      },
    ]);
  };

  const handleChange = (e) => {
    console.log(
      selectedNode.width(),
      selectedNode.height(),
      selectedNode.fillPatternImage().width,
      selectedNode.fillPatternImage().height,
      e.target.value,
      selectedNode.fillPatternImage().width * e.target.value,
      selectedNode.fillPatternImage().height * e.target.value,
    );

    setLayers((layers) =>
      layers.map((layer) => {
        const pos = selectedNode.getAbsolutePosition();

        console.log(
          layer.name,
          selectedNode.name(),
          e.target.name,
          e.target.name == 'fillPatternScale',
        );

        if (layer.name === selectedNode.name()) {
          if (e.target.name == 'fillPatternScale') {
            setTextBackground({
              ...textBackground,
              x:
                pos.x -
                (selectedNode.fillPatternImage().width * e.target.value -
                  selectedNode.width()) /
                  2,
              y:
                pos.y -
                (selectedNode.fillPatternImage().height * e.target.value -
                  selectedNode.height()) /
                  2,
              scale: {
                x: +e.target.value,
                y: +e.target.value,
              },
            });

            return {
              ...layer,
              fillPatternScaleX: +e.target.value,
              fillPatternScaleY: +e.target.value,
              // fillPatternOffsetX:
              //   (selectedNode.fillPatternImage().width * e.target.value -
              //     selectedNode.width()) /
              //   2,
              // fillPatternOffsetY:
              //   (selectedNode.fillPatternImage().height * e.target.value -
              //     selectedNode.height()) /
              //   2,
              // fillPatternOffsetX: (1 - e.target.value) * 100,
              // fillPatternOffsetY: (1 - e.target.value) * 100,
              // fillPatternX: (1 - e.target.value) * 100,
              // fillPatternY: (1 - e.target.value) * 100,
              fillPatternX:
                (selectedNode.fillPatternImage().width * e.target.value +
                  selectedNode.width()) /
                2,
              fillPatternY:
                (selectedNode.fillPatternImage().height * e.target.value +
                  selectedNode.height()) /
                2,
            };
          } else {
            const isX = e.target.name === 'fillPatternOffsetX';

            setTextBackground({
              ...textBackground,
              [isX ? 'x' : 'y']: isX
                ? pos.x - e.target.value
                : pos.y - e.target.value,
            });

            return {
              ...layer,
              [e.target.name]: +e.target.value,
            };
          }
        } else {
          return layer;
        }
      }),
    );
  };

  const handleTransform = (e) => {
    var x, y, newHypotenuse;
    var tr = trRef.current;
    var anchorNode = tr.findOne('.' + tr.getActiveAnchor());
    var stage = anchorNode.getStage();

    stage.setPointersPositions(e);

    const pp = stage.getPointerPosition();
    let newNodePos = {
      x: pp.x - tr._anchorDragOffset.x,
      y: pp.y - tr._anchorDragOffset.y,
    };
    const oldAbs = anchorNode.getAbsolutePosition();

    if (tr.anchorDragBoundFunc()) {
      newNodePos = tr.anchorDragBoundFunc()(oldAbs, newNodePos, e);
    }
    anchorNode.setAbsolutePosition(newNodePos);
    const newAbs = anchorNode.getAbsolutePosition();

    // console.log(oldAbs, newNodePos, newAbs);

    if (oldAbs.x === newAbs.x && oldAbs.y === newAbs.y) {
      return;
    }

    // rotater is working very differently, so do it first
    if (tr._movingAnchorName === 'rotater') {
      var attrs = tr._getNodeRect();
      x = anchorNode.x() - attrs.width / 2;
      y = -anchorNode.y() + attrs.height / 2;

      // hor angle is changed?
      let delta = Math.atan2(-y, x) + Math.PI / 2;

      if (attrs.height < 0) {
        delta -= Math.PI;
      }

      var oldRotation = Konva.getAngle(tr.rotation());
      const newRotation = oldRotation + delta;

      const tol = Konva.getAngle(tr.rotationSnapTolerance());
      const snappedRot = getSnap(tr.rotationSnaps(), newRotation, tol);

      const diff = snappedRot - attrs.rotation;

      const shape = rotateAroundCenter(attrs, diff);
      tr._fitNodesInto(shape, e);
      return;
    }

    var shiftBehavior = tr.shiftBehavior();

    var keepProportion;
    if (shiftBehavior === 'inverted') {
      keepProportion = tr.keepRatio() && !e.shiftKey;
    } else if (shiftBehavior === 'none') {
      keepProportion = tr.keepRatio();
    } else {
      keepProportion = tr.keepRatio() || e.shiftKey;
    }

    var centeredScaling = tr.centeredScaling() || e.altKey;

    if (tr._movingAnchorName === 'top-left') {
      if (keepProportion) {
        var comparePoint = centeredScaling
          ? {
              x: tr.width() / 2,
              y: tr.height() / 2,
            }
          : {
              x: tr.findOne('.bottom-right').x(),
              y: tr.findOne('.bottom-right').y(),
            };
        newHypotenuse = Math.sqrt(
          Math.pow(comparePoint.x - anchorNode.x(), 2) +
            Math.pow(comparePoint.y - anchorNode.y(), 2),
        );

        var reverseX = tr.findOne('.top-left').x() > comparePoint.x ? -1 : 1;

        var reverseY = tr.findOne('.top-left').y() > comparePoint.y ? -1 : 1;

        x = newHypotenuse * tr.cos * reverseX;
        y = newHypotenuse * tr.sin * reverseY;

        tr.findOne('.top-left').x(comparePoint.x - x);
        tr.findOne('.top-left').y(comparePoint.y - y);
      }
    } else if (tr._movingAnchorName === 'top-center') {
      tr.findOne('.top-left').y(anchorNode.y());
    } else if (tr._movingAnchorName === 'top-right') {
      if (keepProportion) {
        var comparePoint = centeredScaling
          ? {
              x: tr.width() / 2,
              y: tr.height() / 2,
            }
          : {
              x: tr.findOne('.bottom-left').x(),
              y: tr.findOne('.bottom-left').y(),
            };

        newHypotenuse = Math.sqrt(
          Math.pow(anchorNode.x() - comparePoint.x, 2) +
            Math.pow(comparePoint.y - anchorNode.y(), 2),
        );

        var reverseX = tr.findOne('.top-right').x() < comparePoint.x ? -1 : 1;

        var reverseY = tr.findOne('.top-right').y() > comparePoint.y ? -1 : 1;

        x = newHypotenuse * tr.cos * reverseX;
        y = newHypotenuse * tr.sin * reverseY;

        tr.findOne('.top-right').x(comparePoint.x + x);
        tr.findOne('.top-right').y(comparePoint.y - y);
      }
      var pos = anchorNode.position();
      tr.findOne('.top-left').y(pos.y);
      tr.findOne('.bottom-right').x(pos.x);
    } else if (tr._movingAnchorName === 'middle-left') {
      tr.findOne('.top-left').x(anchorNode.x());
    } else if (tr._movingAnchorName === 'middle-right') {
      tr.findOne('.bottom-right').x(anchorNode.x());
    } else if (tr._movingAnchorName === 'bottom-left') {
      if (keepProportion) {
        var comparePoint = centeredScaling
          ? {
              x: tr.width() / 2,
              y: tr.height() / 2,
            }
          : {
              x: tr.findOne('.top-right').x(),
              y: tr.findOne('.top-right').y(),
            };

        newHypotenuse = Math.sqrt(
          Math.pow(comparePoint.x - anchorNode.x(), 2) +
            Math.pow(anchorNode.y() - comparePoint.y, 2),
        );

        var reverseX = comparePoint.x < anchorNode.x() ? -1 : 1;

        var reverseY = anchorNode.y() < comparePoint.y ? -1 : 1;

        x = newHypotenuse * tr.cos * reverseX;
        y = newHypotenuse * tr.sin * reverseY;

        anchorNode.x(comparePoint.x - x);
        anchorNode.y(comparePoint.y + y);
      }

      pos = anchorNode.position();

      tr.findOne('.top-left').x(pos.x);
      tr.findOne('.bottom-right').y(pos.y);
    } else if (tr._movingAnchorName === 'bottom-center') {
      tr.findOne('.bottom-right').y(anchorNode.y());
    } else if (tr._movingAnchorName === 'bottom-right') {
      if (keepProportion) {
        var comparePoint = centeredScaling
          ? {
              x: tr.width() / 2,
              y: tr.height() / 2,
            }
          : {
              x: tr.findOne('.top-left').x(),
              y: tr.findOne('.top-left').y(),
            };

        newHypotenuse = Math.sqrt(
          Math.pow(anchorNode.x() - comparePoint.x, 2) +
            Math.pow(anchorNode.y() - comparePoint.y, 2),
        );

        var reverseX =
          tr.findOne('.bottom-right').x() < comparePoint.x ? -1 : 1;

        var reverseY =
          tr.findOne('.bottom-right').y() < comparePoint.y ? -1 : 1;

        x = newHypotenuse * tr.cos * reverseX;
        y = newHypotenuse * tr.sin * reverseY;

        tr.findOne('.bottom-right').x(comparePoint.x + x);
        tr.findOne('.bottom-right').y(comparePoint.y + y);
      }
    } else {
      console.error(
        new Error(
          'Wrong position argument of selection resizer: ' +
            tr._movingAnchorName,
        ),
      );
    }

    var centeredScaling = tr.centeredScaling() || e.altKey;
    if (centeredScaling) {
      var topLeft = tr.findOne('.top-left');
      var bottomRight = tr.findOne('.bottom-right');
      var topOffsetX = topLeft.x();
      var topOffsetY = topLeft.y();

      var bottomOffsetX = tr.getWidth() - bottomRight.x();
      var bottomOffsetY = tr.getHeight() - bottomRight.y();

      bottomRight.move({
        x: -topOffsetX,
        y: -topOffsetY,
      });

      topLeft.move({
        x: bottomOffsetX,
        y: bottomOffsetY,
      });
    }

    var absPos = tr.findOne('.top-left').getAbsolutePosition();

    x = absPos.x;
    y = absPos.y;

    var width = tr.findOne('.bottom-right').x() - tr.findOne('.top-left').x();

    var height = tr.findOne('.bottom-right').y() - tr.findOne('.top-left').y();

    tr._fitNodesInto(
      {
        x: x,
        y: y,
        width: width,
        height: height,
        rotation: Konva.getAngle(tr.rotation()),
      },
      e,
    );
  };

  const handleClipPosChange = (node) => {
    let corners = [];
    let size = node.size();

    // Now get the 4 corner points
    corners[0] = { x: -2, y: -2 }; // top left
    corners[1] = { x: size.width + 4, y: -2 }; // top right
    corners[2] = { x: size.width + 4, y: size.height + 4 }; // bottom right
    corners[3] = { x: -2, y: size.height + 4 }; // bottom left

    console.log(corners);

    // And rotate the corners using the same transform as the rect.
    for (let i = 0; i < 4; i++) {
      // Here be the magic
      corners[i] = node.getAbsoluteTransform().point(corners[i]); // top left
    }

    setClipPos(corners);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 0,
        },
      }}
    >
      <div className='app-layout'>
        <Header />
        <div className='layers'>
          <div>
            <input
              placeholder='Text'
              type='text'
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div>
            <button onClick={addText}>Add Text</button>
            <button onClick={addRect}>Add Rect</button>
          </div>
          {selectedNode && selectedNode.attrs.type === 'text' && (
            <div>
              <label htmlFor=''>Pattern Image</label>
              <input
                type='file'
                name=''
                id=''
                onChange={(e) => {
                  const img = new Image();

                  img.onload = () => {
                    setLayers((layers) =>
                      layers.map((layer) =>
                        layer.name === selectedNode.name()
                          ? {
                              ...layer,
                              fillPriority: 'pattern',
                              fillPatternImage: img,
                              // fillPatternX: 0,
                              // fillPatternY: 0,
                              fillPatternScaleX: 1,
                              fillPatternScaleY: 1,
                              // fillPatternOffsetX:
                              //   (img.width - selectedNode.width()) / 2,
                              // fillPatternOffsetY:
                              //   (img.height - selectedNode.height()) / 2,
                              fillPatternOffsetX: 0,
                              fillPatternOffsetY: 0,
                              fillPatternX:
                                (img.width + selectedNode.width()) / 2,
                              fillPatternY:
                                (img.height + selectedNode.height()) / 2,
                            }
                          : layer,
                      ),
                    );

                    const pos = selectedNode.getAbsolutePosition();

                    setTextBackground({
                      image: img,
                      x: pos.x - (img.width - selectedNode.width()) / 2,
                      y: pos.y - (img.height - selectedNode.height()) / 2,
                      // x: pos.x,
                      // y: pos.y,
                      scale: {
                        x: 1,
                        y: 1,
                      },
                      width: img.width,
                      height: img.height,
                    });
                  };

                  img.src = URL.createObjectURL(e.target.files[0]);
                }}
              />
              <label htmlFor=''>Fill Pattern Offset X</label>
              <input
                type='number'
                name='fillPatternOffsetX'
                value={selectedNode.attrs.fillPatternOffsetX}
                onChange={handleChange}
              />
              <label htmlFor=''>Fill Pattern Offset Y</label>
              <input
                type='number'
                name='fillPatternOffsetY'
                value={selectedNode.attrs.fillPatternOffsetY}
                onChange={handleChange}
              />
              <label htmlFor=''>Fill Pattern Scale</label>
              <input
                type='number'
                name='fillPatternScale'
                value={selectedNode.attrs.fillPatternScaleX}
                onChange={handleChange}
                step={0.1}
              />
              <label>Fill Pattern X</label>
              <input
                type='number'
                name='fillPatternX'
                value={selectedNode.attrs.fillPatternX}
                onChange={handleChange}
              />
              <label>Fill Pattern Y</label>
              <input
                type='number'
                name='fillPatternY'
                value={selectedNode.attrs.fillPatternY}
                onChange={handleChange}
              />
            </div>
          )}
        </div>

        <KonvaWrapper
          ref={konvaRef}
          nodes={[]}
          onChange={console.log}
        />

        <div className='layer-settings'></div>
      </div>
    </ConfigProvider>
  );
}

export default App;
