import { useEffect, useState } from "react";
import axios from "axios";
import AuditTrail from "../components/AuditTrail";
import { Document, Page, pdfjs } from "react-pdf";
import api from "../api";
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
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [signatures, setSignatures] = useState([]);
  const [showPad, setShowPad] = useState(false);
  const [selectedSignature, setSelectedSignature] = useState(null);
 const [dragging, setDragging] = useState(false);
 const [auditDoc, setAuditDoc] = useState(null);
 const [auditLogs, setAuditLogs] = useState([]);
 const [showAudit, setShowAudit] = useState(false);
 const [statusFilter, setStatusFilter] = useState("all");
 const [signerName, setSignerName] = useState("");
const [signerEmail, setSignerEmail] = useState("");


console.log("SIGNATURES:", signatures);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await api.get("/api/files");
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

  const handlePdfClick = async (e,pageNumber) => {
  if (!selectedDocument) return;

  if (!signerName || !signerEmail) {
    alert("Please enter signer name and email");
    return;
  }

  const rect = e.currentTarget.getBoundingClientRect();

  const x = (e.clientX - rect.left) / rect.width;
  const y = (e.clientY - rect.top) / rect.height;

  const payload = {
    documentId: selectedDocument._id,
    x,
    y,
     pageNumber,
    signer: signerName,
    email: signerEmail,
   
  };

  console.log("🟡 CLICK EVENT");
  console.log("RECT:", rect);
  console.log("COORDS:", { x, y });
  console.log("PAYLOAD:", payload);

  try {
    await api.post("/api/signatures", payload);
    const sigRes = await api.get(
      `/api/signatures/${selectedDocument._id}`
    );
    setSignatures(sigRes.data);
    console.log("🟢 RESPONSE:", sigRes.data);
  } catch (err) {
    console.log("🔴 ERROR:", err.response?.data || err.message);
  }
};

const deleteDocument = async (id) => {
   
  try {
    const confirmDelete = window.confirm("Delete this document?");

    if (!confirmDelete) return;

    await api.delete(`/api/files/${id}`);

    // remove from UI instantly
    setDocs((prev) => prev.filter((doc) => doc._id !== id));

    // if deleted doc was selected → reset preview
    if (selectedDocument?._id === id) {
      setSelectedDocument(null);
      setSelectedFile(null);
      setSignatures([]);
    }

    alert("Document deleted");
  } catch (err) {
    console.log(err);
    alert("Delete failed");
  }
};


