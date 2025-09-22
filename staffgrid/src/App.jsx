import { useEffect, useState } from "react";
import api from "./lib/api";

function App() {
  const [health, setHealth] = useState(null);

  useEffect(() => {
    api.get("/health").then(res => setHealth(res.data)).catch(() => setHealth({ ok: false }));
  }, []);

  return (
    <div style={{ padding: 24 }}>
      <h1>StaffGrid</h1>
      <p>Backend health: {health ? JSON.stringify(health) : "loading..."}</p>
    </div>
  );
}

export default App;
