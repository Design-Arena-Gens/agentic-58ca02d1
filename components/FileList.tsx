"use client";

import { useMemo } from "react";
import { useBuilderStore } from "@/lib/store";
import { BuilderFile } from "@/lib/types";

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

export function FileList() {
  const files = useBuilderStore((state) => state.files);
  const entryScriptId = useBuilderStore((state) => state.entryScriptId);
  const updateOptions = useBuilderStore((state) => state.updateOptions);
  const removeFile = useBuilderStore((state) => state.removeFile);

  const firstScript = useMemo(
    () => files.find((file) => file.category === "script"),
    [files]
  );

  if (!files.length) {
    return (
      <div className="panel panel--muted">
        <h4>No files yet</h4>
        <p>Drop at least one Python script to set the entry point.</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <header className="panel__header">
        <h3>Project Files</h3>
        <span className="panel__chip">{files.length} item(s)</span>
      </header>
      <ul className="file-list">
        {files.map((file: BuilderFile) => (
          <li key={file.id} className="file-item">
            <div className="file-item__meta">
              <span className={`file-item__badge file-item__badge--${file.category}`}>
                {file.category}
              </span>
              <strong>{file.file.name}</strong>
              <small>{formatBytes(file.file.size)}</small>
            </div>
            <div className="file-item__actions">
              {file.category === "script" && (
                <label className="file-item__radio">
                  <input
                    type="radio"
                    name="entry-script"
                    checked={entryScriptId ? entryScriptId === file.id : firstScript?.id === file.id}
                    onChange={() => updateOptions({ entryScriptId: file.id })}
                  />
                  Entry script
                </label>
              )}
              <button
                type="button"
                className="file-item__remove"
                onClick={() => removeFile(file.id)}
              >
                Remove
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
