import {
  ReactFlow,
  Background,
  useReactFlow,
  OnNodesChange,
} from "@xyflow/react";

import "@xyflow/react/dist/style.css";
import { memo, useCallback, useRef } from "react";
import { getMiniAppTopInset } from "@/helpers/css/getMiniAppTopInset";
import { useWorkspaceStore } from "../../screens/workspace/.store/Workspace.store";
import {
  GRID_CELL_SIZE,
  GridFlowNode,
  GridFlowNodeTypes,
} from "./GridFlowInterface";
import { fixNodePosition, getExtent } from "./GridFlowUtils";

function GridFlow(props: {
  id: string;
  height?: number;
  width?: number;
  nodes: GridFlowNode[];
  setNodes: React.Dispatch<React.SetStateAction<GridFlowNode[]>>;
  onNodesChange: OnNodesChange<GridFlowNode>;
  onNodeDragStop: (ns: GridFlowNode[]) => void;
}) {
  const { nodes, setNodes, onNodesChange } = props;
  const GRID_HEIGHT = props.height ?? window.innerHeight - getMiniAppTopInset();
  const GRID_WIDTH = props.width ?? window.innerWidth;

  const { getIntersectingNodes } = useReactFlow();
  const { moveModeEnabled: nodesDraggable } = useWorkspaceStore();

  const reactFlowWrapper = useRef(null);

  const enableAnimation = useRef(false);
  const showShadows = useRef(false);

  const prevPosition = useRef<{ x: number; y: number }>();

  const onNodeDragStart = useCallback(
    (_: React.MouseEvent, node: GridFlowNode) => {
      prevPosition.current = node.position;

      const newNode = {
        id: "shadow",
        type: "shadow",
        position: prevPosition.current,
      };

      setNodes((nds) => nds.concat(newNode as GridFlowNode));
    },
    []
  );

  const onNodeDrag = useCallback(
    (_event: React.MouseEvent, node: GridFlowNode) => {
      const intersections = getIntersectingNodes(node).map((n) => n.id);
      const firstIntersection = intersections[0];

      setNodes((ns) =>
        ns.map((n) => {
          if (n.id === firstIntersection) {
            return n.className === "highlight"
              ? n
              : { ...n, className: "highlight" };
          }

          return n.className === "" ? n : { ...n, className: "" };
        })
      );

      if (intersections.filter((id) => id !== "shadow").length > 0) {
        showShadows.current = true;
      } else {
        showShadows.current = false;
      }
    },
    []
  );

  const onNodeDragStop = useCallback(
    (_event: React.MouseEvent, node: GridFlowNode) => {
      enableAnimation.current = true;
      setTimeout(() => {
        enableAnimation.current = false;
      }, 200);
      showShadows.current = false;

      fixNodePosition(node, setNodes);

      const intersections = getIntersectingNodes(node).filter(
        (n) => n.id !== "shadow"
      );

      const firstIntersectedNode = intersections[0];

      if (firstIntersectedNode && prevPosition.current) {
        const draggedNodeId = node.id;
        const intersectedNodeId = firstIntersectedNode.id;

        const draggedNodeNewPos = { ...firstIntersectedNode.position };
        const intersectedNodeNewPos = { ...prevPosition.current };

        setNodes((ns) =>
          ns.map((n) => {
            if (n.id === draggedNodeId) {
              return {
                ...n,
                position: draggedNodeNewPos,
              };
            }
            if (n.id === intersectedNodeId) {
              return {
                ...n,
                position: intersectedNodeNewPos,
              };
            }
            return n;
          })
        );
      }

      setNodes((ns) =>
        ns
          .filter((ns) => ns.id !== "shadow")
          .map((n) => ({
            ...n,
            className: "",
          }))
      );

      // shit code, but allow to get latest nodes state, refacto later
      // must be a solution due to lack of update logic after node position change
      setNodes((ns) => {
        props.onNodeDragStop(ns);
        return ns;
      });
    },
    []
  );

  return (
    <div className="relative transition-all duration-300 ease-in-out">
      <div
        ref={reactFlowWrapper}
        style={{
          height: GRID_HEIGHT,
        }}
      >
        <ReactFlow
          id={props.id}
          /* onInit={setFlowInstance} */
          nodes={nodes}
          nodeTypes={GridFlowNodeTypes}
          onNodesChange={onNodesChange}
          className={`flow-wrapper ${showShadows.current && "shadow-visible"} ${enableAnimation.current && "transitions-enabled"}`}
          translateExtent={[
            [0, 0],
            [getExtent(GRID_WIDTH), getExtent(GRID_HEIGHT)],
          ]}
          nodeExtent={[
            [0, 0],
            [getExtent(GRID_WIDTH) - 28, getExtent(GRID_HEIGHT) - 28],
          ]}
          zoomOnDoubleClick={false}
          zoomOnPinch={false}
          zoomOnScroll={false}
          colorMode="dark"
          proOptions={{ hideAttribution: true }}
          nodesDraggable={nodesDraggable}
          onNodeDrag={onNodeDrag}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
        >
          <Background bgColor="#191919" gap={GRID_CELL_SIZE} />
        </ReactFlow>
      </div>
    </div>
  );
}

export default memo(GridFlow);
