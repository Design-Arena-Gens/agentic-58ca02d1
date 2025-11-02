"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useBuilderStore } from "@/lib/store";

const highlightExtensions = [".py", ".pyw", ".ico", ".png", ".json", ".txt"];

export function DropZone() {
  const addFiles = useBuilderStore((state) => state.addFiles);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) {
        return;
      }
      addFiles(acceptedFiles);
    },
    [addFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/x-python": [".py", ".pyw"],
      "image/vnd.microsoft.icon": [".ico"],
      "application/json": [".json"],
      "text/plain": [".txt"],
      "application/octet-stream": [".pyd", ".dll", ".dat"]
    }
  });

  return (
    <div
      {...getRootProps()}
      className={`dropzone ${isDragActive ? "dropzone--active" : ""}`}
    >
      <input {...getInputProps()} />
      <div className="dropzone__content">
        <span className="dropzone__badge">Drag & Drop</span>
        <h3>Drop your Python entry script and assets here</h3>
        <p>
          Include your main Python file, optional dependencies, icons, and data files. The builder
          generates a ready-to-run <code>setup.py</code> for cx_Freeze.
        </p>
        <p className="dropzone__hint">
          Supported extensions: {highlightExtensions.join(", ")}
        </p>
        <button type="button" className="dropzone__button">
          Browse files
        </button>
      </div>
    </div>
  );
}
