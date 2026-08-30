import React, { useEffect, useState } from "react";

export default function ProtectedImage({ src, token, alt, style }) {
  const [objectUrl, setObjectUrl] = useState("");
  useEffect(() => {
    let current = true;
    let url = "";
    if (!src || !token) return undefined;
    fetch(src, { headers: { Authorization: `Bearer ${token}` } })
      .then((response) => response.ok ? response.blob() : Promise.reject(new Error("image unavailable")))
      .then((blob) => {
        url = URL.createObjectURL(blob);
        if (current) setObjectUrl(url);
      }).catch(() => { if (current) setObjectUrl(""); });
    return () => { current = false; if (url) URL.revokeObjectURL(url); };
  }, [src, token]);
  return objectUrl ? <img src={objectUrl} alt={alt} style={style} /> : null;
}
