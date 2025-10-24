// staffgrid/src/hooks/useShiftsRange.js
import { useEffect, useState, useCallback } from "react";
import { api, getErrorMessage } from "../lib/api";

/**
 * Φέρνει shifts σε εύρος ημερομηνιών (fromYMD..toYMD).
 * Προαιρετικά φιλτράρισμα departmentId (στο query).
 */
export default function useShiftsRange(fromYMD, toYMD, departmentId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetch = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const params = { from: fromYMD, to: toYMD };
      if (departmentId) params.department = departmentId;
      const { data } = await api.get("/shifts", { params });
      setData(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [fromYMD, toYMD, departmentId]);

  useEffect(() => {
    if (fromYMD && toYMD) fetch();
  }, [fromYMD, toYMD, departmentId, fetch]);

  return { data, loading, err, refetch: fetch };
}
