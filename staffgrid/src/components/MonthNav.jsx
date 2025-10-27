// staffgrid/src/components/MonthNav.jsx
import React from "react";
import { Stack, Button, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";

export default function MonthNav({ label, onPrev, onToday, onNext }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.5}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<ChevronLeftIcon />}
        onClick={onPrev}
      >
        Prev
      </Button>

      <Button
        variant="outlined"
        size="small"
        startIcon={<TodayIcon />}
        onClick={onToday}
      >
        Today
      </Button>

      <Button
        variant="outlined"
        size="small"
        endIcon={<ChevronRightIcon />}
        onClick={onNext}
      >
        Next
      </Button>

      <Typography variant="subtitle1" fontWeight={700} sx={{ ml: 1 }}>
        {label}
      </Typography>
    </Stack>
  );
}
