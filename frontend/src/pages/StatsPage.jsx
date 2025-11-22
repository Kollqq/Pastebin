import React, { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { getMonthlyStats } from "../api/pastes";
import Spinner from "../components/Spinner";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";

function ym(d){ return dayjs(d).format("YYYY-MM"); }

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function MonthPicker({ label, value, onChange }){
  const [open, setOpen] = useState(false);
  const [panelYear, setPanelYear] = useState(dayjs(value).year());
  const wrapperRef = useRef(null);

  useEffect(() => {
    setPanelYear(dayjs(value).year());
  }, [value]);

  useEffect(() => {
    function handleOutside(event){
      if(wrapperRef.current && !wrapperRef.current.contains(event.target)){
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  function selectMonth(index){
    const nextValue = ym(dayjs().year(panelYear).month(index).startOf("month"));
    onChange(nextValue);
    setOpen(false);
  }

  return (
    <div className="month-picker" ref={wrapperRef}>
      <div className="month-picker-header">
        <div className="month-picker-label">{label}</div>
        <button
          type="button"
          className="month-picker-trigger"
          onClick={() => setOpen((s) => !s)}
          aria-expanded={open}
          aria-label={`${label}: ${dayjs(value).format("MMMM YYYY")}`}
        >
          <span>{dayjs(value).format("MMM YYYY")}</span>
          <span className="month-picker-caret">▾</span>
        </button>
      </div>

      {open && (
        <div className="month-picker-panel glass-card">
          <div className="month-picker-nav">
            <button type="button" onClick={() => setPanelYear((y) => y - 1)} aria-label="Previous year">←</button>
            <div className="month-picker-year">{panelYear}</div>
            <button type="button" onClick={() => setPanelYear((y) => y + 1)} aria-label="Next year">→</button>
          </div>
          <div className="month-picker-grid">
            {MONTHS.map((m, i) => {
              const active = dayjs(value).year() === panelYear && dayjs(value).month() === i;
              return (
                <button
                  key={m}
                  type="button"
                  className={active ? "month-pill active" : "month-pill"}
                  onClick={() => selectMonth(i)}
                >
                  {m}
                </button>
              );
            })}
          </div>
          <div className="month-picker-actions">
            <button type="button" className="btn ghost" onClick={() => setOpen(false)}>Close</button>
            <button type="button" className="btn subtle" onClick={() => selectMonth(dayjs().month())}>This month</button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatsTooltip({ active, payload, label }){
  if(!active || !payload || payload.length === 0){ return null; }

  const pastes = payload.find((p) => p.dataKey === "pastes")?.value ?? 0;
  const views = payload.find((p) => p.dataKey === "views")?.value ?? 0;

  return (
    <div className="stats-tooltip glass-card">
      <div className="stats-tooltip-header">{dayjs(label).format("MMMM YYYY")}</div>
      <dl>
        <div>
          <dt>Pastes</dt>
          <dd>{pastes}</dd>
        </div>
        <div>
          <dt>Views</dt>
          <dd>{views}</dd>
        </div>
      </dl>
    </div>
  );
}

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
          <h1>Statistics</h1>
          <p className="page-subtitle">Analyze activity for your selected period.</p>
        </div>
      </div>

      <form onSubmit={onSubmit} className="stats-filter glass-card">
        <MonthPicker
          label="Start"
          value={start}
          onChange={setStart}
        />
        <MonthPicker
          label="End"
          value={end}
          onChange={setEnd}
        />
        <button className="btn primary stats-submit">Apply</button>
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
              <XAxis dataKey="month" tickFormatter={(v) => dayjs(v).format("MMM 'YY")} />
              <YAxis allowDecimals={false} />
              <Tooltip content={<StatsTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="pastes" name="Pastes" strokeWidth={2} stroke="var(--accent-strong)" />
              <Line type="monotone" dataKey="views"  name="Views"  strokeWidth={2} stroke="#f97316" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}
