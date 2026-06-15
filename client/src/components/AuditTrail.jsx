import React from "react";

const AuditTrail = ({ logs = [] }) => {
  return (
    <div>
      {logs.map((log, index) => {
        const safeDate = log.createdAt
          ? new Date(log.createdAt).toLocaleString()
          : "N/A";

        return (
          <div key={index} style={{ marginBottom: "15px" }}>
            <div>User: {log.user || "Unknown"}</div>
            <div>Email: {log.email || "N/A"}</div>
            <div>IP: {log.ip || "N/A"}</div>
            <div>Action: {log.action || "N/A"}</div>

            <div>
              Time: {safeDate}
            </div>

            <hr />
          </div>
        );
      })}
    </div>
  );
};

export default AuditTrail;