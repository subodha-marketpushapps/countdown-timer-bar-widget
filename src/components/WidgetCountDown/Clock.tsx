import React, { useEffect, useState } from "react";

export interface ClockProps {
  labelPosition: "top" | "bottom";
  numberStyle:
    | "outline"
    | "filled"
    | "none"
    | "fillEachDigit"
    | "outlineEachDigit";
  endDate: Date;
  endTime: string; // "HH:MM" or "HH:MM:SS"
  backgroundColor?: string;
  textColor?: string;
}

 const Clock: React.FC<ClockProps> = ({
  labelPosition,
  numberStyle,
  endDate,
  endTime,
  backgroundColor = "#1f2937", // default: gray-800
  textColor = "#ffffff", // default: white
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  });

  // Combine endDate and endTime into a full Date
  const getEndDateTime = (): Date => {
    const [hours, minutes, seconds = "0"] = endTime.split(":");
    const end = new Date(endDate);
    end.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
    return end;
  };

  // Calculate remaining time
  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const end = getEndDateTime();
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" });
        return;
      }

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / (1000 * 60)) % 60);
      const s = Math.floor((diff / 1000) % 60);

      setTimeLeft({
        days: String(d).padStart(2, "0"),
        hours: String(h).padStart(2, "0"),
        minutes: String(m).padStart(2, "0"),
        seconds: String(s).padStart(2, "0"),
      });
    };

    const timer = setInterval(updateCountdown, 1000);
    updateCountdown();

    return () => clearInterval(timer);
  }, [endDate, endTime]);

  const renderNumber = (num: string) => {
    switch (numberStyle) {
      case "filled":
        return (
          <div
            className="flex items-center justify-center rounded-md text-4xl font-bold min-w-[2.5rem] h-[3rem]"
            style={{ backgroundColor, color: textColor }}
          >
            {num}
          </div>
        );

      case "outline":
        return (
          <div
            className="flex items-center justify-center rounded-md text-4xl font-bold border-2 min-w-[2.5rem] h-[3rem]"
            style={{ borderColor: backgroundColor, color: backgroundColor }}
          >
            {num}
          </div>
        );

      case "fillEachDigit":
        return (
          <div className="flex gap-1">
            {num.split("").map((digit, i) => (
              <span
                key={i}
                className="flex items-center justify-center rounded-md text-4xl font-bold min-w-[2.5rem] h-[3rem]"
                style={{ backgroundColor, color: textColor }}
              >
                {digit}
              </span>
            ))}
          </div>
        );

      case "outlineEachDigit":
        return (
          <div className="flex gap-1">
            {num.split("").map((digit, i) => (
              <span
                key={i}
                className="flex items-center justify-center rounded-md text-4xl font-bold border-2 min-w-[2.5rem] h-[3rem]"
                style={{ borderColor: backgroundColor, color: backgroundColor }}
              >
                {digit}
              </span>
            ))}
          </div>
        );

      case "none":
      default:
        return (
          <div className="flex items-center justify-center text-4xl font-bold">
            {num}
          </div>
        );
    }
  };

  const labels = [
    { key: "days", label: "Days" },
    { key: "hours", label: "Hours" },
    { key: "minutes", label: "Minutes" },
    { key: "seconds", label: "Seconds" },
  ];

  return (
    <div className="flex justify-center items-center gap-4 p-4 bg-transparent" style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "4px", padding: "4px", backgroundColor: "transparent" }}>
      {labels.map(({ key, label }) => (
        <div key={key} className="flex flex-col items-center gap-1" style={{ color: backgroundColor }}>
          {labelPosition === "top" && (
            <span className="text-sm text-gray-500 font-medium p-4">{label}</span>
          )}
          {renderNumber((timeLeft as any)[key])}
          {labelPosition === "bottom" && (
            <span className="text-sm text-gray-500 font-medium">{label}</span>
          )}
        </div>
      ))}
    </div>
  );
};

export default Clock;
