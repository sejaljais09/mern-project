import SignatureCanvas from "react-signature-canvas";
import { useRef } from "react";

function SignaturePad() {
  const sigRef = useRef();

  const saveSignature = () => {
    const image = sigRef.current.toDataURL();
   const saveSignature = async () => {
  const image = sigRef.current.toDataURL();

  try {
    await axios.put(
      "http://localhost:5000/api/signatures/123/sign",
      {
        signatureImage: image,
      }
    );

    alert("Signature saved!");
  } catch (err) {
    console.log(err);
  }
};
  };

  return (
    <>
      <SignatureCanvas
        ref={sigRef}
        canvasProps={{
          width: 500,
          height: 200,
          className: "border",
        }}
      />

      <button onClick={saveSignature}>
        Save Signature
      </button>
    </>
  );
}

export default SignaturePad;