import {
  Layer,
  Stage,
  Circle,
  Rect,
  Text,
  Transformer,
  Image as KonvaImage,
} from "react-konva";
import "./App.css";
import { useEffect, useRef, useState } from "react";

function App() {
  const stageRef = useRef();
  const layerRef = useRef();
  const trRef = useRef();
  const rectRef = useRef();

  const [layers, setLayers] = useState([
    {
      id: Date.now().toString(),
      type: "rect",
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: "red",
    },
  ]);
  const [text, setText] = useState("");
  const [selectedNode, setSelectedNode] = useState();
  const [textBackground, setTextBackground] = useState();

  useEffect(() => {
    if (rectRef.current && trRef.current) {
      trRef.current.nodes([rectRef.current]);
    }
  }, [rectRef, trRef]);

  const addRect = () => {
    setLayers((layers) => [
      ...layers,
      {
        type: "rect",
        x: Math.random() * stageRef.current.width(),
        y: Math.random() * stageRef.current.height(),
        width: (Math.random() * stageRef.current.width()) / 5,
        height: (Math.random() * stageRef.current.height()) / 5,
        fill: "red",
      },
    ]);
  };

  const addText = () => {
    setLayers((layers) => [
      ...layers,
      {
        type: "text",
        x: Math.random() * stageRef.current.width(),
        y: Math.random() * stageRef.current.height(),
        text: text,
        fontSize: 60,
        fontStyle: "bold",
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
      selectedNode.fillPatternImage().height * e.target.value
    );

    setLayers((layers) =>
      layers.map((layer) => {
        const pos = selectedNode.getAbsolutePosition();

        console.log(
          layer.name,
          selectedNode.name(),
          e.target.name,
          e.target.name == "fillPatternScale"
        );

        if (layer.name === selectedNode.name()) {
          if (e.target.name == "fillPatternScale") {
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
            const isX = e.target.name === "fillPatternOffsetX";

            setTextBackground({
              ...textBackground,
              [isX ? "x" : "y"]: isX
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
      })
    );
  };

  // console.log(
  //   selectedNode,
  //   selectedNode.width(),
  //   selectedNode.height(),
  //   selectedNode.fillPatternOffsetX(),
  //   selectedNode.fillPatternOffsetY()
  // );

  return (
    <div>
      <div>
        <div>
          <input
            placeholder="Text"
            type="text"
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div>
          <button onClick={addText}>Add Text</button>
          <button onClick={addRect}>Add Rect</button>
        </div>
        {selectedNode && selectedNode.attrs.type === "text" && (
          <div>
            <label htmlFor="">Pattern Image</label>
            <input
              type="file"
              name=""
              id=""
              onChange={(e) => {
                const img = new Image();

                img.onload = () => {
                  setLayers((layers) =>
                    layers.map((layer) =>
                      layer.name === selectedNode.name()
                        ? {
                            ...layer,
                            fillPriority: "pattern",
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
                        : layer
                    )
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
            <label htmlFor="">Fill Pattern Offset X</label>
            <input
              type="number"
              name="fillPatternOffsetX"
              value={selectedNode.attrs.fillPatternOffsetX}
              onChange={handleChange}
            />
            <label htmlFor="">Fill Pattern Offset Y</label>
            <input
              type="number"
              name="fillPatternOffsetY"
              value={selectedNode.attrs.fillPatternOffsetY}
              onChange={handleChange}
            />
            <label htmlFor="">Fill Pattern Scale</label>
            <input
              type="number"
              name="fillPatternScale"
              value={selectedNode.attrs.fillPatternScaleX}
              onChange={handleChange}
              step={0.1}
            />
            <label>Fill Pattern X</label>
            <input
              type="number"
              name="fillPatternX"
              value={selectedNode.attrs.fillPatternX}
              onChange={handleChange}
            />
            <label>Fill Pattern Y</label>
            <input
              type="number"
              name="fillPatternY"
              value={selectedNode.attrs.fillPatternY}
              onChange={handleChange}
            />
          </div>
        )}
      </div>

      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={500}
        style={{ backgroundColor: "green" }}
        onClick={(e) => {
          const stage = stageRef.current;
          const tr = trRef.current;

          if (e.target === stage) {
            tr.nodes([]);
            return;
          }

          setSelectedNode(e.target);

          tr.nodes([e.target]);
        }}
      >
        <Layer ref={layerRef}>
          {selectedNode && selectedNode.fillPatternImage && (
            <KonvaImage {...textBackground} />
          )}
          {layers.map((layer) => {
            switch (layer.type) {
              case "circle":
                return <Circle key={layer.id} {...layer} />;
              case "rect":
                return (
                  <Rect key={layer.id} {...layer} ref={rectRef} draggable />
                );
              case "text":
                return <Text draggable key={layer.id} {...layer} />;
              default:
                return null;
            }
          })}
          <Transformer
            ref={trRef}
            dragBoundFunc={(pos) => {}}
            anchorDragBoundFunc={(oldPos, newPos, e) => {
              const tr = trRef.current;

              if (tr.getActiveAnchor() === "rotater") {
                return newPos;
              }

              console.log(oldPos, newPos, e);
              return newPos;
            }}
            boundBoxFunc={(oldBox, newBox) => {
              return newBox;
            }}
          />
        </Layer>
      </Stage>
    </div>
  );
}

export default App;
