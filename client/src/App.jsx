import { Routes, Route } from "react-router-dom";

import Dashboard from "./pages/dashboard";
import ExternalSign from "./pages/ExternalSign";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />

      <Route
        path="/sign/:token"
        element={<ExternalSign />}
      />
    </Routes>
  );
}

export default App;