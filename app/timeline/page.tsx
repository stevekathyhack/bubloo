import { BublooProvider } from "@/components/BublooProvider";
import { TimelineClient } from "@/components/timeline/TimelineClient";

export default function TimelinePage() {
  return (
    <BublooProvider>
      <TimelineClient />
    </BublooProvider>
  );
}
