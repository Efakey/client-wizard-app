import React from 'react'
import { jsPDF } from 'jspdf'
import { brandStyles, BRAND } from './theme'
import './styles.css'

type Child = { name?: string; age?: number; sex?: string }
type LifePolicy = { company?: string; deathBenefit?: number; cashValue?: number; beneficiary?: string }
type DI = { company?: string; income?: number; durationMonths?: number; type?: 'Short-Term'|'Long-Term'; who?: 'Self'|'Spouse' }
type Option = { id: string; name: string; risk: 'Low'|'Medium'|'High'; guarantees?: string; resultSummary?: string; score: number }

type Data = {
  name?: string; date?: string; birthdate?: string; age?: number;
  homePhone?: string; cellPhone?: string; personalEmail?: string;
  address?: string; ownOrRent?: 'Own'|'Rent'; employer?: string; position?: string;
  businessAddress?: string; businessPhone?: string; businessEmail?: string;
  spouseName?: string; spouseAge?: number; spouseBirthdate?: string;
  spouseEmployer?: string; spousePosition?: string; spouseBusinessAddress?: string;
  spouseBusinessPhone?: string; spouseBusinessEmail?: string;
  children: Child[];
  attorney?: { name?: string; phone?: string };
  accountant?: { name?: string; phone?: string };
  otherAdvisor?: { name?: string; phone?: string };
  lifePoliciesSelf: LifePolicy[];
  lifePoliciesSpouse: LifePolicy[];
  di: DI[];
  medicalInsurance?: { healthCompany?: string; employerProvided?: boolean };
  priorities: string[];
  futurePlans: string[];
  businessInterests: string[];
  referrals: { name?: string; phone?: string }[];
  advisorNotes?: string;
  illustrationFiles: { name: string; dataUrl: string }[];
  options: Option[];
}

const defaults: Data = {
  children: [],
  attorney: {}, accountant: {}, otherAdvisor: {},
  lifePoliciesSelf: [{}], lifePoliciesSpouse: [{}], di: [{ type: 'Short-Term', who: 'Self' }],
  medicalInsurance: { employerProvided: true },
  priorities: [], futurePlans: [], businessInterests: [], referrals: [],
  illustrationFiles: [], options: []
}

const steps = ['Personal','Advisors','Insurance','Priorities & Plans','Business','Introductions','Advisor','Options','Review']

