// staffgrid/src/hooks/useAssignmentsRange.js
import { useEffect, useState } from "react";
import { api, getErrorMessage } from "../lib/api";

export default function useAssignmentsRange(fromYMD, toYMD) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;
    async function run() {
      setLoading(true);
      setErr("");
      try {
        const { data } = await api.get("/shift-assignments", {
          params: { from: fromYMD, to: toYMD },
        });
        if (mounted) setData(Array.isArray(data) ? data : []);
      } catch (e) {
        if (mounted) setErr(getErrorMessage(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (fromYMD && toYMD) run();
    return () => { mounted = false; };
  }, [fromYMD, toYMD]);

  return { data, loading, err };
}
