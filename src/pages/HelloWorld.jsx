import { useState } from "react";

function HelloWorld() {
  const [message, setMessage] = useState("");

  return (
    <div className="card">
      <h2>Hello World Page</h2>

      <button onClick={() => setMessage("Hello World!")}>
        Click me
      </button>

      {message && <div className="message-box">{message}</div>}
    </div>
  );
}

export default HelloWorld;
