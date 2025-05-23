/* import { useDragStore } from "@/lib/store/dragStore";
import { memo, useEffect, useRef, useState } from "react";

// Dump implementation, every element will create a new listener, need to find a way to share a single listener
function DragSensible({
  children,
  sensibleFor,
  onDragEnd,
}: {
  children: React.ReactNode;
  sensibleFor: "folder" | "contact";
  onDragEnd: () => void;
}) {
  const [touchInside, setTouchInside] = useState(false);
  const { draggableItemType } = useDragStore();

  const [lastItemType, setLastItemType] = useState<"folder" | "contact" | null>(
    null
  );

  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLastItemType(draggableItemType);
  }, [draggableItemType]);

  const isTouchInside = (touch: Touch) => {
    if (!elementRef.current) return false;
    const elementBounds = elementRef.current.getBoundingClientRect();
    return (
      touch.clientX >= elementBounds.left &&
      touch.clientX <= elementBounds.right &&
      touch.clientY >= elementBounds.top &&
      touch.clientY <= elementBounds.bottom
    );
  };

  const onTouchStart = (e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchInside(isTouchInside(touch));
  };

  const onTouchMove = (e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchInside(isTouchInside(touch));
  };

  const onTouchEnd = () => {
    if (touchInside && lastItemType === sensibleFor) {
      onDragEnd();
    }
    setTouchInside(false);
  };

  useEffect(() => {
    document.addEventListener("touchstart", onTouchStart);
    document.addEventListener("touchmove", onTouchMove);
    document.addEventListener("touchend", onTouchEnd);

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    };
  }, [lastItemType, touchInside]);

  return (
    <div
      ref={elementRef}
      className={`transition-all duration-150 ease-in-out ${touchInside && lastItemType === sensibleFor ? "bg-link/20" : ""}`}
      style={{
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}

export default memo(DragSensible);
 */
