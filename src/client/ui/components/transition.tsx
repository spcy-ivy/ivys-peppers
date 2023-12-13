import {
  useAsyncEffect,
  useEventListener,
  useViewport,
} from "@rbxts/pretty-react-hooks";
import Roact, { createContext, useContext, useState } from "@rbxts/roact";
import { Events } from "client/network";
import { useMotion } from "../hooks/use-motion";

// very ugly code structure

// in pixels
const tileSize = 75;

interface TransitionContext {
  visible: boolean;
}

interface TileProps {
  x: number;
  y: number;
}

interface TileFragmentProps {
  columns: number;
  rows: number;
}

export const TransitionContext = createContext<TransitionContext>({
  visible: false,
});

function Tile({ x = 0, y = 0 }: TileProps) {
  const transitionContext = useContext(TransitionContext);
  const visible = transitionContext.visible;

  const [size, sizeMotion] = useMotion(0);

  useAsyncEffect(async () => {
    await Promise.delay(0.05 * (x + y));
    sizeMotion.linear(visible ? 1 : 0, { speed: 5 });
  }, [visible]);

  return (
    <frame
      key="tile"
      Position={UDim2.fromOffset(
        tileSize * x + tileSize / 2,
        tileSize * y + tileSize / 2,
      )}
      // named it alpha because it sounds cool lol
      Size={size.map((alpha) =>
        UDim2.fromOffset(tileSize * alpha, tileSize * alpha),
      )}
      BackgroundColor3={Color3.fromRGB(0, 0, 0)}
      AnchorPoint={Vector2.one.mul(0.5)}
      BorderSizePixel={0}
      // 999 otherwise it breaks immersion
      ZIndex={999}
    />
  );
}

function TileFragment({ columns = 50, rows = 25 }: TileFragmentProps) {
  const tiles: Roact.Element[] = [];

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      tiles.push(<Tile key={`tile_x${x}_y${y}`} x={x} y={y} />);
    }
  }

  return <>{tiles}</>;
}

export function Tiles() {
  const viewport = useViewport();
  const columns = viewport.map((resolution) => resolution.X / tileSize);
  const rows = viewport.map((resolution) => resolution.Y / tileSize);

  return (
    <TileFragment
      key="tilefragment"
      columns={columns.getValue()}
      rows={rows.getValue()}
    />
  );
}

export function Transition() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  useEventListener(Events.transition, () => {
    setEnabled(true);
    setVisible(true);
  });

  useEventListener(Events.cancelTransition, () => {
    setVisible(false);
    // wait for fade out animation
    task.wait(1);
    setEnabled(false);
  });

  return (
    <TransitionContext.Provider value={{ visible: visible }}>
      {enabled && (
        <screengui key="transition" IgnoreGuiInset={true} ResetOnSpawn={false}>
          <Tiles key="tiles" />
        </screengui>
      )}
    </TransitionContext.Provider>
  );
}