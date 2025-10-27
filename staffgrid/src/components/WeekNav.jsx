import React from "react";
import { Stack, Button, Typography } from "@mui/material";
import { ArrowBack, ArrowForward, Today } from "@mui/icons-material";

export default function WeekNav({ label, onPrev, onToday, onNext }) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1.5}
      sx={{
        mb: 1.5,
        flexWrap: "wrap",
      }}
    >
      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ArrowBack fontSize="small" />}
          onClick={onPrev}
        >
          Prev
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<Today fontSize="small" />}
          onClick={onToday}
        >
          Today
        </Button>
        <Button
          variant="outlined"
          size="small"
          endIcon={<ArrowForward fontSize="small" />}
          onClick={onNext}
        >
          Next
        </Button>
      </Stack>

      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          ml: 1,
          minWidth: 200,
          textAlign: "center",
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}
