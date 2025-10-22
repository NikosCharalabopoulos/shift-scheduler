// staffgrid/src/hooks/useMyTimeOff.js
import { useEffect, useState, useCallback } from "react";
import { api, getErrorMessage } from "../lib/api";

export default function useMyTimeOff() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const { data } = await api.get("/timeoff");
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
    await api.post("/timeoff", payload); // backend θα προσθέσει employee/status
    await fetchAll();
  };

  const updateItem = async (id, patch) => {
    await api.patch(`/timeoff/${id}`, patch); // employee δεν αλλάζει status εδώ
    await fetchAll();
  };

  const deleteItem = async (id) => {
    await api.delete(`/timeoff/${id}`);
    await fetchAll();
  };

  return { rows, loading, err, createItem, updateItem, deleteItem, refetch: fetchAll };
}
