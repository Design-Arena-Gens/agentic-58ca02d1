import { DropZone } from "@/components/DropZone";
import { FileList } from "@/components/FileList";
import { SettingsForm } from "@/components/SettingsForm";
import { BuildPanel } from "@/components/BuildPanel";

export default function Home() {
  return (
    <main className="container">
      <header className="hero">
        <div>
          <span className="hero__badge">cx_Freeze generator</span>
          <h1>Build Windows executables without touching a setup script.</h1>
          <p>
            Drop your Python project, tune a few options, and download a ready-to-run bundle that
            ships with a tailored <code>setup.py</code>, project scaffold, and build instructions.
          </p>
        </div>
      </header>

      <DropZone />

      <section className="layout">
        <div className="layout__column">
          <FileList />
          <BuildPanel />
        </div>
        <div className="layout__column">
          <SettingsForm />
        </div>
      </section>

      <footer className="footer">
        <p>
          Generated bundles are local to your browser. No file uploads leave your device. The
          project is ready for cx_Freeze 6+ and Python 3.8 or newer.
        </p>
      </footer>
    </main>
  );
}
