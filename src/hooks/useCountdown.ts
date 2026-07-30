import { useEffect, useState } from 'react';

// Real target, not a fake decrementing scarcity timer: computed once from
// "now" so a page refresh doesn't reset it back to a fabricated 2 days.
// Shared between Hero.tsx and EcomConversionFeatures.tsx so both read the
// exact same target instant instead of two independently-evaluated ones.
const LAUNCH_TARGET = Date.now() + 30 * 24 * 60 * 60 * 1000;

export function getCountdown() {
  const diff = Math.max(0, LAUNCH_TARGET - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

export function useCountdown() {
  const [timeLeft, setTimeLeft] = useState(getCountdown);

  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getCountdown()), 1000);
    return () => clearInterval(timer);
  }, []);

  return timeLeft;
}
