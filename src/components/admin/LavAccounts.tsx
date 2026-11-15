import React, { useEffect, useState } from 'react';
import { lavAuthorizedFetch } from '../../services/storage';

type Account = { username: string; name: string; role: string; active: boolean };
export function LavAccounts({ onClose }: { onClose: () => void }) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const reload = async () => {
    const res = await lavAuthorizedFetch('/Restaurantes/lav-auth.php?action=users');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'No se pudieron consultar cuentas');
    setAccounts(data.users || []);
  };
  useEffect(() => { reload().catch(e => setError(e.message)); }, []);
  const action = async (kind: string, user: string, value?: string) => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const payload: Record<string, string> = { action: kind, username: user };
      if (kind === 'create') { payload.name = name || user; payload.password = password; }
      if (kind === 'update') payload.name = value || user;
      if (kind === 'password') payload.password = value || '';
      const res = await lavAuthorizedFetch('/Restaurantes/lav-auth.php', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'No se pudo guardar');
      setPassword(''); await reload();
    } catch (e) { setError(e instanceof Error ? e.message : 'Error de usuarios'); }
    finally { setBusy(false); }
  };
  return <div className="fixed inset-0 z-[120] bg-black/70 p-3 sm:p-8 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Administración de usuarios">
    <section className="bg-white rounded-2xl max-w-2xl mx-auto p-5 sm:p-7 space-y-5 text-slate-900">
      <div className="flex justify-between items-center"><h2 className="font-black text-xl">Administración de usuarios</h2><button className="rounded-lg bg-slate-900 text-white px-4 py-2" onClick={onClose}>Cerrar</button></div>
      <p className="text-sm text-slate-500">Exclusivo del superadministrador lavariega. Contraseñas de al menos 12 caracteres.</p>
      {error && <p className="text-red-700 bg-red-50 rounded-lg p-3">{error}</p>}
      <div className="grid sm:grid-cols-3 gap-2">
        <input className="border rounded-lg p-3" placeholder="Usuario" aria-label="Nuevo usuario" value={username} onChange={e=>setUsername(e.target.value)} />
        <input className="border rounded-lg p-3" placeholder="Nombre completo" aria-label="Nombre del usuario" value={name} onChange={e=>setName(e.target.value)} />
        <input className="border rounded-lg p-3" placeholder="Contraseña temporal" aria-label="Contraseña nueva" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
      </div>
      <button className="rounded-lg bg-indigo-700 text-white font-bold px-5 py-3 disabled:opacity-50" disabled={busy||username.length<3||password.length<12} onClick={()=>action('create',username)}>Crear usuario</button>
      <div className="divide-y border rounded-xl overflow-hidden">{accounts.map(a=><div key={a.username} className="flex flex-wrap gap-2 justify-between items-center p-3">
        <div><strong>{a.username}</strong><span className="text-xs text-slate-500 ml-2">{a.name} · {a.role==='superadmin'?'Superadministrador':'Editor'} · {a.active?'Activo':'Suspendido'}</span></div>
        {a.role!=='superadmin' && <div className="flex flex-wrap gap-1">
          <button disabled={busy} className="text-xs border rounded p-2" onClick={()=>{const newName=window.prompt('Nombre del usuario',a.name);if(newName!==null)void action('update',a.username,newName);}}>Editar</button>
          <button disabled={busy} className="text-xs border rounded p-2" onClick={()=>{const pw=window.prompt('Nueva contraseña (mínimo 12 caracteres)');if(pw)void action('password',a.username,pw);}}>Contraseña</button>
          <button disabled={busy} className="text-xs border rounded p-2" onClick={()=>action(a.active?'suspend':'activate',a.username)}>{a.active?'Suspender':'Activar'}</button>
          <button disabled={busy} className="text-xs border border-red-300 text-red-700 rounded p-2" onClick={()=>{if(window.confirm('¿Eliminar cuenta '+a.username+'?'))void action('delete',a.username);}}>Eliminar</button>
        </div>}
      </div>)}</div>
      <button className="text-sm underline" onClick={()=>{const pw=window.prompt('Nueva contraseña de lavariega (mínimo 12 caracteres)');if(pw)void action('password','lavariega',pw);}}>Cambiar contraseña de lavariega</button>
    </section>
  </div>;
}
