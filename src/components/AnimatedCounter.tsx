import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'motion/react';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

export default function AnimatedCounter({ value, duration = 1.5, prefix = '', suffix = '' }: AnimatedCounterProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const springValue = useSpring(0, {
    duration: duration * 1000,
    bounce: 0
  });

  const displayValue = useTransform(springValue, (current) => 
    Math.round(current).toLocaleString()
  );

  useEffect(() => {
    springValue.set(value);
    setHasAnimated(true);
  }, [value, springValue]);

  return (
    <span className="inline-flex">
      {prefix}
      <motion.span>{displayValue}</motion.span>
      {suffix}
    </span>
  );
}
