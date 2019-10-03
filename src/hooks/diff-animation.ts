import { useCallback, useEffect, useState } from "react";

interface numObject {
  [id: string]: number;
}

export default function useDiffAnimation<T extends numObject>(
  val: T,
  speed: number,
) {
  const [current, setCurrent] = useState(val);
  const [next, setNext] = useState(val);
  const [shouldAnimate, setShouldAnimate] = useState(true);

  const setNewValue = useCallback((newVal: T, shouldAnimate: boolean) => {
    setNext(newVal);
    setShouldAnimate(shouldAnimate);
  }, []);

  useEffect(() => {
    function getDiff(x: number, destX: number) {
      if (x > destX) {
        return -Math.min(speed, x - destX);
      }
      if (x < destX) {
        return Math.min(speed, destX - x);
      }
      return 0;
    }
    let animateTimeout: number;
    const diffs: Array<[string, number]> = Object.keys(current).map((key) => [
      key,
      getDiff(current[key], next[key]),
    ]);
    const isDifferent = diffs.some((diff) => diff[1] !== 0);
    if (isDifferent && shouldAnimate) {
      animateTimeout = setTimeout(() => {
        const next = { ...current } as any;
        diffs.forEach((diff) => (next[diff[0]] += diff[1]));
        setCurrent(next);
      });
    }
    return () => clearTimeout(animateTimeout);
  }, [current, next, shouldAnimate, speed]);

  return {
    current,
    setNewValue,
  };
}
