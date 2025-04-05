import { backButton } from "@telegram-apps/sdk-react";
import { useEffect } from "react";
import TelegramWallpaper from "./TelegramWallpaper";
import { DelayedUnmount } from "./DelayedUnmount";
import { useModalStore } from "@/lib/store/modalStore";

export default function SlidingPage({
  children,
  open,
  onClose,
}: {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
}) {
  const { setIsSlidingModalOpen } = useModalStore();
  const handleClose = () => {
    onClose();
    if (backButton.isSupported()) {
      backButton.hide();
    }
  };
  useEffect(() => {
    setIsSlidingModalOpen(open);
    if (open) {
      if (backButton.isSupported()) {
        try {
          backButton.show();
          backButton.onClick(handleClose);
        } catch (e) {
          console.log(e);
        }
      }
    }
  }, [open]);

  return (
    <div>
      <div
        style={{
          height: "var(--initial-height)",
        }}
        className={`absolute top-0 left-0 w-screen bg-black/50 transition-all ease duration-500 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      ></div>
      <div
        style={{
          height: "var(--initial-height)",
        }}
        className={`absolute top-0 left-0 w-screen bg-secondary transition-all ease duration-500 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {import.meta.env.MODE === "development" && (
          <div
            onClick={handleClose}
            className="top-5 left-5 absolute bg-link/10 rounded-2xl px-2 py-1 text-link z-50"
          >
            Back
          </div>
        )}
        <TelegramWallpaper />
        <DelayedUnmount mounted={open}>{children}</DelayedUnmount>
      </div>
    </div>
  );
}
