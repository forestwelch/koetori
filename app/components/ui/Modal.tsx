"use client";

import { BaseModal, BaseModalProps } from "./BaseModal";

/**
 * Standard Modal component - uses BaseModal with default settings.
 * This is a convenience wrapper for most common use cases.
 *
 * For more advanced use cases, use BaseModal directly.
 */
export function Modal(props: BaseModalProps) {
  return <BaseModal {...props} />;
}
