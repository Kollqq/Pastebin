import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getMonthlyStats } from "../api/pastes";
import Spinner from "../components/Spinner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

function ym(d){ return dayjs(d).format("YYYY-MM"); }

export default function StatsPage(){
  const endDefault = dayjs();
  const startDefault = endDefault.subtract(5, "month");

  const [start, setStart] = useState(ym(startDefault));
  const [end, setEnd] = useState(ym(endDefault));
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load(){
    try{
      setLoading(true); setErr("");
      const res = await getMonthlyStats({ start, end });
      setData([...res].sort((a,b)=> a.month.localeCompare(b.month)));
    }catch(e){
      console.error(e); setErr("Failed to load statistics");
      setData([]);
    }finally{ setLoading(false); }
  }

  useEffect(()=>{ load(); }, []);

  function onSubmit(e){ e.preventDefault(); load(); }

  return (
    <div>
      <h2>Monthly stats</h2>

      <form onSubmit={onSubmit} style={{display: "flex", gap: 12, alignItems: "center", marginBottom: 16}}>
        <label>Start:
          <input type="month" value={start} onChange={(e) => setStart(e.target.value)}/>
        </label>
        <label>End:
          <input type="month" value={end} onChange={(e) => setEnd(e.target.value)}/>
        </label>
        <button className="btn">Apply</button>
      </form>

      {err && <div style={{color: "red", marginBottom:12}}>{err}</div>}
      {loading ? <Spinner /> : data.length === 0 ? (
        <div>No data for the selected period</div>
      ) : (
        <div style={{width:"100%", height:360}}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pastes" name="Pastes" strokeWidth={2} />
              <Line type="monotone" dataKey="views"  name="Views"  strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
