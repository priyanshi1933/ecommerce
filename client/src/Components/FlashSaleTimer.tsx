import { useState, useEffect } from "react";

interface TimerProps {
  startTime: string | Date;
  endTime: string | Date;
  onStart?: () => void; // Function to run when sale starts
  onEnd?: () => void;   // Function to run when sale expires
}

const FlashSaleTimer = ({ startTime, endTime, onStart, onEnd }: TimerProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    h: number;
    m: number;
    s: number;
    isUpcoming: boolean;
  } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const end = new Date(endTime).getTime();

      let isUpcoming = now < start;
      let target = isUpcoming ? start : end;
      let diff = target - now;

      if (diff <= 0) {
        if (isUpcoming) {
          onStart?.(); 
        } else {
          onEnd?.();   
        }
        clearInterval(timer);
        setTimeLeft(null);
        return;
      }

      setTimeLeft({
        h: Math.floor((diff / (1000 * 60 * 60)) % 24),
        m: Math.floor((diff / 1000 / 60) % 60),
        s: Math.floor((diff / 1000) % 60),
        isUpcoming: isUpcoming
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime, endTime, onStart, onEnd]);

  if (!timeLeft) {
    return <div className="badge bg-secondary rounded-0 w-100 py-2">SALE CLOSED</div>;
  }

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className={`badge ${timeLeft.isUpcoming ? 'bg-primary' : 'bg-danger'} rounded-0 px-3 py-2 w-100 mb-2 shadow-sm`}>
      <span className="me-2">{timeLeft.isUpcoming ? "STARTS IN" : "ENDS IN"}</span>
      <span className="fw-bold fs-6">
        {pad(timeLeft.h)}:{pad(timeLeft.m)}:{pad(timeLeft.s)}
      </span>
    </div>
  );
};

export default FlashSaleTimer;
