import React from "react";

const AuditTrail = ({ logs = [] }) => {
  return (
    <div style={{ padding: "10px" }}>
      {logs.map((log, index) => {
        const time = log.timestamp
          ? new Date(log.timestamp).toLocaleString()
          : "N/A";

        return (
          <div
            key={index}
            style={{
              padding: "8px",
              marginBottom: "8px",
              borderLeft: "3px solid #ccc",
              background: "#f9f9f9",
              borderRadius: "5px",
              fontSize: "12px",
            }}
          >
            <div>
              <b>Action:</b> {log.action}
            </div>

            <div>
              <b>User:</b> {log.user}
            </div>

            <div>
              <b>IP:</b> {log.ip}
            </div>

            <div>
              <b>Time:</b> {time}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default AuditTrail;