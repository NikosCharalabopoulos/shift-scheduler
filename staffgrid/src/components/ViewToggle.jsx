import React from "react";
import { ToggleButtonGroup, ToggleButton } from "@mui/material";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

export default function ViewToggle({ value, onChange, sx }) {
  // value: "WEEK" | "MONTH"
  // onChange: (newValue) => void
  const handleChange = (_e, next) => {
    if (!next) return;          // ignore deselect
    onChange?.(next);
  };

  return (
    <ToggleButtonGroup
      exclusive
      size="small"
      value={value}
      onChange={handleChange}
      sx={sx}
    >
      <ToggleButton value="WEEK">
        <CalendarViewWeekIcon fontSize="small" style={{ marginRight: 6 }} />
        Week
      </ToggleButton>
      <ToggleButton value="MONTH">
        <CalendarMonthIcon fontSize="small" style={{ marginRight: 6 }} />
        Month
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
