import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPaste, updatePaste, getPaste, listLanguages } from "../api/pastes";
import { useToast } from "../components/ToastProvider";
import Select from "../components/Select.jsx";

export default function PasteFormPage({ edit }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [langs, setLangs] = useState([]);
  const [form, setForm] = useState({
    title: "",
    content: "",
    language_id: null,
    visibility: "public",
  });

  useEffect(() => {
    listLanguages()
      .then((data) => setLangs(Array.isArray(data) ? data : []))
      .catch(() => setLangs([]));

    if (edit && id) {
      getPaste(id).then((p) =>
        setForm({
          title: p.title || "",
          content: p.content || "",
          language_id: p.language ? p.language.id : null,
          visibility: p.visibility || "public",
        })
      );
    }
  }, [edit, id]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  }

  function setField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function parseError(err) {
    const data = err?.response?.data;
    if (!data) return err?.message || "Unknown error";
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data.join(", ");
    if (data.detail) return data.detail;
    const firstKey = Object.keys(data)[0];
    if (!firstKey) return "Unknown error";
    const val = data[firstKey];
    if (Array.isArray(val)) return `${firstKey}: ${val.join(", ")}`;
    if (typeof val === "string") return `${firstKey}: ${val}`;
    return JSON.stringify(data);
  }

  async function submit(e) {
    e.preventDefault();
    const payload = { ...form, language_id: form.language_id === "null" ? null : form.language_id };
    try {
      const saved = edit ? await updatePaste(id, payload) : await createPaste(payload);
      toast.add(edit ? "Saved" : "Created", "success");
      navigate(`/pastes/${saved.id}`);
    } catch (err) {
      const message = parseError(err) || (edit ? "Failed to save paste" : "Failed to create paste");
      toast.add(message, "error", 4000);
    }
  }

  return (
    <form onSubmit={submit} className="form-card glass-card form-editor">
      <div className="form-header">
        <h2>{edit ? "Edit paste" : "New paste"}</h2>
        <p>Add a description, code, and visibility to share with the world.</p>
      </div>
      <input name="title" placeholder="title" value={form.title} onChange={onChange} />
      <textarea name="content" rows={12} placeholder="content" value={form.content} onChange={onChange} />
      <div className="form-row">
        <label>
          <span>Language</span>
          <Select
            name="language_id"
            value={form.language_id ?? "null"}
            onChange={(val) => setField("language_id", val)}
            placeholder="Choose a language"
            options={[
              { value: "null", label: "— none —", hint: "No syntax highlighting" },
              ...(langs || []).map((l) => ({
                value: String(l.id),
                label: l.name,
              })),
            ]}
          />
        </label>
        <label>
          <span>Visibility</span>
          <Select
            name="visibility"
            value={form.visibility}
            onChange={(val) => setField("visibility", val)}
            options={[
              { value: "public", label: "public", hint: "Visible to everyone" },
              { value: "unlisted", label: "unlisted", hint: "Direct link access" },
              { value: "private", label: "private", hint: "Only you" },
            ]}
          />
        </label>
      </div>
      <button className="btn primary">{edit ? "Save" : "Create"}</button>
    </form>
  );
}
