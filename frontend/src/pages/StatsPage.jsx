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
    <section className="page">
      <div className="page-header">
        <div>
          <h1>Статистика</h1>
          <p className="page-subtitle">Анализируйте активность за выбранный период.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="stats-filter glass-card">
        <label>
          <span>Start</span>
          <input type="month" value={start} onChange={(e) => setStart(e.target.value)}/>
        </label>
        <label>
          <span>End</span>
          <input type="month" value={end} onChange={(e) => setEnd(e.target.value)}/>
        </label>
        <button className="btn primary">Apply</button>
      </form>

      {err && <div className="form-error" style={{ textAlign: "left" }}>{err}</div>}

      {loading ? (
        <div className="page-loading">
          <Spinner size={32} />
        </div>
      ) : data.length === 0 ? (
        <div className="empty-card glass-card">No data for the selected period</div>
      ) : (
        <div className="chart-card glass-card">
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
    </section>
  );
}
