import React from "react";
import { Toast, type ToastProps } from "./Toast";

export type ThemeNotificationModalProps = ToastProps;

export const ThemeNotificationModal: React.FC<ThemeNotificationModalProps> = (props) => {
  return <Toast {...props} />;
};
