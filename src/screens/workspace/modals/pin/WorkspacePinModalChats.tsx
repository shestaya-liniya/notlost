import getTelegramAvatarLink from "@/helpers/telegram/getTelegramAvatarLink";
import { truncateWord } from "@/helpers/truncateWord";
import { useJazzProfileContext } from "@/lib/jazz/jazzProvider";
import { useModalStore } from "@/lib/store/modalStore";
import { useAppStore } from "@/lib/store/store";
import Tappable from "@/ui/Tappable";
import VerticalScrollableList from "@/ui/VerticalScrollableList";
import { memo, useMemo } from "react";
import PinIcon from "@/assets/icons/pin.svg?react";
import { AnimatePresence, motion } from "framer-motion";
import { TelegramDialogInfo } from "@/lib/telegram/api/telegramApiClient";
import { GridFlowNode } from "@/features/grid-flow/GridFlowInterface";
import {
  gridFlowAddNode,
  gridFlowDeleteNode,
} from "@/features/grid-flow/GridFlowUtils";
import TelegramIcon from "@/assets/icons/telegram.svg?react";
import { useWorkspaceModalsActions } from "../../.store/WorkspaceModals.store";

function WorkspacePinModalChats(props: {
  nodes: GridFlowNode[];
  setNodes: React.Dispatch<React.SetStateAction<GridFlowNode[]>>;
}) {
  const { nodes, setNodes } = props;
  const { jazzProfile } = useJazzProfileContext();

  const telegramDialogs = useAppStore((s) => s.telegramDialogs);
  const setTelegramSignInModalOpen = useModalStore(
    (s) => s.setTelegramSignInModalOpen
  );
  const { setShowPinModal } = useWorkspaceModalsActions();

  const pinToWorkspace = (telegramChat: TelegramDialogInfo) => {
    gridFlowAddNode(
      {
        type: "chat",
        data: {
          username: telegramChat.username,
          label: telegramChat.label,
        },
      },
      nodes,
      setNodes
    );
  };

  const unpinFromWorkspace = (node: GridFlowNode) => {
    gridFlowDeleteNode(node.id, setNodes);
  };

  const nodeMap = useMemo(() => {
    const map = new Map<string, GridFlowNode>();
    nodes
      .filter((n) => n.type === "chat")
      .forEach((n) => {
        if (n.data.username) map.set(n.data.username, n);
      });
    return map;
  }, [nodes]);

  return (
    <div>
      {jazzProfile.telegramSync ? (
        <VerticalScrollableList className="gap-8 max-h-72">
          {telegramDialogs.map((telegramChat) => {
            const chatFromWorkspace = nodeMap.get(telegramChat.username);
            return (
              <ChatBubble
                key={telegramChat.username}
                telegramChat={telegramChat}
                pinned={chatFromWorkspace !== undefined}
                pinToWorkspace={() => pinToWorkspace(telegramChat)}
                unpinFromWorkspace={() => {
                  if (chatFromWorkspace !== undefined) {
                    unpinFromWorkspace(chatFromWorkspace);
                  }
                }}
              />
            );
          })}
        </VerticalScrollableList>
      ) : (
        <div className="flex flex-col items-center pb-8">
          <Tappable
            onClick={() => {
              setTelegramSignInModalOpen(true);
              setShowPinModal(false);
            }}
            className="bg-secondary ml-auto mr-auto rounded-full px-4 py-2 "
          >
            <div className="flex gap-2 animate-spin">
              <TelegramIcon className="w-6 h-6" />
              <div className="font-semibold ">Sync my chats</div>
            </div>
          </Tappable>
        </div>
      )}
    </div>
  );
}

const ChatBubble = (props: {
  telegramChat: TelegramDialogInfo;
  pinned: boolean;
  pinToWorkspace: () => void;
  unpinFromWorkspace?: () => void;
}) => {
  const { telegramChat } = props;

  return (
    <Tappable
      className="flex flex-col items-center max-w-12 relative"
      onClick={() => {
        if (props.pinned) {
          props.unpinFromWorkspace?.();
        } else {
          props.pinToWorkspace();
        }
      }}
    >
      <img
        src={getTelegramAvatarLink(telegramChat.username)}
        className="h-12 min-w-12 rounded-full"
        alt=""
      />
      <div className="text-xs text-nowrap text-hint">
        {telegramChat.label.length > 10 ? (
          <div className="relative">
            {truncateWord(telegramChat.label, 10)}
            <div className="bg-gradient-to-r from-transparent to-primary h-full w-8 absolute right-0 top-0"></div>
          </div>
        ) : (
          telegramChat.label
        )}
      </div>
      <AnimatePresence>
        {props.pinned && (
          <motion.div
            key="pin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <div className="absolute -top-1 -right-1 p-1 h-5 w-5 rounded-full bg-secondary grid place-content-center">
              <PinIcon className="h-3 w-3" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Tappable>
  );
};

export default memo(WorkspacePinModalChats);
