// staffgrid/src/hooks/useMyAvailability.js
import { useCallback, useEffect, useState } from "react";
import { api, getErrorMessage } from "../lib/api";

export default function useMyAvailability() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/availability"); // backend self-scope για EMPLOYEE
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const createItem = async (payload) => {
    await api.post("/availability", payload);
  };

  // ✅ ΝΕΟ: batch create (ένα POST ανά selected weekday)
  const createMany = async (payloads) => {
    for (const p of payloads) {
      await createItem(p);
    }
    await fetchAll();
  };

  const updateItem = async (id, patch) => {
    await api.patch(`/availability/${id}`, patch);
    await fetchAll();
  };

  const deleteItem = async (id) => {
    await api.delete(`/availability/${id}`);
    await fetchAll();
  };

  return {
    rows,
    loading,
    err,
    createItem,
    createMany, // ✅
    updateItem,
    deleteItem,
    refetch: fetchAll
  };
}
