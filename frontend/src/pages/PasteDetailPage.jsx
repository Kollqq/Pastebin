import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getPaste, deletePaste, addStar } from "../api/pastes";

export default function PasteDetailPage() {
  const { id } = useParams();
  const [paste, setPaste] = useState(null);
  const navigate = useNavigate();

  useEffect(()=>{
    getPaste(id).then(setPaste).catch(()=>setPaste(null));
  },[id]);

  if (!paste) return <div>Not found</div>;

  async function star() {
    try { await addStar(paste.id); alert("Added to stars"); }
    catch { alert("Already in stars or error"); }
  }

  async function remove() {
    if (!confirm("Delete paste?")) return;
    await deletePaste(paste.id);
    navigate("/");
  }

  const isOwner = !!localStorage.getItem("access") && paste.owner === undefined;

  return (
    <div>
      <h2>{paste.title || `Paste #${paste.id}`}</h2>
      <p><b>Language:</b> {paste.language?.name || "—"}</p>
      <p><b>Visibility:</b> {paste.visibility}</p>
      <pre style={{ background:"#f6f6f6", padding:12, whiteSpace:"pre-wrap" }}>{paste.content}</pre>
      <button onClick={star}>☆ Add to stars</button>{" "}
      <Link to={`/edit/${paste.id}`}>Edit</Link>{" "}
      <button onClick={remove}>Delete</button>
    </div>
  );
}
