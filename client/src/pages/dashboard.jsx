import { useEffect, useState } from "react";
import axios from "axios";

import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";

// PDF worker setup
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [dragging, setDragging] = useState(false);


  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/files");
        setDocs(res.data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchDocuments();
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const handlePdfClick = async (e) => {
    console.log("PDF clicked"); 
  if (!selectedDocument) return;

  const rect = e.currentTarget.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  console.log("Clicked:", x, y);

  try {
    await axios.post("http://localhost:5000/api/signatures", {
      documentId: selectedDocument._id,
      x,
      y,
      signer: "John Doe",
      email:"john@example.com",
    });

    alert("Signature position saved");
  } catch (error) {
    console.log(error);
  }
};
const handleDrop = async (e) => {
  e.preventDefault();

  if (!selectedDocument) return;

  const rect = e.currentTarget.getBoundingClientRect();

  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  console.log("Dropped:", x, y);

  try {
    await axios.post("http://localhost:5000/api/signatures", {
      documentId: selectedDocument._id,
      x,
      y,
      signer: "John Doe",
      email: "john@example.com",
    });

    alert("Signature field placed");
    const res = await axios.get(
  `http://localhost:5000/api/signatures/${selectedDocument._id}`
);

setSignatures(res.data);

  } catch (error) {
    console.log(error);
  }
};


  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      
      {/* LEFT SIDE - FILE LIST */}
      <div style={{ width: "40%" }}>
        <h2>📂 Files</h2>

        {docs.map((doc) => (
          <div
            key={doc._id}
            style={{
              border: "1px solid #ddd",
              padding: "10px",
              marginBottom: "10px",
              cursor: "pointer",
            }}
            onClick={async () => {
  setSelectedFile(doc.url);
  setSelectedDocument(doc);

  try {
    const res = await axios.get(
      `http://localhost:5000/api/signatures/${doc._id}`
    );

    setSignatures(res.data);
  } catch (error) {
    console.log(error);
  }
}}
          >
            <h4>{doc.originalName}</h4>
            <button>Open Preview</button>
          </div>
        ))}
      </div>

      <div
  draggable
  onDragStart={() => setDragging(true)}
  style={{
    width: "120px",
    padding: "10px",
    border: "2px solid blue",
    cursor: "grab",
    textAlign: "center",
    marginBottom: "10px",
  }}
>
  Sign Here
</div>

      {/* RIGHT SIDE - PDF PREVIEW */}
      <div style={{ width: "60%" }}>
        <h2>👁️ PDF Preview</h2>

       {selectedFile ? (
  <div
    
  onDragOver={(e) => e.preventDefault()}
  onDrop={handleDrop}
    style={{
      position: "relative",
      cursor: "crosshair",
    }}
 > 
    <Document
      file={selectedFile}
      onLoadSuccess={onDocumentLoadSuccess}
    >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={index}
                pageNumber={index + 1}
              />
            ))}
          </Document>
          {signatures.map((sig) => (
  <div
    key={sig._id}
    style={{
      position: "absolute",
      left: `${sig.x}px`,
      top: `${sig.y}px`,
      width: "120px",
      height: "40px",
      border: "2px dashed red",
      backgroundColor: "white",
      textAlign: "center",
      lineHeight: "40px",
      fontWeight: "bold",
      zIndex: 999,
    }}
  >
    Sign Here
  </div>
))}
           </div>
        ) : (
          <p>Select a file to preview</p>
        )}
      </div>
  </div>
  
      );
}

export default Dashboard;