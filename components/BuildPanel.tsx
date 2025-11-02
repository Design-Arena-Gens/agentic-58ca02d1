"use client";

import { useMemo, useState } from "react";
import { useBuilderStore } from "@/lib/store";
import { buildProjectArchive, generateSetupPreview } from "@/utils/setupGenerator";

const sanitizeName = (name: string) =>
  name
    .replace(/[^a-z0-9]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "cx-freeze-bundle";

export function BuildPanel() {
  const state = useBuilderStore((builder) => builder);
  const [status, setStatus] = useState<"idle" | "success" | "error" | "building">("idle");
  const [message, setMessage] = useState<string>("");

  const preview = useMemo(() => generateSetupPreview(state), [state]);

  const handleBuild = async () => {
    setStatus("building");
    setMessage("Generating project archive…");
    try {
      const blob = await buildProjectArchive(state);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${sanitizeName(state.appName)}-cx-freeze.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setStatus("success");
      setMessage("Archive generated successfully. Check your downloads folder.");
    } catch (error: unknown) {
      const text = error instanceof Error ? error.message : "Unknown error";
      setStatus("error");
      setMessage(text);
    }
  };

  return (
    <div className="panel">
      <header className="panel__header">
        <h3>Build & Preview</h3>
        <button
          type="button"
          className="primary"
          onClick={handleBuild}
          disabled={status === "building"}
        >
          {status === "building" ? "Building…" : "Generate Bundle"}
        </button>
      </header>
      <div className="preview">
        <pre>
          <code>{preview}</code>
        </pre>
      </div>
      {status !== "idle" && (
        <div className={`status status--${status}`}>
          <span>{message}</span>
        </div>
      )}
    </div>
  );
}
