import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPaste, deletePaste, addStar } from "../api/pastes";
import { useToast } from "../components/ToastProvider";
import hljs from "highlight.js";

const HL_MAP = {
  python: "python", javascript: "javascript", js: "javascript",
  typescript: "typescript", ts: "typescript",
  c: "c", cpp: "cpp", "c++": "cpp", java: "java", go: "go",
  rust: "rust", ruby: "ruby", php: "php", kotlin: "kotlin",
  swift: "swift", bash: "bash", shell: "bash", sql: "sql",
  html: "xml", xml: "xml", css: "css", json: "json",
  yaml: "yaml", yml: "yaml",
};

const EXT_MAP = {
  python: "py", javascript: "js", js: "js", typescript: "ts", ts: "ts",
  c: "c", cpp: "cpp", "c++": "cpp", java: "java", go: "go",
  rust: "rs", ruby: "rb", php: "php", kotlin: "kt", swift: "swift",
  bash: "sh", shell: "sh", sql: "sql", html: "html", xml: "xml",
  css: "css", json: "json", yaml: "yml", yml: "yml",
};
const extFromLang = (name) => EXT_MAP[(name || "").toLowerCase()] || "txt";

export default function PasteDetailPage() {
  const { id } = useParams();
  const [paste, setPaste] = useState(null);
  const [wrap, setWrap] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();
  const codeRef = useRef(null);

  useEffect(() => {
    getPaste(id).then(setPaste).catch(() => setPaste(null));
  }, [id]);

  const hlLang = useMemo(() => {
    const name = paste?.language?.name?.toLowerCase?.();
    return (name && HL_MAP[name]) || null;
  }, [paste]);

  useEffect(() => {
    if (!paste || !codeRef.current) return;
    if (hlLang) codeRef.current.className = `language-${hlLang}`;
    hljs.highlightElement(codeRef.current);
  }, [paste, hlLang]);

  if (!paste) return <div>Not found</div>;

  async function star() {
    try {
      await addStar(paste.id);
      toast.add("Added to stars", "success");
    } catch {
      toast.add("Already in stars or error", "error");
    }
  }

  async function remove() {
    if (!confirm("Delete paste?")) return;
    await deletePaste(paste.id);
    toast.add("Paste deleted", "success");
    navigate("/");
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(paste.content || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.add("Clipboard error", "error");
    }
  }

  function download() {
    const blob = new Blob([paste.content || ""], { type: "text/plain;charset=utf-8" });
    const a = document.createElement("a");
    const ext = extFromLang(paste?.language?.name);
    const base = paste.title?.trim() || `paste_${paste.id}`;
    a.href = URL.createObjectURL(blob);
    a.download = `${base.replace(/[^\w.-]+/g, "_")}.${ext}`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
      <div>
        <h2>{paste.title || `Paste #${paste.id}`}</h2>
        <p><b>Language:</b> {paste.language?.name || "—"}</p>
        <p><b>Visibility:</b> {paste.visibility}</p>

        <div className="codebar">
          <button onClick={copy} className="btn" aria-label="Copy code">
            {copied ? "Copied!" : "Copy"}
          </button>
          <button onClick={() => setWrap((w) => !w)} className="btn" aria-label="Toggle wrap">
            {wrap ? "Disable wrap" : "Enable wrap"}
          </button>
          <button onClick={download} className="btn" aria-label="Download code">Download</button>
          <span style={{marginLeft: 8, color: "#666"}}>
            {hlLang ? `highlight: ${hlLang}` : "auto-detect"}
          </span>
        </div>

        <pre className="codebox" style={{whiteSpace: wrap ? "pre-wrap" : "pre"}}>
        <code ref={codeRef}>{paste.content}</code>
      </pre>

        <button onClick={star} className="btn" aria-label="Add to stars">☆ Add to stars</button>{" "}
        <Link to={`/edit/${paste.id}`}>Edit</Link>{" "}
        <button onClick={remove} className="btn" aria-label="Delete paste">Delete</button>
      </div>
  );
}
