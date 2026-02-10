import { Routes, Route, Link } from "react-router-dom";
import Counter from "./pages/Counter";
import Hello from "./pages/Hello";
import Bootstrap from "./pages/Bootstrap";
import FileManager from "./pages/FileManager";

export default function App() {
  return (
    <div>
      <nav>
        <Link to="/">Counter</Link>
        <Link to="/hello">Hello</Link>
        <Link to="/bootstrap">Bootstrap</Link>
        <Link to="/file-manager">File Manager</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Counter />} />
        <Route path="/hello" element={<Hello />} />
        <Route path="/bootstrap" element={<Bootstrap />} />
        <Route path="/file-manager" element={<FileManager />} />
      </Routes>
    </div>
  );
}
