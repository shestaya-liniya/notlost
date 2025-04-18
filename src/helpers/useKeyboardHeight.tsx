import { useState, useEffect } from "react";

export const useKeyboardState = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const handleFocus = () => {
      const activeElement = document.activeElement;
      if (
        activeElement &&
        ((activeElement.tagName === "INPUT" &&
          //@ts-ignore
          activeElement.type !== "checkbox") ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.hasAttribute("contenteditable"))
      ) {
        setIsKeyboardVisible(true);
      }
    };

    const handleBlur = () => {
      setIsKeyboardVisible(false);
    };

    window.addEventListener("focusin", handleFocus);
    window.addEventListener("focusout", handleBlur);

    return () => {
      window.removeEventListener("focusin", handleFocus);
      window.removeEventListener("focusout", handleBlur);
    };
  }, []);

  return isKeyboardVisible;
};