const handleDrop = async (e) => {
  e.preventDefault();
  
  if (!selectedDocument) return;

  const rect = e.currentTarget.getBoundingClientRect();

  
  const x = (e.clientX - rect.left) / rect.width;
 const scrollTop = window.scrollY;
  const y =
  (e.clientY - rect.top ) / rect.height;

  console.log("Dropped:", x, y);

  try {
    await api.post("/api/signatures", {
      documentId: selectedDocument._id,
      x,
      y,
      signer: signerName,
      email: signerEmail,
    });

    const sigRes = await api.get(
      `/api/signatures/${selectedDocument._id}`
    );

    setSignatures(sigRes.data);
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
        const pages = pdfDoc.getPages();

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

       const pageIndex = sig.pageNumber ?? 0;
      const page = pages[pageIndex];

      if (!page) continue; // safety check
      const { width, height } = page.getSize();

      const x = sig.x * width;
      const y = height - sig.y * height;

      page.drawImage(image, {
        x,
        y,
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
  const link = `${window.location.origin}/sign/${token}`;

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

    const res = await api.post("/api/pdf/upload-signed-pdf", {
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


const fetchAudit = async (documentId) => {
  try {
    const res = await api.get(`/api/audit/${documentId}`);

    console.log("AUDIT DATA:", res.data);
    setAuditLogs(res.data);
  } catch (err) {
    console.log(err);
  }
};



const saveSignature = async (image) => {
  console.log("SAVE CALLED");

  console.log("IMAGE RECEIVED FROM PAD:", image);
  try {
    await api.put(
      `/api/signatures/${selectedSignature._id}/sign`,
      {
        signatureImage: image,
      }
    );

    const res = await api.get(
      `/api/signatures/${selectedDocument._id}`
    );

    setSignatures(res.data);
    setShowPad(false);
  } catch (error) {
    console.log(error);
  }
};
console.log("SIGNATURES:", signatures);
console.log("showPad =", showPad);
const filteredSignatures =
  statusFilter === "all"
    ? signatures
    : signatures.filter(
        (sig) => sig.status === statusFilter
      );
  return (
    <>
<div className="flex flex-col lg:flex-row gap-5 p-5">
      
      {/* LEFT SIDE - FILE LIST */}
      <div className="w-full lg:w-2/5">
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
      const res = await api.post("/api/files/upload", formData);

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
            className="border rounded-lg p-3 mb-3 cursor-pointer hover:shadow-md transition"
            onClick={async () => {

        const pdfUrl =
  doc.url.startsWith("http")
    ? doc.url
    : `${import.meta.env.VITE_API_URL}${doc.url}`;

setSelectedFile(pdfUrl);
console.log("PDF URL:", pdfUrl);
console.log("doc.url =", doc.url);
setSelectedFile(pdfUrl);
  setSelectedDocument(doc);

  try {
    // 1️  Get signatures (if you still need them)
    const sigRes = await api.get(
      `/api/signatures/${doc._id}`
    );

    setSignatures(sigRes.data);

    // 2️  Get audit logs (NEW API)
    const auditRes = await api.get(`/api/audit/${doc._id}`);
    setAuditLogs(auditRes.data);

    setAuditLogs(auditRes.data);

  } catch (error) {
    console.log(error);
  }
}}
          >
            <h4>{doc.originalName}</h4>
            <button>Open Preview</button>
             <button
        onClick={(e) => {
          e.stopPropagation(); // IMPORTANT

          const confirmDelete = window.confirm("Delete this document?");
          if (!confirmDelete) return;

          api.delete(`/api/files/${doc._id}`)
          .then(() => {
            // remove from UI instantly
            setDocs((prev) =>
              prev.filter((item) => item._id !== doc._id)
            );

            // clear preview if same doc open
            if (selectedDocument?._id === doc._id) {
              setSelectedDocument(null);
              setSelectedFile(null);
              setSignatures([]);
            }

            alert("Deleted successfully");
          })
          .catch((err) => {
            console.log("DELETE ERROR FULL:", err);
  console.log("STATUS:", err.response?.status);
  console.log("DATA:", err.response?.data);
  alert(err.response?.data?.message || "delete failed");
          });
        }}
          className="px-3 py-1 text-sm rounded-md  text-white "
      >
        Delete
      </button>

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
     <div className="w-full lg:w-3/5"> {/* RIGHT SIDE - PDF PREVIEW */}
      
        <h2>👁️ PDF Preview</h2>

        <div className="mb-4 flex flex-col sm:flex-row gap-2">
  <input
    type="text"
    placeholder="Signer Name"
    value={signerName}
    onChange={(e) => setSignerName(e.target.value)}
    className="border p-2 rounded"
  />

  <input
    type="email"
    placeholder="Signer Email"
    value={signerEmail}
    onChange={(e) => setSignerEmail(e.target.value)}
    className="border p-2 rounded"
  />
</div>
         {/* filter dropdown */}
         <div style={{ marginBottom: "10px" }}>
  <label>Status Filter: </label>

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="all">All</option>
    <option value="pending">Pending</option>
    <option value="signed">Signed</option>
    <option value="rejected">Rejected</option>
  </select>
</div>
<hr/>
        <button
  onClick={() => setShowAudit(true)}
  style={{
    marginBottom: "10px",
    padding: "8px 12px",
    background: "purple",
    color: "white",
    border: "none",
    cursor: "pointer",
  }}
>
  View Audit Trail
</button>
        {selectedDocument && (
  <div style={{ marginTop: "20px" }}>
   
   <AuditTrail
  logs={
    Array.isArray(signatures)
      ? signatures.flatMap(sig => sig.auditTrail || [])
      : (signatures?.auditTrail || [])
  }
/>
  </div>
)}

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
   <Document file={selectedFile} onLoadSuccess={onDocumentLoadSuccess}>
  {Array.from(new Array(numPages), (el, index) => (
    <div key={index} style={{ position: "relative" }}>
      
      <Page pageNumber={index + 1} />

      {/* CLICK LAYER */}
      <div
        onClick={(e) => handlePdfClick(e, index + 1)}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
    </div>
  ))}
</Document>
   {filteredSignatures.map((sig) => {
  console.log("Rendering Signature:", sig);
  console.log("TOKEN:", sig.token);
return (
    <div


  key={sig._id}
 onClick={() => {
  if (sig.status !== "pending") return;  // ✅ ADD THIS LINE

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
  <>
    <div>Sign Here</div>

    <div
      style={{
        fontSize: "10px",
        fontWeight: "bold",
        color: "black",
      }}
    >
      {sig.signer}
    </div>
  </>
)}

{/* sign status */}
      <div style={{ fontSize: "12px",
         fontWeight: "bold",
         color:
         sig.status === "signed"
         ? "green"
         : sig.status === "rejected"
         ? "red"
         : "orange",
    }}>
    {sig.status.toUpperCase()}
  </div>
   
   {sig.status === "rejected" && sig.rejectionReason && (
  <div style={{ fontSize: "10px", color: "red", marginTop: "4px" }}>
    Reason: {sig.rejectionReason}
  </div>
)}
{/* reject button */}

{sig.status != "rejected" && (
  <button
    onClick={async (e) => {
      e.stopPropagation();
 console.log(" REJECT CLICKED"); 

 
      try {
        await api.put(
          `/api/signatures/${sig._id}/reject`,
          { reason: "No reason provided" }
        );

        const res = await api.get(
          `/api/signatures/${selectedDocument._id}`
        );

        setSignatures(res.data);
      } catch (err) {
        console.log(err);
      }
    }}
     className="text-xs px-2 py-1 bg-red-600 text-white rounded mt-1"
  >
    Delete
  </button>
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
    onClick={() => copySigningLink(signatures[signatures.length-1]?.token)}
    className="mb-2 px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"

  >
    Copy Signing Link
  </button>

  
  
)}
    <button
      onClick={downloadSignedPDF}
      className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
    >
      Download Signed PDF
    </button>

      <button
  onClick={async () => {
    try {
      const latestSig = signatures[signatures.length - 1];

      await api.post(
        `/api/signatures/${latestSig._id}/send-email`
      );

      alert("Email Sent!");
    } catch (err) {
      console.log(err);
      alert("Email Failed");
    }
  }}
  className="ml-2 mb-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
>
  Send Email
</button>

    <button
      onClick={uploadSignedPDFToCloud}
      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      Upload Signed PDF ☁️
    </button>
  </>
)}

      </div>
  </div>

  {showAudit && (
   <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-[99999]">
    <div className="w-[500px] max-h-[80vh] overflow-y-auto bg-white p-5 rounded-lg relative">
      
      {/* ❌ CLOSE BUTTON */}
      <button
        onClick={() => setShowAudit(false)}
        className="absolute right-3 top-3 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
      >
        X
      </button>

      <h3 className="text-xl font-bold mb-4">
        Audit Trail
      </h3>


      <AuditTrail logs={auditLogs} />
    </div>
  </div>
)}
  

    {showPad && (
       <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
         <div className="bg-white p-5 rounded-lg shadow-lg">
          <h3>Draw Signature</h3>

          <SignaturePad onSave={saveSignature} />

         <button
        onClick={() => setShowPad(false)}
        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
      >
        Close
      </button>
        </div>
      </div>
    )}
  </>

      );

}

export default Dashboard;