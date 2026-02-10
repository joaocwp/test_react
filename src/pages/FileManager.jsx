import { useEffect, useState } from "react";

const API = "http://localhost:8000";

export default function FileManager() {
    const [files, setFiles] = useState([]);
    // const [file, setFile] = useState(null);
    const [selectedFile, setSelectedFile] = useState("");
    
    const fetchFiles = async () => {
        const res = await fetch(`${API}/files`);
        const data = await res.json();
        setFiles(data.files);
    };

    // const uploadfile = async () => {
    //     if (!file) return;

    //     const formData = new FormData();
    //     formData.append("file", file);

    //     try {
    //         const response = await fetch(`${API}/files`, {
    //             method: "POST",
    //             body: formData,
    //         });

    //         if (!response.ok) {
    //             throw new Error(`Request failed: ${response.status}`);
    //         }

    //         alert("File uploaded successfully!");
    //         fetchFiles(); // Refresh the file list after upload
    //     } catch (error) {
    //         console.error("Error uploading file:", error);
    //         alert("Failed to upload file.");
    //     }
    // }

    const deleteFileFunc = async () => {
        if (!selectedFile) return;

        const confirmDelete = window.confirm(
            "Are you sure you want to delete this file?"
        );
        if (!confirmDelete) return;

        try {
            const response = await fetch(`${API}/files/${selectedFile}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            alert("File deleted successfully!");
            fetchFiles(); // Refresh the file list after deletion
        } catch (error) {
            console.error("Error deleting file:", error);
            alert("Failed to delete file.");
        }
    }

    const downloadFileFunc = async () => {
        if (!selectedFile) return;

        try {
            const response = await fetch(`${API}/files/${selectedFile}`);

            if (!response.ok) {
                throw new Error(`Request failed: ${response.status}`);
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = selectedFile;
            a.click();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Error downloading file:", error);
            alert("Failed to download file.");
        }
    }

    function UploadFiles() {
        const [file, setFile] = useState(null);

        const uploadFile = async () => {
            if (!file) return;

            const formData = new FormData();
            formData.append("file", file);

            try {
                const response = await fetch(`${API}/files`, {
                    method: "POST",
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`Request failed: ${response.status}`);
                }

                alert("File uploaded successfully!");
                fetchFiles(); // Refresh the file list after upload
            } catch (error) {
                console.error("Error uploading file:", error);
                alert("Failed to upload file.");
            }
        }

        return (
            <div>
                <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setFile(e.target.files[0])} />
                <button onClick={uploadFile}>Upload File</button>
            </div>
        )
    }

    function RefreshFiles() {
        return (
            <div className="file-list">
                <button onClick={fetchFiles}>Refresh files</button>
                <ul className="file-card">
                    {files.map((f) => (
                        <li key={f}>
                            <span className="file-name">{f}</span>
                        </li>
                    ))}
                </ul>
            </div>
        )
    }

    function ManageFiles() {
        return (
            <div>
                <select className="file-select"
                    value={selectedFile}
                    onChange={(e) => setSelectedFile(e.target.value)}
                >
                    <option value="">Select file to manage</option>
                    {files.map((f) => (
                        <option key={f} value={f.replace("src/data/", "")}>
                            {f}
                        </option>
                    ))}
                </select>
                <div className="control-2btn">
                    <button className="danger" onClick={deleteFileFunc}>Delete File</button>
                    <button onClick={downloadFileFunc}>Download File</button>
                </div>
            </div>
        )  
    }

    return (
        <div className="card">
            <h2>File Manager</h2>
             <div className="controls">
                <UploadFiles />
                <RefreshFiles />
                <ManageFiles />
            </div>
        </div>
    )
}