import { beforeEach, describe, expect, it } from "vitest";

import { DEMO_DEVICE_ID, DEVICE_STORAGE_KEY } from "../lib/bubloo/constants";
import { ensureDeviceId } from "../lib/bubloo/device";

const LEGACY_DEVICE_STORAGE_KEY = "bubloo-demo-device-id";

describe("ensureDeviceId", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("reuses the current device id when present", () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "device-123");

    expect(ensureDeviceId()).toBe("device-123");
  });

  it("migrates the legacy device key when needed", () => {
    window.localStorage.setItem(LEGACY_DEVICE_STORAGE_KEY, "legacy-device");

    expect(ensureDeviceId()).toBe("legacy-device");
    expect(window.localStorage.getItem(DEVICE_STORAGE_KEY)).toBe("legacy-device");
  });

  it("falls back to the shared demo id when nothing is stored", () => {
    expect(ensureDeviceId()).toBe(DEMO_DEVICE_ID);
    expect(window.localStorage.getItem(DEVICE_STORAGE_KEY)).toBe(DEMO_DEVICE_ID);
  });
});
