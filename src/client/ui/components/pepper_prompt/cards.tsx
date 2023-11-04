import Roact, { useEffect, useState, Binding } from "@rbxts/roact";
import { useMotion } from "client/ui/hooks/use-motion";
import colorscheme from "client/ui/utils/colorscheme";
import { springs } from "client/ui/utils/springs";
import { PepperOption } from "types/interfaces/Peppers";

interface CardProps {
  info?: PepperOption;
  angle_deg?: number;
  priority?: number;
  active?: boolean;
  transparency?: Binding<number>;
  pressedCallback?: (option: PepperOption) => void;
}

interface CardsProps {
  enabled?: boolean;
  cards?: PepperOption[];
  pressedCallback?: (option: PepperOption) => void;
}

function Card({
  info = {
    icon: "rbxgameasset://Images/pepper",
    name: "none",
    description: "you didnt set anything",
  },
  angle_deg = 0,
  priority = 0,
  active = false,
  transparency,
  pressedCallback = () => print("no callback yet!"),
}: CardProps) {
  // moving another cycle cuz we need the cos to start at 0
  const xposition = 0.5 + math.cos(math.rad(angle_deg + 90)) * 0.7;
  // using abs to keep the sign the same
  const yposition = 0.8 + math.abs(math.sin(math.rad(angle_deg)) * 0.2);
  const [hover, setHover] = useState(false);
  const [press, setPress] = useState(false);
  const [position, positionMotion] = useMotion(0);
  const [size, sizeMotion] = useMotion(0);

  useEffect(() => {
    if (press) {
      sizeMotion.impulse(0.01);
    } else if (hover) {
      positionMotion.spring(1, springs.responsive);
    } else {
      sizeMotion.spring(0, springs.bubbly);
      positionMotion.spring(0, springs.responsive);
    }
  }, [press, hover]);

  return (
    <imagebutton
      AnchorPoint={new Vector2(0.5, 1)}
      AutoButtonColor={false}
      Image={"rbxgameasset://Images/card_background"}
      Active={active}
      BackgroundTransparency={transparency}
      ImageTransparency={transparency}
      Position={position.map((y) => UDim2.fromScale(xposition, yposition + y * -0.1))}
      Size={size.map((alpha) => UDim2.fromScale(0.5 - 0.05 * alpha, 0.5 - 0.05 * alpha))}
      Rotation={-angle_deg}
      ZIndex={hover ? 10 : priority}
      Event={{
        MouseEnter: () => setHover(true),
        MouseLeave: () => {
          setHover(false);
          setPress(false);
        },
        MouseButton1Down: () => {
          setPress(true);
          pressedCallback(info);
        },
        MouseButton1Up: () => setPress(false),
      }}
    >
      <uiaspectratioconstraint key="aspectratio" AspectRatio={0.7} />
      <uicorner key="corner" CornerRadius={new UDim(0, 15)} />
      <imagelabel
        key="icon"
        AnchorPoint={Vector2.xAxis.mul(0.5)}
        Position={UDim2.fromScale(0.5, 0.075)}
        Size={UDim2.fromScale(0.8, 0.8)}
        BorderSizePixel={0}
        Image={info.icon}
        BackgroundColor3={colorscheme.base01}
        BackgroundTransparency={transparency}
        ImageTransparency={transparency}
        ZIndex={hover ? 10 : priority}
      >
        <uiaspectratioconstraint key="aspectratio" />
      </imagelabel>
      <textlabel
        key="title"
        AnchorPoint={Vector2.xAxis.mul(0.5)}
        Position={UDim2.fromScale(0.5, 0.7)}
        Size={UDim2.fromScale(0.8, 0.1)}
        TextScaled={true}
        BorderSizePixel={0}
        BackgroundColor3={colorscheme.base01}
        TextColor3={colorscheme.base08}
        BackgroundTransparency={transparency}
        TextTransparency={transparency}
        Font={colorscheme.font}
        Text={info.name}
        ZIndex={hover ? 10 : priority}
      />
      <textlabel
        key="description"
        AnchorPoint={Vector2.xAxis.mul(0.5)}
        Position={UDim2.fromScale(0.5, 0.8)}
        Size={UDim2.fromScale(0.8, 0.15)}
        TextScaled={true}
        BorderSizePixel={0}
        BackgroundColor3={colorscheme.base01}
        TextColor3={colorscheme.base08}
        BackgroundTransparency={transparency}
        TextTransparency={transparency}
        Font={colorscheme.font}
        Text={info.description}
        ZIndex={hover ? 10 : priority}
      />
    </imagebutton>
  );
}

export function Cards({
  enabled = false,
  cards = [
    {
      icon: "rbxgameasset://Images/pepper",
      name: "first",
      description: "you didnt set this!",
    },
    {
      icon: "rbxgameasset://Images/pepper",
      name: "second",
      description: "this either!",
    },
    {
      icon: "rbxgameasset://Images/pepper",
      name: "third",
      description: "SET IT NOW!!!!",
    },
  ],
  pressedCallback = () => print("no callback yet!"),
}: CardsProps) {
  const [first, firstMotion] = useMotion(1);
  const [second, secondMotion] = useMotion(1);
  const [third, thirdMotion] = useMotion(1);

  const delay = 0.05;

  useEffect(() => {
    const transparency = enabled ? 0 : 1;

    firstMotion.spring(transparency, springs.gentle);
    task.defer(() => {
      task.wait(delay);
      secondMotion.spring(transparency, springs.gentle);
      task.wait(delay);
      thirdMotion.spring(transparency, springs.gentle);
    });
  }, [enabled]);

  return (
    <>
      <Card
        key="left"
        info={cards[0]}
        angle_deg={15}
        priority={0}
        transparency={first}
        active={enabled}
        pressedCallback={pressedCallback}
      />
      <Card
        key="center"
        info={cards[1]}
        angle_deg={0}
        priority={1}
        transparency={second}
        active={enabled}
        pressedCallback={pressedCallback}
      />
      <Card
        key="right"
        info={cards[2]}
        angle_deg={-15}
        priority={2}
        transparency={third}
        active={enabled}
        pressedCallback={pressedCallback}
      />
    </>
  );
}