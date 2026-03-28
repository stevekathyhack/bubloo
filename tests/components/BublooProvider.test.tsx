import { render, screen } from "@testing-library/react";

import { BublooProvider, useBubloo } from "@/components/BublooProvider";
import { DEVICE_STORAGE_KEY } from "@/lib/bubloo/constants";

function Probe() {
  const { logs, deviceId, isHydrated } = useBubloo();

  return (
    <div>
      <div>{isHydrated ? "hydrated" : "loading"}</div>
      <div>{`device:${deviceId}`}</div>
      <div>{`log-count:${logs.length}`}</div>
    </div>
  );
}

describe("BublooProvider", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("filters invalid stored logs during hydration", async () => {
    window.localStorage.setItem(DEVICE_STORAGE_KEY, "device-1");
    window.localStorage.setItem(
      "bubloo-demo-care-logs",
      JSON.stringify([
        {
          id: "valid-log",
          device_id: "device-1",
          type: "feeding",
          timestamp: "2026-03-28T14:00:00.000Z",
          amount_ml: 120,
          note: null,
          created_at: "2026-03-28T14:00:00.000Z",
        },
        {
          id: "invalid-log",
          device_id: "device-1",
          type: "note",
          timestamp: "not-a-timestamp",
          amount_ml: null,
          note: "Broken",
          created_at: "2026-03-28T14:01:00.000Z",
        },
      ]),
    );

    render(
      <BublooProvider>
        <Probe />
      </BublooProvider>,
    );

    expect(await screen.findByText("hydrated")).toBeInTheDocument();
    expect(screen.getByText("device:device-1")).toBeInTheDocument();
    expect(screen.getByText("log-count:1")).toBeInTheDocument();
  });
});
