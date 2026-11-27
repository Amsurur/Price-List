"use client";

import { Overlay } from "./overlay";

// A sheet that slides up from the bottom of the screen, built on the shared
// Overlay primitive. Used for Reserve on mobile, where the previous
// inline-expand form was too cramped to use comfortably.
export function BottomSheet({
  onClose,
  labelledBy,
  children,
}: {
  onClose: () => void;
  labelledBy?: string;
  children: React.ReactNode;
}) {
  return (
    <Overlay
      onClose={onClose}
      align="bottom"
      labelledBy={labelledBy}
      contentClassName="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-surface px-4 pt-3 pb-6 shadow-xl"
    >
      <div
        aria-hidden="true"
        className="mx-auto mb-2 h-1.5 w-10 rounded-full bg-line"
      />
      {children}
    </Overlay>
  );
}
