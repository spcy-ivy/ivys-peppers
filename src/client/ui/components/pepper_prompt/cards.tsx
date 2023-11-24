import { useAsyncEffect } from "@rbxts/pretty-react-hooks";
import Roact, { useContext, useState } from "@rbxts/roact";
import { useMotion } from "client/ui/hooks/use-motion";
import colorscheme from "client/ui/utils/colorscheme";
import { springs } from "client/ui/utils/springs";
import { PepperOption } from "types/interfaces/Peppers";
import { PromptContext } from "./promptContext";

interface CardProps {
  info?: PepperOption;
  angle_deg?: number;
  index?: number;
}

interface CardsProps {
  cards?: PepperOption[];
}

function Card({
  info = {
    icon: "rbxgameasset://Images/pepper",
    name: "none",
    description: "you didnt set anything",
  },
  angle_deg = 0,
  index = 0,
}: CardProps) {
  const promptContext = useContext(PromptContext)
  const enabled = promptContext.enabled
  const pressedCallback = promptContext.pressedCallback;

  // moving another cycle cuz we need the cos to start at 0
  const xposition = 0.5 + math.cos(math.rad(angle_deg + 90)) * 0.7;
  // using abs to keep the sign the same
  const yposition = 0.8 + math.abs(math.sin(math.rad(angle_deg)) * 0.2);
  const [zindex, setZindex] = useState(index);
  const [position, positionMotion] = useMotion(0);
  const [size, sizeMotion] = useMotion(0);
  const [transparency, transparencyMotion] = useMotion(1)

  useAsyncEffect(async () => {
    await Promise.delay(index * 0.05)
    transparencyMotion.spring(enabled ? 0 : 1)
  }, [enabled])

  return (
    <imagebutton
      AnchorPoint={new Vector2(0.5, 1)}
      AutoButtonColor={false}
      Image={"rbxgameasset://Images/card_background"}
      BackgroundTransparency={transparency}
      ImageTransparency={transparency}
      Position={position.map((y) => UDim2.fromScale(xposition, yposition - y * 0.1))}
      Size={size.map((alpha) => UDim2.fromScale(0.5 - 0.05 * alpha, 0.5 - 0.05 * alpha))}
      Rotation={-angle_deg}
      ZIndex={zindex}
      Event={{
        MouseEnter: () => {
          positionMotion.spring(1, springs.responsive);
          setZindex(10)
        },
        MouseLeave: () => {
          sizeMotion.spring(0, springs.bubbly);
          positionMotion.spring(0, springs.responsive);
          setZindex(index)
        },
        MouseButton1Down: () => {
          sizeMotion.impulse(0.01);
          pressedCallback(info);
        },
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
        ZIndex={zindex}
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
        ZIndex={zindex}
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
        ZIndex={zindex}
      />
    </imagebutton>
  );
}

export function Cards({
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
}: CardsProps) {
  return (
    <>
      {
        cards.map((info, index) => (
          <Card
            key={`card${index}`}
            info={info}
            angle_deg={15 - (15 * index)}
            index={index}
          />
        ))
      }
    </>
  )
}