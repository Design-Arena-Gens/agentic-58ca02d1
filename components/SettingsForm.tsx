"use client";

import { useMemo, useState } from "react";
import { useBuilderStore } from "@/lib/store";

const parseList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export function SettingsForm() {
  const {
    appName,
    description,
    version,
    base,
    includes,
    packages,
    compress,
    optimize,
    buildPath
  } = useBuilderStore((state) => state);
  const updateOptions = useBuilderStore((state) => state.updateOptions);

  const [includeText, packageText] = useMemo(
    () => [includes.join(", "), packages.join(", ")],
    [includes, packages]
  );

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="panel">
      <header className="panel__header">
        <h3>Build Options</h3>
        <button
          type="button"
          className="panel__toggle"
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? "Hide advanced" : "Show advanced"}
        </button>
      </header>

      <div className="form-grid">
        <label>
          <span>Application name</span>
          <input
            value={appName}
            onChange={(event) => updateOptions({ appName: event.target.value })}
            placeholder="MyApplication"
          />
        </label>
        <label>
          <span>Version</span>
          <input
            value={version}
            onChange={(event) => updateOptions({ version: event.target.value })}
            placeholder="1.0.0"
          />
        </label>
        <label className="form-grid__full">
          <span>Description</span>
          <input
            value={description}
            onChange={(event) => updateOptions({ description: event.target.value })}
            placeholder="Executable built with cx_Freeze."
          />
        </label>
        <label>
          <span>Target base</span>
          <select
            value={base}
            onChange={(event) =>
              updateOptions({
                base: event.target.value === "Win32GUI" ? "Win32GUI" : "Console"
              })
            }
          >
            <option value="Console">Console (default)</option>
            <option value="Win32GUI">Win32 GUI (hide console window)</option>
          </select>
        </label>
        <label>
          <span>Build directory</span>
          <input
            value={buildPath}
            onChange={(event) => updateOptions({ buildPath: event.target.value })}
            placeholder="build"
          />
        </label>
      </div>

      {expanded && (
        <div className="form-grid form-grid--advanced">
          <label className="form-grid__full">
            <span>Include modules</span>
            <input
              value={includeText}
              onChange={(event) => updateOptions({ includes: parseList(event.target.value) })}
              placeholder="module_a, module_b"
            />
          </label>
          <label className="form-grid__full">
            <span>Packages</span>
            <input
              value={packageText}
              onChange={(event) => updateOptions({ packages: parseList(event.target.value) })}
              placeholder="package_a, package_b"
            />
          </label>
          <label>
            <span>Compression</span>
            <div className="toggle">
              <input
                type="checkbox"
                checked={compress}
                onChange={(event) => updateOptions({ compress: event.target.checked })}
              />
              <span>{compress ? "Enabled" : "Disabled"}</span>
            </div>
          </label>
          <label>
            <span>Bytecode optimisation</span>
            <select
              value={optimize}
              onChange={(event) =>
                updateOptions({ optimize: Number(event.target.value) as 0 | 1 | 2 })
              }
            >
              <option value={0}>Level 0 (default)</option>
              <option value={1}>Level 1</option>
              <option value={2}>Level 2</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
