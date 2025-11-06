import React from "react";
import { FormField, Range, TimeInput, Input } from "@wix/design-system";
import { WhatsAppAgent } from "../../../../interfaces";

interface InputAvailableTimeProps {
  agent: WhatsAppAgent;
  onStartHourChange: (startHour: number) => void;
  onEndHourChange: (endHour: number) => void;
}

const InputAvailableTime: React.FC<InputAvailableTimeProps> = ({
  agent,
  onStartHourChange,
  onEndHourChange,
}) => {
  const startHour = agent.availableTime?.startHour ?? 0;
  const endHour = agent.availableTime?.endHour ?? 0;

  let totalAvailableHours = (endHour - startHour + 24) % 24;
  if (startHour === endHour) totalAvailableHours = 24;

  const convertHourToDate = (hour: number): Date => {
    const today = new Date();
    today.setHours(hour, 0, 0, 0); // Set hour, minutes, seconds, and milliseconds
    return today;
  };

  return (
    <FormField
      label="Available Time"
      statusMessage={`Available for ${totalAvailableHours} hours per day`}
    >
      <Range>
        <TimeInput
          step={60}
          onChange={(e) => {
            const startTime = e.date ? e.date.getHours() : 0;
            onStartHourChange(startTime);
            if (startTime === endHour) {
              onEndHourChange(0);
            }
          }}
          value={convertHourToDate(startHour)}
          prefix={<Input.Affix>From</Input.Affix>}
          popoverProps={{
            placement: "top",
          }}
        />
        <TimeInput
          step={60}
          onChange={(e) => {
            const endTime = e.date ? e.date.getHours() : 0;
            onEndHourChange(endTime);
          }}
          value={convertHourToDate(endHour)}
          prefix={<Input.Affix>To</Input.Affix>}
          popoverProps={{
            placement: "top",
          }}
        />
      </Range>
    </FormField>
  );
};

export default InputAvailableTime;
