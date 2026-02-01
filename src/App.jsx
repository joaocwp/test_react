import { useState } from "react";
import Papa from "papaparse";
import Plot from "react-plotly.js";
import { Routes, Route, Link } from "react-router-dom";
import HelloWorld from "./pages/HelloWorld";


function App() {
  // ===== Message selector state =====
  const [selectedMessage, setSelectedMessage] = useState("");
  const [displayedMessage, setDisplayedMessage] = useState("");

  // ===== Calculator state =====
  const [num1, setNum1] = useState("");
  const [num2, setNum2] = useState("");
  const [sumResult, setSumResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

// ===== CSV upload state =====
const [csvData, setCsvData] = useState([]);
const [csvError, setCsvError] = useState("");
const [bootstrapResult, setBootstrapResult] = useState(null);
const [csvLoading, setCsvLoading] = useState(false);

  // ===== Call FastAPI backend =====
const calculateSum = async () => {
  setError("");
  setLoading(true);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, 5000); // 5 seconds

  try {
    const response = await fetch("http://localhost:8000/sum", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        a: Number(num1),
        b: Number(num2),
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error("Backend error");
    }

    const data = await response.json();
    setSumResult(data.result);
  } catch (err) {
    if (err.name === "AbortError") {
      setError("Request timed out after 5 seconds");
    } else {
      setError("Failed to calculate sum");
    }
    setSumResult(null);
  } finally {
    clearTimeout(timeoutId);
    setLoading(false);
  }
};

const handleCsvUpload = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.name.endsWith(".csv")) {
    setCsvError("Please upload a valid CSV file");
    return;
  }

  sendCsvToBackend(file);
};

const sendCsvToBackend = async (file) => {
  setCsvLoading(true);
  setBootstrapResult(null);
  setCsvError("");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch(
      "http://localhost:8000/bootstrap/csv?n_bootstrap=10000",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || "Upload failed");
    }

    const data = await response.json();
    setBootstrapResult(data);
  } catch (err) {
    setCsvError(err.message);
  } finally {
    setCsvLoading(false);
  }
};

//   return (
//    <div className="app-container">
//   {/* Message selector */}
//   <div className="card message-card">
//     <h2>Message Selector</h2>

//     <select
//       value={selectedMessage}
//       onChange={(e) => setSelectedMessage(e.target.value)}
//     >
//       <option value="">-- Choose a message --</option>
//       <option value="Hello World!">Hello World</option>
//       <option value="Welcome to React">Welcome to React</option>
//       <option value="React is awesome">React is awesome</option>
//     </select>

//     <button
//       onClick={() => setDisplayedMessage(selectedMessage)}
//       disabled={!selectedMessage}
//     >
//       Show Message
//     </button>

//     {displayedMessage && (
//       <div className="message-box">{displayedMessage}</div>
//     )}
//   </div>

//   {/* Calculator */}
//   <div className="card calculator-card">
//     <h2>Calculator</h2>

//     <input
//       type="number"
//       placeholder="First number"
//       value={num1}
//       onChange={(e) => setNum1(e.target.value)}
//     />

//     <input
//       type="number"
//       placeholder="Second number"
//       value={num2}
//       onChange={(e) => setNum2(e.target.value)}
//     />

//     <button
//       onClick={calculateSum}
//       disabled={loading || num1 === "" || num2 === ""}
//     >
//       {loading ? "Calculating..." : "Calculate Sum"}
//     </button>

//     {sumResult !== null && (
//       <div className="message-box">Result: {sumResult}</div>
//     )}
//   </div>

//   {/* CSV upload */}
//   <div className="card csv-card">
//     <h2>CSV Upload</h2>

//     <input type="file" accept=".csv" onChange={handleCsvUpload} />

//     {csvLoading && <div className="message-box">Processing CSV...</div>}

//     {csvError && <div className="message-box">{csvError}</div>}
//   </div>

//   {/* Histogram */}
//   <div className="card histogram-card">
//     <h2>Bootstrap Distribution</h2>

//     {bootstrapResult && (
//       <Plot
//         data={[
//           {
//             x: bootstrapResult.distribution,
//             type: "histogram",
//             nbinsx: 30,
//           },
//         ]}
//         layout={{
//           paper_bgcolor: "rgba(0,0,0,0)",
//           plot_bgcolor: "rgba(0,0,0,0)",
//           font: { color: "#ffffff" },
//           xaxis: { title: "Mean value" },
//           yaxis: { title: "Frequency" },
//           margin: { t: 40, l: 40, r: 20, b: 40 },
//         }}
//         style={{ width: "100%", height: "90%" }}
//         config={{ responsive: true }}
//       />
//     )}
//   </div>
// </div>
//   );
return (
  <>
    {/* Navigation */}
    <nav style={{ marginBottom: "1rem" }}>
      <Link to="/" style={{ marginRight: "1rem", color: "#fff" }}>
        Home
      </Link>
      <Link to="/hello" style={{ color: "#fff" }}>
        Hello World
      </Link>
    </nav>

    <Routes>
      {/* Main dashboard */}
      <Route
        path="/"
        element={
          <div className="app-container">
            {/* Message selector */}
            <div className="card message-card">
              <h2>Message Selector</h2>

              <select
                value={selectedMessage}
                onChange={(e) => setSelectedMessage(e.target.value)}
              >
                <option value="">-- Choose a message --</option>
                <option value="Hello World!">Hello World</option>
                <option value="Welcome to React">Welcome to React</option>
                <option value="React is awesome">React is awesome</option>
              </select>

              <button
                onClick={() => setDisplayedMessage(selectedMessage)}
                disabled={!selectedMessage}
              >
                Show Message
              </button>

              {displayedMessage && (
                <div className="message-box">{displayedMessage}</div>
              )}
            </div>

            {/* Calculator */}
            <div className="card calculator-card">
              <h2>Calculator</h2>

              <input
                type="number"
                placeholder="First number"
                value={num1}
                onChange={(e) => setNum1(e.target.value)}
              />

              <input
                type="number"
                placeholder="Second number"
                value={num2}
                onChange={(e) => setNum2(e.target.value)}
              />

              <button
                onClick={calculateSum}
                disabled={loading || num1 === "" || num2 === ""}
              >
                {loading ? "Calculating..." : "Calculate Sum"}
              </button>

              {sumResult !== null && (
                <div className="message-box">Result: {sumResult}</div>
              )}
            </div>

            {/* CSV upload */}
            <div className="card csv-card">
              <h2>CSV Upload</h2>
              <input type="file" accept=".csv" onChange={handleCsvUpload} />
              {csvLoading && (
                <div className="message-box">Processing CSV...</div>
              )}
              {csvError && (
                <div className="message-box">{csvError}</div>
              )}
            </div>

            {/* Histogram */}
            <div className="card histogram-card">
              <h2>Bootstrap Distribution</h2>

              {bootstrapResult && (
                <Plot
                  data={[
                    {
                      x: bootstrapResult.distribution,
                      type: "histogram",
                      nbinsx: 30,
                    },
                  ]}
                  layout={{
                    paper_bgcolor: "rgba(0,0,0,0)",
                    plot_bgcolor: "rgba(0,0,0,0)",
                    font: { color: "#ffffff" },
                    xaxis: { title: "Mean value" },
                    yaxis: { title: "Frequency" },
                  }}
                  style={{ width: "100%", height: "100%" }}
                  config={{ responsive: true }}
                />
              )}
            </div>
          </div>
        }
      />

      {/* Hello World page */}
      <Route path="/hello" element={<HelloWorld />} />
    </Routes>
  </>
);

}

export default App;
