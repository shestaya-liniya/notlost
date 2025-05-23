import { useTelegramSession } from "@/helpers/telegram/telegramSession";
import { useModalStore } from "@/lib/store/modalStore";
import Tappable from "../../ui/Tappable";
import SettingsOneLineSection from "./SettingsOneLineSection";
import TelegramIcon from "@/assets/icons/telegram.svg?react";

export default function SettingsSectionTgSync() {
  const { setTelegramSignInModalOpen, setSettingsModalOpen } = useModalStore();
  const { deleteSession, signedIn } = useTelegramSession();

  const handleLogout = () => {
    deleteSession();
  };
  return (
    <SettingsOneLineSection>
      <div className="flex gap-4 flex-1">
        <TelegramIcon className="w-6 h-6" />
        Telegram Sync
      </div>
      <div>
        {signedIn ? (
          <Tappable
            className="bg-primary rounded-xl px-4 py-1"
            onClick={handleLogout}
          >
            Log out
          </Tappable>
        ) : (
          <Tappable
            className="bg-primary rounded-xl px-4 py-1"
            onClick={() => {
              setSettingsModalOpen(false);
              setTimeout(() => {
                setTelegramSignInModalOpen(true);
              }, 300);
            }}
          >
            Sync
          </Tappable>
        )}
      </div>
    </SettingsOneLineSection>
  );
}