export default function App(){
  const [data, setData] = React.useState<Data>(()=> {
    const s = localStorage.getItem('tkf-wizard-min'); return s ? JSON.parse(s) : defaults
  })
  const [idx, setIdx] = React.useState(0)
  React.useEffect(()=>localStorage.setItem('tkf-wizard-min', JSON.stringify(data)),[data])

  const upd = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setData((d:any)=>({ ...d, [name]: type==='number' ? (value==='' ? undefined : +value) : value }))
  }
  const next = () => setIdx(i=>Math.min(steps.length-1, i+1))
  const prev = () => setIdx(i=>Math.max(0, i-1))

  const exportPdf = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text(`${BRAND} — Client Review`, 14, 18)
    doc.setFontSize(12)
    doc.text(`Client: ${data.name||''}`, 14, 28)
    doc.text(`Date: ${data.date||''}`, 14, 34)
    doc.text('Priorities:', 14, 44)
    doc.text((data.priorities||[]).slice(0,10).join(', ') || '—', 14, 50)
    doc.text('Options:', 14, 60)
    ;(data.options||[]).slice(0,3).forEach((o, i) => { doc.text(`${i+1}. ${o.name} — Risk: ${o.risk} — Score: ${o.score}`, 14, 66 + i*8) })
    doc.save(`Client_Review_${(data.name||'Client').replace(/\s+/g,'_')}.pdf`)
  }

  const Field = (p:{label:string; name:string; type?:string}) => (
    <div><label className="block" htmlFor={p.name}>{p.label}</label>
      <input className="input" id={p.name} name={p.name} type={p.type||'text'} value={(data as any)[p.name]||''} onChange={upd}/>
    </div>
  )

  return (
    <div style={brandStyles as any}>
      <header>
        <img src="/logo.png" alt="" width="40" height="40" />
        <div style={{fontWeight:700}}>{BRAND}</div>
        <span className="badge">Presentation Wizard</span>
      </header>
      <main className="container">
        <div className="stepper" role="navigation" aria-label="Steps">
          {steps.map((s,i)=>(
            <button key={s} aria-current={i===idx?'step':undefined} onClick={()=>setIdx(i)}>{i+1}. {s}</button>
          ))}
        </div>

        {idx===0 && (
          <section className="card">
            <h2>Personal</h2>
            <div className="row">
              <div style={{gridColumn:'span 6'}}><Field label="Name" name="name"/></div>
              <div style={{gridColumn:'span 6'}}><Field label="Date" name="date" type="date"/></div>
              <div style={{gridColumn:'span 6'}}><Field label="Birthdate" name="birthdate" type="date"/></div>
              <div style={{gridColumn:'span 6'}}><Field label="Age" name="age" type="number"/></div>
              <div style={{gridColumn:'span 6'}}><Field label="Home Phone" name="homePhone"/></div>
              <div style={{gridColumn:'span 6'}}><Field label="Cell Phone" name="cellPhone"/></div>
              <div style={{gridColumn:'span 6'}}><Field label="Email" name="personalEmail"/></div>
              <div style={{gridColumn:'span 6'}}>
                <label className="block">Home</label>
                <select className="input" name="ownOrRent" value={(data.ownOrRent||'Own')} onChange={upd}>
                  <option>Own</option><option>Rent</option>
                </select>
              </div>
              <div style={{gridColumn:'span 12'}}><Field label="Address" name="address"/></div>
            </div>
          </section>
        )}

        {idx===1 && (
          <section className="card">
            <h2>Advisors</h2>
            {['attorney','accountant','otherAdvisor'].map((k:any)=>(
              <div key={k} className="row">
                <div style={{gridColumn:'span 6'}}>
                  <label className="block">{k[0].toUpperCase()+k.slice(1)} Name</label>
                  <input className="input" value={(data as any)[k]?.name||''}
                    onChange={e=>setData((d:any)=>({ ...d, [k]:{...((d as any)[k]||{}), name:e.target.value} }))}/>
                </div>
                <div style={{gridColumn:'span 6'}}>
                  <label className="block">Phone</label>
                  <input className="input" value={(data as any)[k]?.phone||''}
                    onChange={e=>setData((d:any)=>({ ...d, [k]:{...((d as any)[k]||{}), phone:e.target.value} }))}/>
                </div>
              </div>
            ))}
          </section>
        )}

        {idx===2 && (
          <section className="card">
            <h2>Insurance</h2>
            <div className="row">
              {(data.lifePoliciesSelf||[]).map((p,i)=>(
                <React.Fragment key={i}>
                  <div style={{gridColumn:'span 3'}}><label>Company</label><input className="input" value={p.company||''} onChange={e=>{
                    const a=[...data.lifePoliciesSelf]; (a[i] as any).company=e.target.value; setData({...data, lifePoliciesSelf:a})
                  }}/></div>
                  <div style={{gridColumn:'span 3'}}><label>Death Benefit</label><input type="number" className="input" value={p.deathBenefit||''} onChange={e=>{
                    const a=[...data.lifePoliciesSelf]; (a[i] as any).deathBenefit=+e.target.value; setData({...data, lifePoliciesSelf:a})
                  }}/></div>
                  <div style={{gridColumn:'span 3'}}><label>Cash Value</label><input type="number" className="input" value={p.cashValue||''} onChange={e=>{
                    const a=[...data.lifePoliciesSelf]; (a[i] as any).cashValue=+e.target.value; setData({...data, lifePoliciesSelf:a})
                  }}/></div>
                  <div style={{gridColumn:'span 3'}}><label>Beneficiary</label><input className="input" value={p.beneficiary||''} onChange={e=>{
                    const a=[...data.lifePoliciesSelf]; (a[i] as any).beneficiary=e.target.value; setData({...data, lifePoliciesSelf:a})
                  }}/></div>
                </React.Fragment>
              ))}
              <div style={{gridColumn:'span 12'}}><button className="btn" onClick={()=>setData({...data, lifePoliciesSelf:[...data.lifePoliciesSelf, {}]})}>+ Add policy</button></div>
            </div>
            <div className="row">
              {(data.di||[]).map((p,i)=>(
                <React.Fragment key={i}>
                  <div style={{gridColumn:'span 2'}}>
                    <label>Type</label>
                    <select className="input" value={p.type||'Short-Term'} onChange={e=>{
                      const a=[...data.di]; (a[i] as any).type=e.target.value; setData({...data, di:a})
                    }}>
                      <option>Short-Term</option><option>Long-Term</option>
                    </select>
                  </div>
                  <div style={{gridColumn:'span 2'}}>
                    <label>Who</label>
                    <select className="input" value={p.who||'Self'} onChange={e=>{
                      const a=[...data.di]; (a[i] as any).who=e.target.value; setData({...data, di:a})
                    }}>
                      <option>Self</option><option>Spouse</option>
                    </select>
                  </div>
                  <div style={{gridColumn:'span 4'}}><label>Company</label><input className="input" value={p.company||''} onChange={e=>{
                    const a=[...data.di]; (a[i] as any).company=e.target.value; setData({...data, di:a})
                  }}/></div>
                  <div style={{gridColumn:'span 2'}}><label>Income $/mo</label><input type="number" className="input" value={p.income||''} onChange={e=>{
                    const a=[...data.di]; (a[i] as any).income=+e.target.value; setData({...data, di:a})
                  }}/></div>
                  <div style={{gridColumn:'span 2'}}><label>Duration (mo)</label><input type="number" className="input" value={p.durationMonths||''} onChange={e=>{
                    const a=[...data.di]; (a[i] as any).durationMonths=+e.target.value; setData({...data, di:a})
                  }}/></div>
                </React.Fragment>
              ))}
              <div style={{gridColumn:'span 12'}}><button className="btn" onClick={()=>setData({...data, di:[...data.di, {} as any]})}>+ Add DI</button></div>
            </div>
          </section>
        )}

        {idx===3 && (
          <section className="card">
            <h2>Priorities & Plans</h2>
            <div>Check what applies:</div>
            {['Retirement planning','Long-term care','Mortgage protection','Policy review','Systematic savings'].map(p=>{
              const checked = data.priorities.includes(p);
              return <label key={p} style={{display:'block'}}><input type="checkbox" checked={checked} onChange={()=>{
                const set=new Set(data.priorities); if(checked) set.delete(p); else set.add(p); setData({...data, priorities:[...set]})
              }}/> {p}</label>
            })}
            <h3>Future (next two years)</h3>
            {['New home','Start business','Marriage','Children','Retirement'].map(p=>{
              const checked = data.futurePlans.includes(p);
              return <label key={p} style={{display:'block'}}><input type="checkbox" checked={checked} onChange={()=>{
                const set=new Set(data.futurePlans); if(checked) set.delete(p); else set.add(p); setData({...data, futurePlans:[...set]})
              }}/> {p}</label>
            })}
          </section>
        )}

        {idx===4 && (
          <section className="card">
            <h2>Business (optional)</h2>
            {['Buy/Sell','Key Employee','Pension','Nonqualified Plans','Group Insurance','BOE Protection'].map(p=>{
              const checked = (data.businessInterests||[]).includes(p);
              return <label key={p} style={{display:'block'}}><input type="checkbox" checked={checked} onChange={()=>{
                const set=new Set(data.businessInterests||[]); if(checked) set.delete(p); else set.add(p); setData({...data, businessInterests:[...set]})
              }}/> {p}</label>
            })}
          </section>
        )}

        {idx===5 && (
          <section className="card">
            <h2>Introductions</h2>
            {(data.referrals||[]).map((r,i)=>(
              <div key={i} className="row">
                <div style={{gridColumn:'span 6'}}><label>Name</label><input className="input" value={r.name||''} onChange={e=>{
                  const a=[...data.referrals]; (a[i] as any).name=e.target.value; setData({...data, referrals:a})
                }}/></div>
                <div style={{gridColumn:'span 6'}}><label>Phone</label><input className="input" value={r.phone||''} onChange={e=>{
                  const a=[...data.referrals]; (a[i] as any).phone=e.target.value; setData({...data, referrals:a})
                }}/></div>
              </div>
            ))}
            <button className="btn" onClick={()=>setData({...data, referrals:[...data.referrals, {}]})}>+ Add introduction</button>
          </section>
        )}

        {idx===6 && (
          <section className="card">
            <h2>Advisor (private)</h2>
            <label>Notes</label>
            <textarea className="input" value={data.advisorNotes||''} onChange={e=>setData({...data, advisorNotes:e.target.value})} />
            <div style={{marginTop:8}}>
              <label>Upload illustrations (PDF/images)</label>
              <input type="file" multiple accept=".pdf,image/*" onChange={async e=>{
                const files = e.target.files; if(!files) return;
                const arr: any[] = []
                for (const f of Array.from(files)) {
                  const reader = new FileReader()
                  const result: string = await new Promise((resolve,reject)=>{ reader.onload=()=>resolve(reader.result as string); reader.onerror=()=>reject(reader.error); reader.readAsDataURL(f) })
                  arr.push({ name: f.name, dataUrl: result })
                }
                setData({...data, illustrationFiles:[...(data.illustrationFiles||[]), ...arr]})
                e.currentTarget.value = ''
              }}/>
              <ul>{(data.illustrationFiles||[]).map((f,i)=>(<li key={i}>{f.name}</li>))}</ul>
            </div>
          </section>
        )}

        {idx===7 && (
          <section className="card">
            <h2>Options</h2>
            {(data.options||[]).map((o,i)=>(
              <div key={o.id} className="card" style={{marginBottom:10}}>
                <div className="row">
                  <div style={{gridColumn:'span 6'}}><label>Name</label><input className="input" value={o.name} onChange={e=>{
                    const a=[...data.options]; (a[i] as any).name=e.target.value; setData({...data, options:a})
                  }}/></div>
                  <div style={{gridColumn:'span 6'}}><label>Risk</label>
                    <select className="input" value={o.risk} onChange={e=>{
                      const a=[...data.options]; (a[i] as any).risk=e.target.value; setData({...data, options:a})
                    }}><option>Low</option><option>Medium</option><option>High</option></select>
                  </div>
                  <div style={{gridColumn:'span 12'}}><label>Guarantees</label><textarea className="input" value={o.guarantees||''} onChange={e=>{
                    const a=[...data.options]; (a[i] as any).guarantees=e.target.value; setData({...data, options:a})
                  }}/></div>
                  <div style={{gridColumn:'span 12'}}><label>Results / Notes</label><textarea className="input" value={o.resultSummary||''} onChange={e=>{
                    const a=[...data.options]; (a[i] as any).resultSummary=e.target.value; setData({...data, options:a})
                  }}/></div>
                  <div style={{gridColumn:'span 12'}}><label>Score: {o.score}</label>
                    <input type="range" min={1} max={10} value={o.score} onChange={e=>{
                      const a=[...data.options]; (a[i] as any).score=+e.target.value; setData({...data, options:a})
                    }}/>
                  </div>
                </div>
              </div>
            ))}
            <button className="btn" onClick={()=>setData({...data, options:[...data.options, { id: crypto.randomUUID(), name:'', risk:'Medium', score:5 }]})}>+ Add option</button>
            {data.options.length>0 && (
              <div style={{marginTop:10}}>
                <h3>At-a-glance</h3>
                <div className="row">
                  {data.options.map((o)=> (
                    <div key={o.id} className="card" style={{gridColumn:'span 4'}}>
                      <div style={{display:'flex', justifyContent:'space-between'}}>
                        <div style={{fontWeight:600}}>{o.name || 'Unnamed Option'}</div>
                        <span className="badge">{o.risk}</span>
                      </div>
                      <div><strong>Guarantees:</strong> {o.guarantees||'—'}</div>
                      <div><strong>Results:</strong> {o.resultSummary||'—'}</div>
                      <div><strong>Score:</strong> {o.score}/10</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {idx===8 && (
          <section className="card">
            <h2>Review & Export</h2>
            <button className="btn btn-primary" onClick={exportPdf}>Export PDF</button>
            {(data.illustrationFiles||[]).length>0 && (<>
              <h3>Attached Illustrations</h3>
              <ul>{data.illustrationFiles.map((f,i)=>(<li key={i}>{f.name}</li>))}</ul>
            </>)}
          </section>
        )}

        <div style={{display:'flex', justifyContent:'space-between', marginTop:12}}>
          <button className="btn" onClick={prev} disabled={idx===0}>← Back</button>
          <button className="btn btn-primary" onClick={next} disabled={idx===steps.length-1}>Next →</button>
        </div>
      </main>
    </div>
  )
}
