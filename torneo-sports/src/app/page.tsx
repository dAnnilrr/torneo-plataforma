'use client'

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import { collection, addDoc, onSnapshot, doc, deleteDoc, getDocs, setDoc } from "firebase/firestore";

// --- Tipos ---
type Categoria = "prepa" | "profesional";
type Genero = "varonil" | "femenil";
type Deporte = "Voleibol" | "Fútbol" | "Basketball";

type Equipo = {
  id?: string;
  nombre: string;
  categoria: Categoria;
  genero: Genero;
  deporte: Deporte;
  puntos: number;
  partidos_ganados: number;
  partidos_perdidos: number;
};

type Role = "juez" | "visitante";

type Partido = {
  id?: string;
  deporte: Deporte;
  categoria: Categoria;
  genero: Genero;
  equipoA: string;
  equipoB: string;
  puntosA: number;
  puntosB: number;
};

type VideoDeporte = {
  [key: string]: string;
};

// --- Datos ---
const deportes: Deporte[] = ["Voleibol", "Fútbol", "Basketball"];
const categorias: Categoria[] = ["prepa","profesional"];
const generos: Genero[] = ["varonil","femenil"];
const videosData: {[key in Deporte]: VideoDeporte} = {
  "Voleibol": {
    prepa_varonil:"https://www.youtube.com/watch?v=XFkzRNyygfk",
    prepa_femenil:"https://www.youtube.com/watch?v=XFkzRNyygfk",
    profesional_varonil:"https://www.youtube.com/watch?v=XFkzRNyygfk",
    profesional_femenil:"https://www.youtube.com/watch?v=XFkzRNyygfk"
  },
  "Fútbol": {
    prepa_varonil:"https://www.youtube.com/watch?v=video5",
    prepa_femenil:"https://www.youtube.com/watch?v=video6",
    profesional_varonil:"https://www.youtube.com/watch?v=video7",
    profesional_femenil:"https://www.youtube.com/watch?v=video8"
  },
  "Basketball": {
    prepa_varonil:"https://www.youtube.com/watch?v=video9",
    prepa_femenil:"https://www.youtube.com/watch?v=video10",
    profesional_varonil:"https://www.youtube.com/watch?v=video11",
    profesional_femenil:"https://www.youtube.com/watch?v=video12"
  }
}

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState<Role|null>(null);
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loginError,setLoginError] = useState("");

  const [equipos,setEquipos] = useState<Equipo[]>([]);
  const [partidos,setPartidos] = useState<Partido[]>([]);
  const [partidoSel,setPartidoSel] = useState<Partido|null>(null);

  const [newEquipo, setNewEquipo] = useState<Equipo>({
    nombre:"", categoria:"prepa", genero:"varonil", deporte:"Voleibol",
    puntos:0, partidos_ganados:0, partidos_perdidos:0
  });

  // Firestore real-time
  useEffect(()=>{
    const unsubscribeEquipos = onSnapshot(collection(db,"equipos"), snapshot=>{
      setEquipos(snapshot.docs.map(d=>({id:d.id,...d.data()} as Equipo)));
    });
    const unsubscribePartidos = onSnapshot(collection(db,"partidos"), snapshot=>{
      setPartidos(snapshot.docs.map(d=>({id:d.id,...d.data()} as Partido)));
    });
    return ()=>{unsubscribeEquipos(); unsubscribePartidos();}
  },[]);

  // Auth
  const handleLogin = async()=>{
    try{
      await signInWithEmailAndPassword(auth,email,password);
      setRole("juez");
      setLoginError("");
    }catch(err:any){ setLoginError(err.message); }
  };
  const handleLogout = async()=>{
    await signOut(auth);
    setRole(null); setEmail(""); setPassword("");
  };

  const handleAddEquipo = async()=>{
    if(!newEquipo.nombre) return alert("Ingrese nombre del equipo");
    await addDoc(collection(db,"equipos"),newEquipo);
    setNewEquipo({...newEquipo,nombre:""});
  };

  const handleCrearPartido = async()=>{
    if(!partidoSel) return;
    await addDoc(collection(db,"partidos"),{
      deporte: partidoSel.deporte,
      categoria: partidoSel.categoria,
      genero: partidoSel.genero,
      equipoA: partidoSel.equipoA,
      equipoB: partidoSel.equipoB,
      puntosA:0, puntosB:0
    });
    setPartidoSel(null);
  };

  const handleAnotar = async(partidoId:string, equipo:"A"|"B")=>{
    const ref = doc(db,"partidos",partidoId);
    const partido = partidos.find(p=>p.id===partidoId);
    if(!partido) return;
    const update:any = {};
    if(equipo==="A") update.puntosA = partido.puntosA+1;
    else update.puntosB = partido.puntosB+1;
    await setDoc(ref,{...partido,...update});
  };

  const handleResetPlatform = async()=>{
    if(!confirm("¿Deseas borrar todos los datos y reiniciar la plataforma?")) return;
    const eqSnap = await getDocs(collection(db,"equipos"));
    const ptSnap = await getDocs(collection(db,"partidos"));
    eqSnap.forEach(d=> deleteDoc(doc(db,"equipos",d.id)));
    ptSnap.forEach(d=> deleteDoc(doc(db,"partidos",d.id)));
    alert("Plataforma reiniciada");
  };

  if(loading) return <p className="text-center mt-10">Cargando...</p>;
  if(!user && !role) return(
    <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 text-gray-800">
      <motion.h1 initial={{opacity:0, y:-30}} animate={{opacity:1, y:0}} transition={{duration:1.5, repeat:Infinity, repeatType:"reverse"}} className="text-4xl md:text-6xl font-bold text-blue-800 text-center mb-6">
        Bienvenido al Tecnológico de Monterrey
      </motion.h1>
      <h2 className="text-3xl font-bold mb-6">Login Juez</h2>
      <input type="email" placeholder="Correo" value={email} onChange={e=>setEmail(e.target.value)} className="p-2 mb-4 rounded w-64"/>
      <input type="password" placeholder="Contraseña" value={password} onChange={e=>setPassword(e.target.value)} className="p-2 mb-4 rounded w-64"/>
      <button onClick={handleLogin} className="bg-blue-400 px-4 py-2 rounded mb-4 hover:bg-blue-300">Entrar como Juez</button>
      {loginError && <p className="text-red-500">{loginError}</p>}
      <hr className="my-4 w-48 border-gray-300"/>
      <button onClick={()=>setRole("visitante")} className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-200">Entrar como Visitante</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans text-gray-800 p-4">
      {/* Header con logos */}
      <header className="flex justify-between items-center p-4 bg-blue-200 shadow mb-4 rounded">
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 relative"><Image src="/logo_tec.png" alt="Logo Tec" fill className="object-contain"/></div>
          <div className="w-20 h-20 relative"><Image src="/images.png" alt="Logo 2" fill className="object-contain"/></div>
          <div className="w-20 h-20 relative"><Image src="/copa.png" alt="Logo 3" fill className="object-contain"/></div>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>setRole("visitante")} className="bg-white px-4 py-2 rounded hover:bg-gray-100">Visitante</button>
          {role==="juez" && <button className="bg-white px-4 py-2 rounded hover:bg-gray-100">Juez</button>}
          <button onClick={handleLogout} className="bg-red-300 px-4 py-2 rounded hover:bg-red-200">Cerrar sesión</button>
        </div>
      </header>

      {role==="juez" && (
        <div className="max-w-5xl mx-auto space-y-6">
          {/* Registrar Equipo */}
          <section className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Registrar Equipo</h2>
            <input placeholder="Nombre" value={newEquipo.nombre} onChange={e=>setNewEquipo({...newEquipo,nombre:e.target.value})} className="p-2 border rounded mb-2 w-full"/>
            <select value={newEquipo.deporte} onChange={e=>setNewEquipo({...newEquipo,deporte:e.target.value as Deporte})} className="p-2 border rounded mb-2 w-full">
              {deportes.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <select value={newEquipo.categoria} onChange={e=>setNewEquipo({...newEquipo,categoria:e.target.value as Categoria})} className="p-2 border rounded mb-2 w-full">
              {categorias.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select value={newEquipo.genero} onChange={e=>setNewEquipo({...newEquipo,genero:e.target.value as Genero})} className="p-2 border rounded mb-2 w-full">
              {generos.map(g=><option key={g} value={g}>{g}</option>)}
            </select>
            <button onClick={handleAddEquipo} className="bg-green-400 hover:bg-green-300 p-2 rounded w-full">Agregar Equipo</button>
          </section>

          {/* Crear Partido */}
          <section className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Crear Partido</h2>
            <select value={partidoSel?.deporte||""} onChange={e=>setPartidoSel({...partidoSel!,deporte:e.target.value as Deporte})} className="p-2 border rounded mb-2 w-full">
              <option value="">Deporte</option>
              {deportes.map(d=><option key={d} value={d}>{d}</option>)}
            </select>
            <select value={partidoSel?.categoria||""} onChange={e=>setPartidoSel({...partidoSel!,categoria:e.target.value as Categoria})} className="p-2 border rounded mb-2 w-full">
              <option value="">Categoría</option>
              {categorias.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select value={partidoSel?.genero||""} onChange={e=>setPartidoSel({...partidoSel!,genero:e.target.value as Genero})} className="p-2 border rounded mb-2 w-full">
              <option value="">Género</option>
              {generos.map(g=><option key={g} value={g}>{g}</option>)}
            </select>
            <select value={partidoSel?.equipoA||""} onChange={e=>setPartidoSel({...partidoSel!,equipoA:e.target.value})} className="p-2 border rounded mb-2 w-full">
              <option value="">Equipo A</option>
              {equipos.filter(eq=>eq.deporte===partidoSel?.deporte && eq.categoria===partidoSel?.categoria && eq.genero===partidoSel?.genero).map(eq=><option key={eq.nombre} value={eq.nombre}>{eq.nombre}</option>)}
            </select>
            <select value={partidoSel?.equipoB||""} onChange={e=>setPartidoSel({...partidoSel!,equipoB:e.target.value})} className="p-2 border rounded mb-2 w-full">
              <option value="">Equipo B</option>
              {equipos.filter(eq=>eq.deporte===partidoSel?.deporte && eq.categoria===partidoSel?.categoria && eq.genero===partidoSel?.genero).map(eq=><option key={eq.nombre} value={eq.nombre}>{eq.nombre}</option>)}
            </select>
            <button onClick={handleCrearPartido} className="bg-green-400 hover:bg-green-300 p-2 rounded w-full">Crear Partido</button>
          </section>

          {/* Tablero */}
          <section className="bg-white p-4 rounded shadow">
            <h2 className="font-bold mb-2">Tablero de Puntos</h2>
            {partidos.map(p=>(
              <div key={p.id} className="flex flex-col md:flex-row gap-2 md:gap-4 items-center mb-2">
                <span className="font-semibold">{p.equipoA} ({p.puntosA}) vs {p.equipoB} ({p.puntosB}) - {p.deporte} {p.categoria} {p.genero}</span>
                <div className="flex gap-2">
                  <button onClick={()=>handleAnotar(p.id!,"A")} className="bg-blue-400 hover:bg-blue-300 p-1 rounded">+1 {p.equipoA}</button>
                  <button onClick={()=>handleAnotar(p.id!,"B")} className="bg-blue-400 hover:bg-blue-300 p-1 rounded">+1 {p.equipoB}</button>
                </div>
              </div>
            ))}
          </section>

          <button onClick={handleResetPlatform} className="bg-red-400 hover:bg-red-300 p-2 rounded w-full">Reiniciar Plataforma</button>
        </div>
      )}

      {role==="visitante" && (
        <div className="max-w-5xl mx-auto space-y-6">
          <h2 className="font-bold text-2xl mb-4">Indicadores y Videos</h2>
          {deportes.map(dep=>{
            return (
              <div key={dep} className="mb-6">
                <h3 className="font-semibold text-blue-700">{dep}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {categorias.map(cat=>generos.map(gen=>{
                    const key = `${cat}_${gen}`;
                    const videoUrl = videosData[dep][key];
                    return (
                      <div key={key} className="bg-white p-2 rounded shadow">
                        <p className="font-semibold">{cat} {gen}</p>
                        <iframe width="100%" height="180" src={videoUrl.replace("watch?v=","embed/")} title={`${dep} ${cat} ${gen}`} allowFullScreen></iframe>
                        <p className="mt-2 font-bold">Marcadores en tiempo real:</p>
                        {partidos.filter(p=>p.deporte===dep && p.categoria===cat && p.genero===gen).map(p=>(
                          <div key={p.id} className="flex justify-between bg-blue-50 p-1 rounded my-1">
                            <span>{p.equipoA} ({p.puntosA})</span>
                            <span>{p.equipoB} ({p.puntosB})</span>
                          </div>
                        ))}
                      </div>
                    )
                  }))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
