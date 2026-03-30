import { useState, useEffect } from "react";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";

interface CountdownProps {
  expiresAt: string;
}

export function Countdown({ expiresAt }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const targetDate = new Date(expiresAt);

    const updateTimer = () => {
      const now = new Date();
      if (now >= targetDate) {
        setIsExpired(true);
        return;
      }

      const days = differenceInDays(targetDate, now);
      const hours = differenceInHours(targetDate, now) % 24;
      const minutes = differenceInMinutes(targetDate, now) % 60;
      const seconds = differenceInSeconds(targetDate, now) % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  if (isExpired) {
    return (
      <div className="inline-block bg-muted/50 px-4 py-2 rounded-md">
        <span className="text-sm font-bold text-secondary uppercase tracking-widest">Offer Ended</span>
      </div>
    );
  }

  const TimeBlock = ({ value, label }: { value: number, label: string }) => (
    <div className="flex flex-col items-center justify-center bg-white border border-primary/20 shadow-sm rounded-lg w-14 h-14 md:w-16 md:h-16">
      <span className="font-serif text-xl md:text-2xl font-bold text-secondary leading-none">
        {value.toString().padStart(2, '0')}
      </span>
      <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-wider text-primary mt-1">
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex items-center gap-2 md:gap-3">
      <TimeBlock value={timeLeft.days} label="Days" />
      <span className="font-serif text-2xl text-secondary/30">:</span>
      <TimeBlock value={timeLeft.hours} label="Hrs" />
      <span className="font-serif text-2xl text-secondary/30">:</span>
      <TimeBlock value={timeLeft.minutes} label="Min" />
      <span className="font-serif text-2xl text-secondary/30">:</span>
      <TimeBlock value={timeLeft.seconds} label="Sec" />
    </div>
  );
}
