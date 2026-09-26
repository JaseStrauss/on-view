import { useEffect, useState } from "react";
import { detectLowEndDevice } from "@/lib/detect-low-end-device";

export function useLowEndDevice(): boolean {
  const [lowEnd, setLowEnd] = useState(false);

  useEffect(() => {
    setLowEnd(detectLowEndDevice());
  }, []);

  return lowEnd;
}
