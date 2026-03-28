import { BublooProvider } from "@/components/BublooProvider";
import { HandoffClient } from "@/components/handoff/HandoffClient";

export default function HandoffPage() {
  return (
    <BublooProvider>
      <HandoffClient />
    </BublooProvider>
  );
}
