import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";

function SignaturePad({ onSave }) {
  const sigRef = useRef();

  const saveSignature = () => {
    console.log("BUTTON CLICKED");

    const image = sigRef.current.toDataURL();

    console.log("IMAGE CREATED");
    onSave(image);
  };


   const handleSave = () => {
  const dataURL = canvasRef.current.toDataURL("image/png");
  onSave(dataURL);
};
  return (
    <div className="signature-wrapper">
      
      <div className="signature-canvas-box">
        <SignatureCanvas
          ref={sigRef}
          canvasProps={{
            width: 500,
            height: 200,
            className: "signature-canvas",
          }}
        />
      </div>

      <button onClick={saveSignature} className="save-btn">
        Save Signature
      </button>

    </div>
  );
}

export default SignaturePad;