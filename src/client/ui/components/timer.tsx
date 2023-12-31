import Roact, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "@rbxts/roact";
import { useMotion } from "../hooks/use-motion";
import { useEventListener, useInterval } from "@rbxts/pretty-react-hooks";
import { springs } from "../utils/springs";
import { Events } from "client/network";
import colorscheme from "shared/colorscheme";

interface DisplayProps {
  // because its a cool name and I cant name stuff "time"
  epoch: number;
  visible: boolean;
}

export function Display({ epoch, visible }: DisplayProps) {
  const [scale, scaleMotion] = useMotion(0);
  const [compressed, setCompressed] = useState(true);
  const [opacity, opacityMotion] = useMotion(0);

  useEffect(() => {
    opacityMotion.spring(epoch === 0 ? 1 : 0, springs.responsive)
    setCompressed(epoch % 2 === 0);
    scaleMotion.spring(compressed ? -0.02 : 0, springs.responsive);
  }, [epoch])

  useEffect(() => {
    opacityMotion.spring(visible ? 0 : 1, springs.responsive)
  }, [visible])

  return (
    <imagelabel
      key="timer"
      Image={"rbxgameasset://Images/fire"}
      AnchorPoint={Vector2.one.mul(0.5)}
      Position={UDim2.fromScale(0.06, 0.9)}
      Size={scale.map((alpha) =>
        UDim2.fromScale(0.2 + alpha, 0.2 + alpha),
      )}
      BackgroundTransparency={1}
      ImageTransparency={opacity}
    >
      <textlabel
        key="label"
        FontFace={
          new Font(
            "rbxasset://fonts/families/FredokaOne.json",
            Enum.FontWeight.SemiBold,
            Enum.FontStyle.Italic,
          )
        }
        AnchorPoint={Vector2.one.mul(0.5)}
        Position={UDim2.fromScale(0.45, 0.65)}
        Size={UDim2.fromScale(0.4, 0.4)}
        TextScaled={true}
        BackgroundTransparency={1}
        Text={tostring(epoch)}
        TextColor3={colorscheme.red}
        TextTransparency={opacity}
      />
      <uiaspectratioconstraint key="aspectratio" />
    </imagelabel>
  );
}

export function useCountdown(initialValue = 0) {
  const [value, setValue] = useState(initialValue);
  const running = useRef(false);

  const start = useCallback(() => (running.current = true), []);
  const stop = useCallback(() => (running.current = false), []);
  const setTime = useCallback((value: number) => setValue(value), []);

  useInterval(() => {
    setValue(value - 1);
  }, running.current ? 1 : undefined)

  useEffect(() => {
    // set to 1 because it runs the interval ONE LAST TIME before it stops lol
    if (value === 1) {
      stop();
    }
  }, [value])

  return { value, start, stop, setTime }
}

export function Timer() {
  const countdown = useCountdown();
  const [visible, setVisible] = useState(false);

  // value used because we have a lack of a better name lol
  useEventListener(Events.startTimer, (value: number) => {
    setVisible(true);
    countdown.setTime(value);
    countdown.start();
  });

  useEventListener(Events.stopTimer, () => {
    setVisible(false);
    countdown.stop()
  });

  return (
    <screengui key="timer" IgnoreGuiInset={true} ResetOnSpawn={false}>
      <Display epoch={countdown.value} visible={visible} />
    </screengui>
  );
}