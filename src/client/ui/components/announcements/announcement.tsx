import Roact, { useEffect, useState } from "@rbxts/roact";
import colorscheme from "client/ui/utils/colorscheme";
import { useMotion } from "client/ui/hooks/use-motion";
import { springs } from "client/ui/utils/springs";

interface AnnouncementProps {
  text?: string,
  enabled?: boolean
}

export function Announcement({
  text = "",
  enabled = false
}: AnnouncementProps) {
  const [position, motion] = useMotion(0);

  useEffect(() => {
    if (enabled) {
      motion.spring(1, springs.gentle);
    } else {
      motion.spring(0, springs.responsive);
    }
  })

  return (
    <textlabel
      TextScaled={true}
      AnchorPoint={Vector2.xAxis.mul(0.5)}
      Position={position.map((alpha) => UDim2.fromScale(0.5, -0.1).Lerp(UDim2.fromScale(0.5, 0.02), alpha))}
      Transparency={position.map((alpha) => (1 - alpha))}
      Size={position.map((alpha) => UDim2.fromScale(0.1, 0.1).Lerp(UDim2.fromScale(0.2, 0.2), alpha))}
      Font={colorscheme.font}
      BackgroundColor3={colorscheme.background}
      TextColor3={colorscheme.foreground}
      Text={text}
    >
      <uistroke
        key="stroke"
        Transparency={position.map((alpha) => (1 - alpha))}
        ApplyStrokeMode={Enum.ApplyStrokeMode.Border}
        Color={colorscheme.selection_background}
        Thickness={3}
      />
      <uiaspectratioconstraint
        key="aspectratio"
        AspectRatio={4}
      />
    </textlabel>
  )
}