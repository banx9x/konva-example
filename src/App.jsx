import { Layer, Stage, Circle, Rect, Text, Transformer } from "react-konva";
import "./App.css";
import { useEffect, useRef, useState } from "react";

function App() {
  const stageRef = useRef();
  const layerRef = useRef();
  const trRef = useRef();
  const rectRef = useRef();

  const [layers, setLayers] = useState([
    {
      id: 1,
      type: "rect",
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: "red",
    },
  ]);
  const [image, setImage] = useState();
  const [text, setText] = useState("");

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
        width: 120,
        height: 30,
        text: text,
        fillPatternImage: image,
        fillPatternX: 0,
        fillPatternY: 0,
        fillPatternScale: { x: 1, y: 1 },
        fillPatternOffset: { x: 0, y: 0 },
      },
    ]);
  };

  return (
    <div>
      <div>
        <input
          type="file"
          name=""
          id=""
          onChange={(e) => {
            const img = new Image(120, 30);
            img.style.objectFit = "cover";
            img.style.objectPosition = "center";

            img.onload = () => {
              const { _context: ctx } = layerRef.current.getContext();
              ctx.drawImage(img, 0, 0, 120, 120);
              const image = ctx.getImageData(0, 45, 120, 30);

              setImage(image);

              // const pattern = ctx.createPattern(img, "no-repeat");
              // ctx.fillStyle = pattern;
              // ctx.fillText(text, 0, 0, 120, 30);
            };

            img.src = URL.createObjectURL(e.target.files[0]);
            document.body.append(img);
          }}
        />
        <input type="text" onChange={(e) => setText(e.target.value)} />
        <button onClick={addText}>Add Text</button>
        <button onClick={addRect}>Add Rect</button>
      </div>

      <Stage ref={stageRef} width={500} height={500}>
        <Layer ref={layerRef}>
          {layers.map((layer) => {
            switch (layer.type) {
              case "circle":
                return <Circle key={layer.id} {...layer} />;
              case "rect":
                return <Rect key={layer.id} {...layer} ref={rectRef} />;
              case "text":
                return <Text key={layer.id} {...layer} />;
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
