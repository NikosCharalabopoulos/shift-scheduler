import React, { useMemo } from "react";
import { formatYMDLocal, formatShort } from "../utils/date";

// MUI
import {
  Grid,
  Paper,
  Stack,
  Typography,
  Divider,
  Box,
} from "@mui/material";

/**
 * Props:
 * - days: Date[] (7 μέρες, Δευτέρα–Κυριακή)
 * - assignments: array από assignment docs (με populated shift)
 *
 * Αναμένουμε κάθε assignment να έχει:
 *   assignment.shift = {
 *     _id, date (ISO), startTime, endTime, notes?, department?: { name? }
 *   }
 */
export default function MyScheduleGrid({ days, assignments }) {
  // Ομαδοποίηση assignments ανά YYYY-MM-DD (ημερομηνία shift)
  const byDate = useMemo(() => {
    const map = {};
    (assignments || []).forEach((a) => {
      const s = a.shift || {};
      if (!s.date) return;
      const ymd = formatYMDLocal(new Date(s.date));
      (map[ymd] ||= []).push(a);
    });
    // Ταξινόμηση της ημέρας κατά startTime
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => {
        const as = a.shift?.startTime || "";
        const bs = b.shift?.startTime || "";
        return as.localeCompare(bs);
      })
    );
    return map;
  }, [assignments]);

  return (
    <Grid container spacing={2} sx={{ mt: 2 }}>
      {days.map((d) => {
        const key = formatYMDLocal(d);
        const list = byDate[key] || [];
        return (
          <Grid item xs={12} sm={6} md={4} lg={12/7} key={key}>
            <Paper variant="outlined" sx={{ p: 1.5, minHeight: 160, display: "flex", flexDirection: "column" }}>
              <Typography fontWeight={700} sx={{ mb: 1 }}>
                {formatShort(d)}
              </Typography>

              {list.length === 0 ? (
                <Typography variant="body2" color="text.secondary">No shifts</Typography>
              ) : (
                <Stack spacing={1}>
                  {list.map((a) => {
                    const s = a.shift || {};
                    return (
                      <Paper key={a._id || s._id} variant="outlined" sx={{ p: 1.25, borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                          <Box>
                            <Typography fontWeight={600}>
                              {s.startTime}–{s.endTime}
                            </Typography>
                            {s.department?.name && (
                              <Typography variant="body2" color="text.secondary">
                                {s.department.name}
                              </Typography>
                            )}
                            {s.notes && (
                              <Typography variant="body2" color="text.secondary">
                                {s.notes}
                              </Typography>
                            )}
                          </Box>
                        </Stack>

                        {/* Διαχωριστικό για οπτική ομοιομορφία με Admin */}
                        <Divider sx={{ mt: 1 }} />

                        <Typography variant="caption" color="text.secondary">
                          Assigned to you
                        </Typography>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Paper>
          </Grid>
        );
      })}
    </Grid>
  );
}
