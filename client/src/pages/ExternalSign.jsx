import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import api from "../api";
import SignaturePad from "../components/SignaturePad";

function ExternalSign() {

  const { token } = useParams();

  const [signature, setSignature] = useState(null);

  useEffect(() => {
    fetchSignature();
  }, []);

  const fetchSignature = async () => {
  try {
    console.log("TOKEN FROM URL:", token);

    const res = await api.get(
      `/api/signatures/token/${token}`
    );

    console.log("API RESPONSE:", res.data);

    setSignature(res.data);
  } catch (err) {
    console.log(
      "FETCH ERROR:",
      err.response?.data || err.message
    );
  }
};

  const saveSignature = async (image) => {
    try {
      await api.put(
        `/api/signatures/${signature._id}/sign`,
        {
          signatureImage: image,
        }
      );

      alert("Signature Submitted Successfully");
    } catch (err) {
      console.log(err);
    }
  };

  if (!signature) {
    return <h2>Loading...</h2>;
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2>Sign Document</h2>

      <p>Signer: {signature.signer}</p>

      <SignaturePad onSave={saveSignature} />
    </div>
  );
}

export default ExternalSign;