import React, { useState } from "react";
import { FieldSet, Text, Tooltip } from "@wix/design-system";
import { WhatsAppAgent } from "../../../../interfaces";

interface InputAvailableWeekDaysProps {
  agent: WhatsAppAgent;
  onChange: (weekDays: { [key: string]: boolean }) => void;
}

const InputAvailableWeekDays: React.FC<InputAvailableWeekDaysProps> = ({ agent, onChange }) => {
  const [weekDays, setWeekDays] = useState(
    agent.availableTime?.availableDays || {
      Monday: true,
      Tuesday: true,
      Wednesday: true,
      Thursday: true,
      Friday: true,
      Saturday: true,
      Sunday: true,
    },
  );

  const handleCheckboxChange = (day: keyof typeof weekDays) => {
    setWeekDays((prev) => ({
      ...prev,
      [day]: !prev[day],
    }));

    onChange({
      ...weekDays,
      [day]: !weekDays[day],
    });
  };

  const checkBoxCustom = (day: string) => {
    const shortDayName = day.substring(0, 2).toWellFormed();
    const commonCssStyles = {
      width: "36px",
      height: "36px",
      borderRadius: "50%",
      border: "none",
      fontSize: "12px",
      fontWeight: "bold",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      cursor: "pointer",
      transition: "background 0.3s, color 0.3s",
    };
    const activeCssStyles = {
      background: "#116DFF",
      color: "white",
      border: "none",
      ":hover": {
        background: "#0E5BCC",
        color: "white",
      },
    };
    const inactiveCssStyles = {
      background: "none",
      border: "1px solid #D6E6FE",
      color: "#116DFF",
      ":hover": {
        background: "#D6E6FE",
      },
    };
    const isActive = weekDays[day as keyof typeof weekDays];
    const styles = {
      ...commonCssStyles,
      ...(isActive ? activeCssStyles : inactiveCssStyles),
    };
    return (
      <Tooltip
        content={isActive ? `Available on ${day}` : `Not available on ${day}`}
        enterDelay={1000}
        key={day}
      >
        <button style={styles} onClick={() => handleCheckboxChange(day as keyof typeof weekDays)}>
          <Text size="small" skin={!isActive ? "primary" : undefined} light={isActive}>
            {shortDayName}
          </Text>
        </button>
      </Tooltip>
    );
  };

  return (
    <FieldSet direction="horizontal" columns="7" legend="Available Weekdays">
      {Object.keys(weekDays).map((day) => checkBoxCustom(day))}
    </FieldSet>
  );
};

export default InputAvailableWeekDays;
