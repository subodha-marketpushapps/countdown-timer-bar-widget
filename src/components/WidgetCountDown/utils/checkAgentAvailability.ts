import { WhatsAppAgent } from "../../../interfaces";
import { DEBUG_WIDGET } from "../../../constants";

const getCurrentDay = () => {
  return new Date().toLocaleString("en-US", {
    weekday: "long",
  });
};
const getCurrentHour = () => {
  return new Date().getHours();
};

const isAgentOnline = (
  agent: WhatsAppAgent,
  currentHour: number,
  currentDay: string
) => {
  const startHour = agent?.availableTime?.startHour ?? 0;
  const endHour = agent?.availableTime?.endHour ?? 0;
  // Full day (24/7)
  if (startHour === endHour)
    return !!agent?.availableTime?.availableDays?.[currentDay];
  // Normal shift (same day)
  if (startHour < endHour) {
    return (
      currentHour >= startHour &&
      currentHour < endHour &&
      !!agent?.availableTime?.availableDays?.[currentDay]
    );
  }
  // Overnight shift (spans midnight)
  if (startHour > endHour) {
    return (
      (currentHour >= startHour || currentHour < endHour) &&
      !!agent?.availableTime?.availableDays?.[currentDay]
    );
  }
  return false;
};

export const getAgentOnlineStatus = (agent: WhatsAppAgent) => {
  const currentHour = getCurrentHour();
  const currentDay = getCurrentDay();
  
  const isOnline = isAgentOnline(agent, currentHour, currentDay);
  
  return isOnline;
};

export const checkAgentAvailability = (agent: WhatsAppAgent) => {
  if (!agent?.availableTime) {
    return false;
  }

  try {
    const isAgentOnline = getAgentOnlineStatus(agent);
    const finalAvailability = agent.isVisible && isAgentOnline;
    
    return finalAvailability;
  } catch (error) {
    DEBUG_WIDGET.error('AGENT_CHECK', `Error checking availability for agent ${agent?.name}`, error);
    return false;
  }
};

export default checkAgentAvailability;
