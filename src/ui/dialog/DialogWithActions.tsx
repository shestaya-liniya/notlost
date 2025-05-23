import { JazzDialog, JazzFolder, JazzTag } from "@/lib/jazz/schema";
import { useState } from "react";
import Tappable from "../Tappable";
import { DialogTooltip } from "./DialogTooltip";
//import Tag from "../Tag";
import { truncateWord } from "@/helpers/truncateWord";

export default function DialogWithActions(props: {
  dialog: JazzDialog;
  folder: JazzFolder;
  index: number;
}) {
  const [dialogWithTooltip, setDialogWithTooltip] = useState<null | JazzDialog>(
    null
  );
  // Distribute tags into three columns
  const tags: JazzTag[][] = [[], [], []];
  props.dialog.tags?.forEach((tag, index) => {
    if (!tag) return null;
    tags[index % 3].push(tag);
  });

  return (
    <div className={`relative p-2`}>
      <div className="flex flex-col items-center justify-left gap-1 rounded-xl ">
        <div className="flex items-start">
          <Tappable
            onClick={() => {
              window.open(`https://t.me/${props.dialog.username}`, "_blank");
            }}
            onLongPress={() => {
              setDialogWithTooltip(props.dialog);
            }}
            className="flex flex-col gap-1 items-center"
          >
            <img
              loading="lazy"
              src={`https://t.me/i/userpic/320/${props.dialog.username}.svg`}
              className="h-12 w-12 min-w-12 rounded-full"
              decoding="async"
              alt=""
            />
            <span
              className={`px-2 py-[0.5px] text-xs font-normal bg-link/10 text-link rounded-xl`}
            >
              {truncateWord(props.dialog.name, 5)}
            </span>
          </Tappable>
          <div className="-mt-1">
            {/* {tags.map((array) => {
              return (
                <div
                  className="flex"
                  key={array.map((tag) => tag.title).join(",")}
                >
                  {array.map((tag) => {
                    return (
                      <Tag
                        key={tag.id}
                        title={tag.title}
                        color={tag.color}
                        className="ml-1 mt-1"
                      />
                    );
                  })}
                </div>
              );
            })} */}
          </div>
        </div>
      </div>
      <DialogTooltip
        dialog={props.dialog}
        folder={props.folder}
        showTooltip={props.dialog === dialogWithTooltip}
        closeTooltip={() => {
          setDialogWithTooltip(null);
        }}
        appearOnBottom={[0, 1, 2, 3, 4, 5].includes(props.index)}
      />
    </div>
  );
}
