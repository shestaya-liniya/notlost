import { getTelegramSession } from "@/helpers/telegram/telegramSession";
import { useJazzProfileContext } from "@/lib/jazz/jazzProvider";
import { useAppStore } from "@/lib/store/store";
import AddDialogModal from "@/ui/modals/AddDialogModal";
import EditTagsModal from "@/ui/modals/EditTagsModal";
import { useEffect } from "react";
import TabViewContainer from "./TabBar";
import { getTelegramDialogsAndSetToStore, setupTelegramTheme } from "./tg";
import Graph from "@/features/graph/GraphWrapper";
import DialogInfo from "@/pages/DialogInfo";
import Settings from "@/pages/Settings";
import TelegramSignIn from "@/pages/TelegramSignIn";
import SlidingPage from "@/ui/SlidingPage";
import { useModalStore } from "@/lib/store/modalStore";
import { createPortal } from "react-dom";
import { DelayedUnmount } from "@/ui/DelayedUnmount";
import KeepAlive from "react-activation";

export default function App() {
  const { jazzProfile } = useJazzProfileContext();
  const { shadowInputValue, setShadowInputValue } = useAppStore();
  const { isSlidingModalOpen } = useModalStore();

  // Setup Telegram theme
  useEffect(() => {
    setupTelegramTheme();

    // Capture the initial viewport height
    document.documentElement.style.setProperty(
      "--initial-height",
      `${window.innerHeight}px`
    );
  }, []);

  // Set color scheme
  useEffect(() => {
    if (!jazzProfile.colorScheme) {
      jazzProfile.colorScheme = "blue";
      document.documentElement.setAttribute("data-theme", "blue");
    } else {
      document.documentElement.setAttribute(
        "data-theme",
        jazzProfile.colorScheme
      );
    }
  }, [jazzProfile]);

  useEffect(() => {
    // Fetch Telegram dialogs
    if (getTelegramSession()) {
      getTelegramDialogsAndSetToStore();
    }
  }, []);

  return (
    <div style={{ height: "var(--initial-height)" }}>
      {createPortal(<ModalsAndSlidingPages />, document.body)}
      {/* Shadow input for keyboard */}
      <input
        type="text"
        className="hidden-input"
        id="shadow-input"
        value={shadowInputValue}
        onChange={(e) => setShadowInputValue(e.target.value)}
      />
      {/* {!isSlidingModalOpen && (
        <KeepAlive cacheKey="tab-bar">
          <TabViewContainer />
        </KeepAlive>
      )} */}

      {/* Unmount tab bar on any slider page appearing to free up ressources, especially for graph sliding page */}
      <DelayedUnmount
        mounted={!isSlidingModalOpen}
        Wrapper={({ children }) => (
          <div className="h-full flex flex-col">{children}</div>
        )}
      >
        <KeepAlive cacheKey="tab-bar">
          <TabViewContainer />
        </KeepAlive>
      </DelayedUnmount>
    </div>
  );
}

const ModalsAndSlidingPages = () => {
  const {
    dialogInfoModalOpen,
    setDialogInfoModalOpen,
    telegramSignInModalOpen,
    setTelegramSignInModalOpen,
    settingsModalOpen,
    setSettingsModalOpen,
    graphModalOpen,
    setGraphModalOpen,
  } = useModalStore();
  return (
    <div>
      <EditTagsModal />
      <AddDialogModal />

      <SlidingPage
        open={dialogInfoModalOpen}
        onClose={() => {
          setDialogInfoModalOpen(false);
        }}
      >
        <DialogInfo />
      </SlidingPage>
      <SlidingPage
        open={telegramSignInModalOpen}
        onClose={() => {
          setTelegramSignInModalOpen(false);
        }}
      >
        <TelegramSignIn />
      </SlidingPage>
      <SlidingPage
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      >
        <Settings />
      </SlidingPage>
      <SlidingPage
        open={graphModalOpen}
        onClose={() => setGraphModalOpen(false)}
      >
        <Graph />
      </SlidingPage>
    </div>
  );
};
