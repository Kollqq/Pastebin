import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createPaste, updatePaste, getPaste, listLanguages } from "../api/pastes";
import { useToast } from "../components/ToastProvider";

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

  async function submit(e) {
    e.preventDefault();
    const payload = { ...form, language_id: form.language_id === "null" ? null : form.language_id };
    const saved = edit ? await updatePaste(id, payload) : await createPaste(payload);
    toast.add(edit ? "Saved" : "Created", "success");
    navigate(`/pastes/${saved.id}`);
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
      <h2>{edit ? "Edit paste" : "New paste"}</h2>
      <input name="title" placeholder="title" value={form.title} onChange={onChange} />
      <textarea name="content" rows={10} placeholder="content" value={form.content} onChange={onChange} />
      <label>
        Language:
        <select name="language_id" value={form.language_id ?? "null"} onChange={onChange}>
          <option value="null">— none —</option>
          {(langs || []).map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </label>
      <label>
        Visibility:
        <select name="visibility" value={form.visibility} onChange={onChange}>
          <option value="public">public</option>
          <option value="unlisted">unlisted</option>
          <option value="private">private</option>
        </select>
      </label>
      <button className="btn primary">{edit ? "Save" : "Create"}</button>
    </form>
  );
}
