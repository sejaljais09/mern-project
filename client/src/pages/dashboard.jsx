import { useEffect, useState } from "react";
import axios from "axios";

import { Document, Page, pdfjs } from "react-pdf";

import "react-pdf/dist/Page/TextLayer.css";
import "react-pdf/dist/Page/AnnotationLayer.css";
import SignaturePad from "../components/SignaturePad";
// PDF worker setup
import { PDFDocument } from "pdf-lib";
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url).toString();



  function base64ToUint8Array(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);

  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return bytes;
}


function Dashboard() {
  const [docs, setDocs] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [signatures, setSignatures] = useState([]);
 const [showPad, setShowPad] = useState(false);
const [selectedSignature, setSelectedSignature] = useState(null);
  const [dragging, setDragging] = useState(false);
console.log("SIGNATURES:", signatures);

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
  if (!selectedDocument) return;

  const rect = e.currentTarget.getBoundingClientRect();

  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  const payload = {
    documentId: selectedDocument._id,
    x,
    y,
    signer: "John Doe",
    email: "john@example.com",
  };

  console.log("🟡 CLICK EVENT");
  console.log("RECT:", rect);
  console.log("COORDS:", { x, y });
  console.log("PAYLOAD:", payload);

  try {
    const res = await axios.post(
      "http://localhost:5000/api/signatures",
      payload,
       
    );
setSignatures(res.data);
    console.log("🟢 RESPONSE:", res.data);
  } catch (err) {
    console.log("🔴 ERROR:", err.response?.data || err.message);
  }
};

const handleDrop = async (e) => {
  e.preventDefault();
  
  if (!selectedDocument) return;

  const rect = e.currentTarget.getBoundingClientRect();

  
  const x = (e.clientX - rect.left) / rect.width;
 const scrollTop = window.scrollY;
  const y =
  (e.clientY - rect.top +scrollTop) / rect.height;

  console.log("Dropped:", x, y);

  try {
    await axios.post("http://localhost:5000/api/signatures", {
      documentId: selectedDocument._id,
      x,
      y,
      signer: "John Doe",
      email: "john@example.com",
    });

    const res = await axios.get(
      `http://localhost:5000/api/signatures/${selectedDocument._id}`
    );

    setSignatures(res.data);
  } catch (error) {
    console.log(error);
  }
};




const downloadSignedPDF = async () => {
  try {
    const existingPdfBytes = await fetch(selectedFile).then(res =>
      res.arrayBuffer()
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    for (const sig of signatures) {
      if (!sig.signatureImage) continue;

      // ✅ clean base64
      const base64 = sig.signatureImage.split(",")[1];

      const imageBytes = Uint8Array.from(atob(base64), c =>
        c.charCodeAt(0)
      );

      let embeddedImage;

      try {
        embeddedImage = await pdfDoc.embedPng(imageBytes);
      } catch (err) {
        embeddedImage = await pdfDoc.embedJpg(imageBytes);
      }

      // ✅ IMPORTANT: clamp coordinates
      const x = Math.max(0, Math.min(1, sig.x));
      const y = Math.max(0, Math.min(1, sig.y));

      page.drawImage(embeddedImage, {
        x: x * width,
        y: height - y * height,
        width: 120,
        height: 50,
      });
    }

    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: "application/pdf" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "signed-document.pdf";
    link.click();

  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);
  }
};

const copySigningLink = (token) => {
  console.log("copying token",token);
  const link = `http://localhost:5173/sign/${token}`;

  navigator.clipboard.writeText(link);

  alert("Signing link copied!");
};


const uploadSignedPDFToCloud = async () => {
  try {
    const existingPdfBytes = await fetch(selectedFile).then(res =>
      res.arrayBuffer()
    );

    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const page = pdfDoc.getPages()[0];
    const { width, height } = page.getSize();

    for (const sig of signatures) {
      if (!sig.signatureImage) continue;

      const base64 = sig.signatureImage.split(",")[1];

      const imageBytes = Uint8Array.from(atob(base64), c =>
        c.charCodeAt(0)
      );

      let image;

      try {
        image = await pdfDoc.embedPng(imageBytes);
      } catch {
        image = await pdfDoc.embedJpg(imageBytes);
      }

      page.drawImage(image, {
        x: sig.x * width,
        y: height - sig.y * height,
        width: 120,
        height: 50,
      });
    }

    const pdfBytes = await pdfDoc.save();

    const base64Pdf = btoa(
      new Uint8Array(pdfBytes).reduce(
        (data, byte) => data + String.fromCharCode(byte),
        ""
      )
    );

    const res = await axios.post("http://localhost:5000/api/pdf/upload-signed-pdf", {
      pdfBase64: base64Pdf,
    });

    console.log("☁️ Uploaded:", res.data);

    alert("Uploaded to Cloud Successfully!");
 } catch (err) {
  console.log("FULL ERROR:", err);
  console.log("RESPONSE:", err.response);
  console.log("DATA:", err.response?.data);

  alert(
    err.response?.data?.error ||
    err.response?.data?.message ||
    "Upload Failed"
  );
}
};



