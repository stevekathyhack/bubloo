"use client";

import { DEMO_DEVICE_ID, DEVICE_STORAGE_KEY } from "./constants";

const LEGACY_DEVICE_STORAGE_KEY = "bubloo-demo-device-id";

export function ensureDeviceId(): string {
  if (typeof window === "undefined") {
    return DEMO_DEVICE_ID;
  }

  const existing = window.localStorage.getItem(DEVICE_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const legacy = window.localStorage.getItem(LEGACY_DEVICE_STORAGE_KEY);
  if (legacy) {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, legacy);
    return legacy;
  }

  window.localStorage.setItem(DEVICE_STORAGE_KEY, DEMO_DEVICE_ID);
  return DEMO_DEVICE_ID;
}
