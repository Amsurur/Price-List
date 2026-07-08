"use client";

import { Overlay } from "./overlay";

// A panel that slides in from the right edge of the screen, built on the
// shared Overlay primitive. Used for product detail + Reserve on laptop —
// BottomSheet is its mobile counterpart.
export function SideDrawer({
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
      align="right"
      labelledBy={labelledBy}
      contentClassName="w-full max-w-md overflow-y-auto border-l border-line bg-surface p-5 shadow-xl"
    >
      {children}
    </Overlay>
  );
}
