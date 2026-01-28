import { useState } from "react";

export function useTextSize() {
  const [size, setSize] = useState(1.18);
  const increase = () => setSize(s => Math.min(s + 0.1, 2));
  const decrease = () => setSize(s => Math.max(s - 0.1, 0.8));
  return { size, increase, decrease };
}
