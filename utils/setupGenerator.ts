import JSZip from "jszip";
import { BuilderFile, BuilderOptions } from "@/lib/types";

interface BuildPayload extends BuilderOptions {
  files: BuilderFile[];
}

const indent = (spaces: number, content: string) =>
  content
    .split("\n")
    .map((line) => `${" ".repeat(spaces)}${line}`)
    .join("\n");

const formatList = (items: string[], spaces = 4) => {
  if (items.length === 0) {
    return "[]";
  }

  const lines = items.map((item) => `"${item}"`);
  return "[\n" + indent(spaces, lines.join(",\n")) + "\n]";
};

const buildSetupPy = (
  payload: BuildPayload,
  entryScript: BuilderFile,
  includeFiles: string[],
  iconPath: string | null
) => {
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
  } = payload;

  const buildLines: string[] = [
    "build_exe_options = {",
    indent(
      4,
      [
        `"includes": ${formatList(includes)}`,
        `"packages": ${formatList(packages)}`,
        `"include_files": ${formatList(includeFiles)}`
      ].join(",\n")
    ),
    "}"
  ];

  if (compress) {
    buildLines.splice(
      buildLines.length - 1,
      0,
      indent(4, `"compressed": True`)
    );
  }
  if (optimize > 0) {
    buildLines.splice(
      buildLines.length - 1,
      0,
      indent(4, `"optimize": ${optimize}`)
    );
  }
  buildLines.splice(
    buildLines.length - 1,
    0,
    indent(4, `"build_exe": "${buildPath}"`)
  );

  const baseValue = base === "Win32GUI" ? '"Win32GUI"' : "None";
  const execKwargs: string[] = [
    `script="source/${entryScript.file.name}"`,
    `base=${baseValue}`,
    `target_name="${appName.replace(/\s+/g, "")}.exe"`
  ];

  if (iconPath) {
    execKwargs.push(`icon="${iconPath}"`);
  }

  return `
from cx_Freeze import Executable, setup

${buildLines.join("\n")}

executables = [
    Executable(
${indent(8, execKwargs.join(",\n"))}
    )
]

setup(
    name="${appName}",
    version="${version}",
    description="${description}",
    options={"build_exe": build_exe_options},
    executables=executables
)
`.trimStart();
};

const buildReadme = (payload: BuildPayload) => `# ${payload.appName} cx_Freeze Bundle

This package was generated with the CX Freeze Builder. Follow these steps to produce a Windows executable.

## Prerequisites

- Python 3.8+ installed and added to PATH
- pip and virtual environment tools available

## Setup Instructions

1. Create and activate a virtual environment:

   \`\`\`bash
   python -m venv .venv
   .venv\\Scripts\\activate
   \`\`\`

2. Install cx_Freeze:

   \`\`\`bash
   pip install cx_Freeze
   \`\`\`

3. Run the build:

   \`\`\`bash
   python setup.py build
   \`\`\`

The executable will be located under the \`${payload.buildPath}\` directory.

## Included Files

- Python sources in \`source/\`
- Resources in \`resources/\`
- Generated \`setup.py\`

Feel free to update \`setup.py\` with additional cx_Freeze options before building.
`;

export const generateSetupPreview = (payload: BuildPayload): string => {
  if (payload.files.length === 0) {
    return "# Add a Python file to generate a setup preview.";
  }

  const entryScript =
    payload.files.find((file) => file.id === payload.entryScriptId) ??
    payload.files.find((file) => file.category === "script");

  if (!entryScript) {
    return "# Add a Python entry script to see the generated setup.py.";
  }

  const includeFiles = payload.files
    .filter((file) => file.category !== "script")
    .map((file) => `resources/${file.file.name}`);

  const iconPath =
    payload.files.find((file) => file.category === "icon")?.file.name ?? null;

  return buildSetupPy(
    payload,
    entryScript,
    includeFiles,
    iconPath ? `resources/${iconPath}` : null
  );
};

export const buildProjectArchive = async (
  payload: BuildPayload
): Promise<Blob> => {
  if (payload.files.length === 0) {
    throw new Error("Add at least one file to build a project.");
  }

  const entryScript =
    payload.files.find((file) => file.id === payload.entryScriptId) ??
    payload.files.find((file) => file.category === "script");

  if (!entryScript) {
    throw new Error("A Python entry script is required.");
  }

  const includeFiles: string[] = [];
  let iconPath: string | null = null;
  const zip = new JSZip();
  const sourceFolder = zip.folder("source");
  const resourceFolder = zip.folder("resources");

  if (!sourceFolder || !resourceFolder) {
    throw new Error("Unable to initialise archive folders.");
  }

  for (const item of payload.files) {
    const data = await item.file.arrayBuffer();
    if (item.category === "script") {
      sourceFolder.file(item.file.name, data);
    } else {
      const folder = resourceFolder;
      folder.file(item.file.name, data);
      includeFiles.push(`resources/${item.file.name}`);
      if (item.category === "icon" && !iconPath) {
        iconPath = `resources/${item.file.name}`;
      }
    }
  }

  zip.file("setup.py", buildSetupPy(payload, entryScript, includeFiles, iconPath));
  zip.file("README.md", buildReadme(payload));
  zip.file(
    ".gitignore",
    ["*.pyc", "build/", "dist/", "__pycache__/", "*.log", "*.spec"].join("\n")
  );

  return zip.generateAsync({ type: "blob" });
};
