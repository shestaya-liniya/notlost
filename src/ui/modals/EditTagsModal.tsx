import BottomModal from "@/ui/modals/BottomModal";
import { useModalStore } from "@/lib/store/modalStore";
import { useEffect, useState } from "react";
import Tappable from "@/ui/Tappable";
import {
  jazzAddTag,
  jazzRemoveTagFromDialog,
} from "@/lib/jazz/actions/jazzDialog";
import { useJazzProfileContext } from "@/lib/jazz/jazzProvider";
import Tag from "@/ui/Tag";
import RemoveIcon from "@/assets/icons/remove.svg?react";
import { AnimatePresence, motion } from "framer-motion";
import { JazzTag } from "@/lib/jazz/schema";
import ColorCircle from "@/ui/ColorCircle";
import { useAppStore } from "@/lib/store/store";

export default function EditTagsModal() {
  const {
    editTagsModalOpen,
    setEditTagsModalOpen,
    dialogInfoModalDialog: dialog,
    setDialogInfoModalDialog,
  } = useModalStore();
  const { jazzProfile } = useJazzProfileContext();

  const [activeColor, setActiveColor] = useState<string>("red-500");

  const colors = [
    "red-500",
    "blue-500",
    "green-500",
    "yellow-500",
    "purple-500",
    "orange-500",
    "pink-500",
  ];

  const shadowInput = document.getElementById(
    "shadow-input"
  ) as HTMLInputElement;

  const { shadowInputValue: tagValue, setShadowInputValue: setTagValue } =
    useAppStore();

  const handleAddTag = () => {
    shadowInput.focus();
    if (dialog && tagValue.length > 0) {
      jazzAddTag(jazzProfile, dialog, {
        title: tagValue,
        color: activeColor,
      });
      setDialogInfoModalDialog(dialog);
      setTagValue("");
    }
  };

  const handleRemoveTag = (tag: JazzTag) => {
    if (dialog) {
      jazzRemoveTagFromDialog(jazzProfile, dialog, tag);
      setDialogInfoModalDialog(dialog);
      shadowInput.focus();
    }
  };

  if (!dialog) return null;

  return (
    <BottomModal
      id="edit-tags-modal"
      title="Edit tags"
      isOpen={editTagsModalOpen}
      onClose={() => setEditTagsModalOpen(false)}
    >
      <div className="px-4 flex flex-col items-center">
        {dialog.tags && dialog.tags?.length > 0 && (
          <div className="flex flex-col gap-2 mb-4">
            <div className="flex gap-2 flex-wrap items-start">
              <AnimatePresence>
                {dialog.tags?.map((tag) => {
                  if (!tag) return null;
                  return (
                    <motion.div
                      key={tag.title}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Tappable
                        onClick={() => {
                          handleRemoveTag(tag);
                        }}
                        className={`flex items-center gap-1 bg-${tag.color}/20 rounded-md pr-1`}
                      >
                        <Tag title={tag.title} color={tag.color} size="md" />
                        <RemoveIcon className={`w-3 h-3 text-${tag.color}`} />
                      </Tappable>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}
        <div className="flex justify-between items-center w-full pb-2 pl-4 ">
          <div className="text-sm text-hint uppercase self-start ">New tag</div>
          {tagValue.length > 0 && (
            <Tag title={tagValue} color={activeColor} size="md" />
          )}
        </div>

        <div
          onClick={() => {
            shadowInput.focus();
          }}
          className="appearance-none border-none w-full focus:outline-none focus:ring-transparent bg-secondary rounded-full px-4 py-2"
        >
          <FakeInput />
        </div>
        <div className="flex flex-row gap-2 mt-2">
          {colors.map((color) => (
            <ColorCircle
              key={color}
              color={color}
              activeColor={activeColor}
              setActiveColor={(color: string) => {
                shadowInput.focus();
                setActiveColor(color);
              }}
            />
          ))}
        </div>
        <Tappable
          className="bg-button text-center py-2 mt-4 text-white rounded-xl w-full font-semibold"
          onClick={handleAddTag}
        >
          Add tag
        </Tappable>
      </div>
    </BottomModal>
  );
}

const FakeInput = () => {
  const { shadowInputValue } = useAppStore();
  const [previousShadowInputValue, setPreviousShadowInputValue] =
    useState(shadowInputValue);

  const shadowInput = document.getElementById(
    "shadow-input"
  ) as HTMLInputElement;

  const [isFocusedShadow, setIsFocusedShadow] = useState(false);

  shadowInput.addEventListener("focus", () => {
    console.log("focus");

    setIsFocusedShadow(true);
  });
  shadowInput.addEventListener("blur", () => setIsFocusedShadow(false));

  useEffect(() => {
    if (shadowInputValue.length > previousShadowInputValue.length) {
      setCursorIndex((prev) => prev + 1);
    }
    if (shadowInputValue.length < previousShadowInputValue.length) {
      setCursorIndex((prev) => prev - 1);
    }
    setPreviousShadowInputValue(shadowInputValue);
  }, [shadowInputValue]);

  const [cursorIndex, setCursorIndex] = useState(shadowInputValue.length);

  useEffect(() => {
    if (shadowInputValue.length > 0) {
      shadowInput?.setSelectionRange(cursorIndex, cursorIndex);
    }
  }, [cursorIndex]);

  const beforeCursor = shadowInputValue.slice(0, cursorIndex);
  const afterCursor = shadowInputValue.slice(cursorIndex);

  return (
    <div className="flex relative items-center w-full min-h-6">
      {beforeCursor.split("").map((char, index) => (
        <div key={index} onClick={() => setCursorIndex(index)}>
          {char === " " ? "\u00A0" : char}
        </div>
      ))}
      <div className="inline-block w-0">
        {isFocusedShadow && (
          <div className="h-5 py-1 w-[2px] relative -left-[1px] bg-white/50 animate-blink"></div>
        )}
      </div>
      {afterCursor.split("").map((char, index) => (
        <div
          key={beforeCursor.length + index}
          onClick={() => setCursorIndex(beforeCursor.length + index)}
        >
          {char === " " ? "\u00A0" : char}
        </div>
      ))}
      <div
        className="flex-grow w-20 h-4"
        onClick={() => {
          setCursorIndex(shadowInputValue.length);
        }}
      ></div>
    </div>
  );
};

/*
bg-blue-500/20
bg-red-500/20
bg-green-500/20
bg-yellow-500/20
bg-purple-500/20
bg-orange-500/20
bg-pink-500/20
bg-blue-500
bg-red-500
bg-green-500
bg-yellow-500
bg-purple-500
bg-orange-500
bg-pink-500
text-blue-500
text-red-500
text-green-500
text-yellow-500
text-purple-500
text-orange-500
text-pink-500
text-black
*/
