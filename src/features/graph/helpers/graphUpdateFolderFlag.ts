import { getCssVariable } from "@/helpers/css/getCssVariable";
import { IGraphNodeType, IGraphRef } from "../Graph.interface";
import getTextWidth from "@/helpers/getTextWidth";

import { NodeObject } from "react-force-graph-2d";
import { getMiniAppTopInset } from "@/helpers/css/getMiniAppTopInset";
import { useGraphStore } from "../GraphStore";

export default function graphUpdateFolderFlag(
  graphRef: IGraphRef,
  node: NodeObject
) {
  const { folderFlags, setFolderFlags } = useGraphStore.getState();
  const existingFlag = folderFlags.find((f) => f.id === node.id);

  if (graphRef && node.type === IGraphNodeType.FOLDER && !node.nested) {
    const SCREEN_WIDTH = window.innerWidth;
    const SCREEN_HEIGHT = Number(
      getCssVariable("--initial-height").replace("px", "")
    );

    const nodeInfo = isNodeOnScreen(
      node,
      graphRef,
      SCREEN_HEIGHT,
      SCREEN_WIDTH
    );
    if (nodeInfo) {
      const { x, y, isVisible } = nodeInfo;
      const position = clampPosition(
        x,
        y,
        SCREEN_WIDTH,
        SCREEN_HEIGHT,
        getTextWidth(node.title)
      );
      console.log(folderFlags);

      if (
        existingFlag &&
        existingFlag.x === position.x &&
        existingFlag.y === position.y
      ) {
        return;
      }
      if (existingFlag) {
        const updatedFlags = folderFlags.map((flag) =>
          flag.id === node.id
            ? {
                ...flag,
                x: position.x,
                y: position.y,
                distance: position.distance,
                visible: isVisible,
              }
            : flag
        );
        setFolderFlags(updatedFlags);
      } else {
        setFolderFlags([
          ...folderFlags,
          {
            id: String(node.id),
            title: node.title as string,
            x: position.x,
            y: position.y,
            distance: position.distance,
            visible: isVisible,
          },
        ]);
      }
    }
  }
}

const isNodeOnScreen = (
  node: NodeObject,
  graphRef: IGraphRef,
  canvasHeight: number,
  canvasWidth: number
) => {
  if (node.x === undefined || node.y === undefined || !graphRef.current) return;

  const { x, y } = graphRef.current.graph2ScreenCoords(node.x, node.y);
  const isVisible = x >= 0 && x <= canvasWidth && y >= 0 && y <= canvasHeight;

  return { x, y, isVisible };
};

const clampPosition = (
  x: number,
  y: number,
  W: number,
  H: number,
  textWidth: number
) => {
  // total wtf here

  const SETTINGS_BUTTON_HEIGHT = 48;
  const BOTTOM_MARGIN = 48;
  const TOP_MARGIN = 16;
  const LEFT_MARGIN = 24;
  const RIGHT_MARGIN = 48;

  const topInset = getMiniAppTopInset() + SETTINGS_BUTTON_HEIGHT + TOP_MARGIN;

  let pointX = x;
  let pointY = y;

  if (x < LEFT_MARGIN) pointX = LEFT_MARGIN;
  if (x + textWidth > W) pointX = W - textWidth - RIGHT_MARGIN;
  if (y < topInset) pointY = topInset;

  if (y + BOTTOM_MARGIN > H) pointY = H - BOTTOM_MARGIN;

  const distance = Math.sqrt((pointX - x) ** 2 + (pointY - y) ** 2);

  return { x: pointX, y: pointY, distance };
};