const saveSignature = async (image) => {
  console.log("SAVE CALLED");

  console.log("IMAGE RECEIVED FROM PAD:", image);
  try {
    await axios.put(
      `http://localhost:5000/api/signatures/${selectedSignature._id}/sign`,
      {
        signatureImage: image,
      }
    );

    const res = await axios.get(
      `http://localhost:5000/api/signatures/${selectedDocument._id}`
    );

    setSignatures(res.data);
    setShowPad(false);
  } catch (error) {
    console.log(error);
  }
};
console.log("SIGNATURES:", signatures);
console.log("showPad =", showPad);
  return (
    <>
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      
      {/* LEFT SIDE - FILE LIST */}
      <div style={{ width: "40%" }}>
        <h2>📂 Files</h2>
        <input
  type="file"
  accept=".pdf"
  onChange={async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/files/upload",
        formData
      );

      alert("PDF Uploaded Successfully");

      setDocs((prev) => [...prev, res.data.file]);
    } catch (err) {
  console.log("UPLOAD ERROR:", err);
  console.log("RESPONSE:", err.response?.data);
  alert("Upload Failed");
}
  }}
/>

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
  onDragStart={(e) => {
    setDragging(true);

    // 🚫 prevents ugly default red/ghost drag preview
    const img = new Image();
    e.dataTransfer.setDragImage(img, 0, 0);
  }}
  onDragEnd={() => setDragging(false)}
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
    minHeight: "800px",
    border: "3px solid blue"
  }}
>
    <Document file={selectedFile}  onLoadSuccess={onDocumentLoadSuccess}
    >
        {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={index}
                pageNumber={index + 1}
              />
            ))}
          </Document>
   {signatures.map((sig) => {
  console.log("Rendering Signature:", sig);
  console.log("TOKEN:", sig.token);
return (
    <div


  key={sig._id}
  onClick={() => {
  setSelectedSignature(sig);
  setShowPad(true);
}}
  style={{
    position: "absolute",
    left: `${sig.x * 100}%`,
    top: `${sig.y * 100}%`,
    transform: "translate(-50%, -50%)",
    width: "120px",
    height: "40px",
    border: "2px dashed red",
    backgroundColor: "yellow",
    textAlign: "center",
    lineHeight: "40px",
    cursor: "pointer",
    zIndex: 2,
  }}
  
  
>
  {sig.signatureImage ? (
      <img
        src={sig.signatureImage}
        alt="signature"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
      />
    ) : (
  "Sign Here"
    )}
</div>


  );
})}
           </div>
        ) : (
          <p>Select a file to preview</p>
        )}

        
    {selectedFile && (
  <>

  {signatures.length > 0 && (
  <button
    onClick={() => copySigningLink(signatures[0].token)}
    style={{
      marginBottom: "10px",
      padding: "8px 12px",
      background: "orange",
      color: "white",
      border: "none",
      cursor: "pointer",
    }}
  >
    Copy Signing Link
  </button>
)}
    <button
      onClick={downloadSignedPDF}
      style={{
        marginTop: "15px",
        padding: "10px 15px",
        background: "green",
        color: "white",
        border: "none",
        cursor: "pointer",
      }}
    >
      Download Signed PDF
    </button>

    <button
      onClick={uploadSignedPDFToCloud}
      style={{
        marginTop: "10px",
        padding: "10px 15px",
        background: "blue",
        color: "white",
        border: "none",
        cursor: "pointer",
      }}
    >
      Upload Signed PDF ☁️
    </button>
  </>
)}

      </div>
  </div>
  

    {showPad && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 9999,
        }}
      >
        <div
          style={{
            background: "white",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <h3>Draw Signature</h3>

          <SignaturePad onSave={saveSignature} />

          <button onClick={() => setShowPad(false)}>
            Close
          </button>
        </div>
      </div>
    )}
  </>

      );

}

export default Dashboard;