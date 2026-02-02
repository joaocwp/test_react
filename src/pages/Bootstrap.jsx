import { useState, useMemo } from "react";
import Plot from "react-plotly.js";

function percentile(sorted, p) {
  const idx = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(idx);
  const upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  return (
    sorted[lower] +
    (sorted[upper] - sorted[lower]) * (idx - lower)
  );
}

export default function Bootstrap() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(
        "http://localhost:8000/bootstrap/csv?n_bootstrap=1000",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // --- Extract distribution ---
  const distribution = result?.distribution;

  // --- Compute 95% CI ---
  const ci = useMemo(() => {
    if (!distribution?.length) return null;

    const sorted = [...distribution].sort((a, b) => a - b);
    return {
      lower: percentile(sorted, 2.5),
      upper: percentile(sorted, 97.5),
    };
  }, [distribution]);

console.log("test result:", Math.max.apply(Math, distribution));
  return (
    <div className="card">
      <h1>Bootstrap CSV</h1>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button type="submit" disabled={!file || loading}>
          {loading ? "Processing..." : "Upload & Bootstrap"}
        </button>
      </form>

      {error && <p style={{ color: "salmon" }}>{error}</p>}

      {distribution && (
        <>
          <h2>Bootstrap Distribution</h2>
          <Plot
            data={[
              {
                x: distribution,
                type: "histogram",
                nbinsx: 30,
                marker: {
                  color: "#e4630d",
                  line: { width: 0 },
                  opacity: 0.5,
                }
              },

             
            ].filter(Boolean)}
            layout={{
                    autosize: true,
                    paper_bgcolor: "#020617",
                    plot_bgcolor: "#020617",
                    font: { color: "#e5e7eb" },
                    margin: { t: 20, l: 40, r: 20, b: 40 },
                    xaxis: { title: "Value" },
                    yaxis: {
                        title: "Frequency",
                        rangemode: "tozero",
                    },
                    bargap: 0.1,
                    shapes: ci
                        ? [
                            {
                            type: "line",
                            x0: ci.lower,
                            x1: ci.lower,
                            y0: 0,
                            y1: 1,
                            yref: "paper",
                            line: {
                                dash: "dash",
                                width: 2,
                                color: "#ec0f0f",
                            },
                            },
                            {
                            type: "line",
                            x0: ci.upper,
                            x1: ci.upper,
                            y0: 0,
                            y1: 1,
                            yref: "paper",
                            line: {
                                dash: "dash",
                                width: 2,
                                color: "#ec0f0f",
                            },
                            },
                        ]
                        : [],
                    }}

            style={{ width: "100%", height: "320px" }}
            useResizeHandler
            config={{ displayModeBar: false }}
          />
        </>
      )}
    </div>
  );
}
