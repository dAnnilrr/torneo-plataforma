'use client'

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { auth, db } from "../lib/firebase";
import {
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  increment,
  QueryDocumentSnapshot,
  DocumentData,
} from "firebase/firestore";

/** Tipos */
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

/** Datos constantes */
const deportes: Deporte[] = ["Voleibol", "Fútbol", "Basketball"];
const categorias: Categoria[] = ["prepa", "profesional"];
const generos: Genero[] = ["varonil", "femenil"];

const videosData: { [key in Deporte]: VideoDeporte } = {
  "Voleibol": {
    prepa_varonil: "https://www.youtube.com/embed/XFkzRNyygfk",
    prepa_femenil: "https://www.youtube.com/embed/XFkzRNyygfk",
    profesional_varonil: "https://www.youtube.com/embed/XFkzRNyygfk",
    profesional_femenil: "https://www.youtube.com/embed/XFkzRNyygfk"
  },
  "Fútbol": {
    prepa_varonil: "https://www.youtube.com/embed/video5",
    prepa_femenil: "https://www.youtube.com/embed/video6",
    profesional_varonil: "https://www.youtube.com/embed/video7",
    profesional_femenil: "https://www.youtube.com/embed/video8"
  },
  "Basketball": {
    prepa_varonil: "https://www.youtube.com/embed/video9",
    prepa_femenil: "https://www.youtube.com/embed/video10",
    profesional_varonil: "https://www.youtube.com/embed/video11",
    profesional_femenil: "https://www.youtube.com/embed/video12"
  }
};

export default function Home() {
  // --- Auth + Role ---
  const [user, loading] = useAuthState(auth);
  const [role, setRole] = useState<Role | null>(null);

  // --- Login states ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");

  // --- Registro de jueces ---
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [registerError, setRegisterError] = useState("");
  const [registerSuccess, setRegisterSuccess] = useState("");

  // --- Equipos y Partidos ---
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [partidoSel, setPartidoSel] = useState<Partial<Partido>>({});
  const [newEquipo, setNewEquipo] = useState<Equipo>({
    nombre: "",
    categoria: "prepa",
    genero: "varonil",
    deporte: "Voleibol",
    puntos: 0,
    partidos_ganados: 0,
    partidos_perdidos: 0,
  });

  // --- Cargar en tiempo real equipos y partidos ---
  useEffect(() => {
    const unsubEquipos = onSnapshot(collection(db, "equipos"), snapshot => {
      const arr: Equipo[] = snapshot.docs.map((d: QueryDocumentSnapshot<DocumentData>) => ({
        id: d.id,
        ...(d.data() as Omit<Equipo, "id">),
      }));
      setEquipos(arr);
    });

    const unsubPartidos = onSnapshot(collection(db, "partidos"), snapshot => {
      const arr: Partido[] = snapshot.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<Partido, "id">),
      }));
      setPartidos(arr);
    });

    return () => {
      unsubEquipos();
      unsubPartidos();
    };
  }, []);

  // Si el usuario está autenticado, asumimos role = juez
  useEffect(() => {
    if (user) setRole("juez");
  }, [user]);

  // --- Autenticación ---
  const handleLogin = async () => {
    try {
      setLoginError("");
      await signInWithEmailAndPassword(auth, email, password);
      setRole("juez");
      setEmail("");
      setPassword("");
    } catch (err: unknown) {
      if (err instanceof Error) setLoginError(err.message);
      else setLoginError(String(err));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setRole(null);
    setEmail("");
    setPassword("");
  };

  // --- Registro de nuevo juez ---
  const handleRegister = async () => {
    try {
      setRegisterError("");
      setRegisterSuccess("");
      if (!newEmail || !newPassword) {
        setRegisterError("Ingresa correo y contraseña.");
        return;
      }

      await createUserWithEmailAndPassword(auth, newEmail, newPassword);
      setRegisterSuccess("Juez registrado correctamente. Ya puede iniciar sesión.");
      setNewEmail("");
      setNewPassword("");
    } catch (err: any) {
      setRegisterError(err.message || "Error al registrar juez");
    }
  };

  // --- Agregar equipo ---
  const handleAddEquipo = async () => {
    try {
      if (!newEquipo.nombre.trim()) {
        alert("Ingrese nombre del equipo");
        return;
      }
      const exists = equipos.some(e =>
        e.nombre.trim().toLowerCase() === newEquipo.nombre.trim().toLowerCase() &&
        e.deporte === newEquipo.deporte &&
        e.categoria === newEquipo.categoria &&
        e.genero === newEquipo.genero
      );
      if (exists) {
        alert("Ya existe un equipo con esos datos.");
        return;
      }
      await addDoc(collection(db, "equipos"), newEquipo);
      setNewEquipo({ ...newEquipo, nombre: "" });
    } catch (err) {
      alert("Error al agregar equipo: " + String(err));
    }
  };

  // --- Crear partido ---
  const handleCrearPartido = async () => {
    try {
      if (!partidoSel.equipoA || !partidoSel.equipoB || !partidoSel.deporte || !partidoSel.categoria || !partidoSel.genero) {
        alert("Seleccione todos los campos para crear un partido");
        return;
      }
      if (partidoSel.equipoA === partidoSel.equipoB) {
        alert("Equipo A y Equipo B deben ser diferentes.");
        return;
      }
      await addDoc(collection(db, "partidos"), {
        deporte: partidoSel.deporte,
        categoria: partidoSel.categoria,
        genero: partidoSel.genero,
        equipoA: partidoSel.equipoA,
        equipoB: partidoSel.equipoB,
        puntosA: 0,
        puntosB: 0,
      });
      setPartidoSel({});
    } catch (err) {
      alert("Error al crear partido: " + String(err));
    }
  };

  // --- Anotar puntos ---
  const handleAnotar = async (partidoId: string, equipo: "A" | "B") => {
    try {
      const ref = doc(db, "partidos", partidoId);
      if (equipo === "A") await updateDoc(ref, { puntosA: increment(1) });
      else await updateDoc(ref, { puntosB: increment(1) });
    } catch (err) {
      alert("Error al anotar punto: " + String(err));
    }
  };

  // --- Reset marcador ---
  const handleResetPartido = async (partidoId: string) => {
    try {
      const ref = doc(db, "partidos", partidoId);
      await updateDoc(ref, { puntosA: 0, puntosB: 0 });
    } catch (err) {
      alert("Error al resetear partido: " + String(err));
    }
  };

  // --- Eliminar equipo / partido ---
  const handleEliminarEquipo = async (id?: string) => {
    if (!id || !confirm("¿Eliminar equipo?")) return;
    await deleteDoc(doc(db, "equipos", id));
  };
  const handleEliminarPartido = async (id?: string) => {
    if (!id || !confirm("¿Eliminar partido?")) return;
    await deleteDoc(doc(db, "partidos", id));
  };

  // --- Loading indicator ---
  if (loading) return <p className="text-center mt-10">Cargando...</p>;

  // --- Login inicial ---
  if (!user && !role) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-blue-50 text-gray-800 p-6">
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold text-blue-800 text-center mb-6"
        >
          Bienvenido al Tecnológico de Monterrey
        </motion.h1>

        <div className="bg-white p-6 rounded shadow w-full max-w-md">
          <h2 className="text-2xl font-bold mb-4">Login Juez</h2>
          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="p-2 mb-3 rounded w-full border"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="p-2 mb-3 rounded w-full border"
          />
          <button
            onClick={handleLogin}
            className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-400"
          >
            Entrar como Juez
          </button>
          {loginError && <p className="text-red-500 mt-2">{loginError}</p>}

          <div className="my-4 border-t pt-4 flex flex-col gap-2">
            <button
              onClick={() => setRole("visitante")}
              className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-100"
            >
              Entrar como Visitante
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Pantalla principal ---
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans text-gray-800 p-4">
      <header className="flex flex-col md:flex-row justify-between items-center p-4 bg-blue-200 shadow mb-4 rounded">
        <div className="flex gap-4 items-center">
          <div className="w-24 h-16 relative">
            <Image src="/logo_tec.png" alt="Logo Tec" fill className="object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-xl">Plataforma de Marcadores</h1>
            <p className="text-sm text-gray-700">Visualiza marcadores en tiempo real</p>
          </div>
        </div>

        <div className="flex gap-2 mt-3 md:mt-0">
          <button onClick={() => setRole("visitante")} className="bg-white px-4 py-2 rounded hover:bg-gray-100">
            Visitante
          </button>
          {role === "juez" && (
            <button className="bg-white px-4 py-2 rounded hover:bg-gray-100">Juez</button>
          )}
          <button onClick={handleLogout} className="bg-red-300 px-4 py-2 rounded hover:bg-red-200">
            Cerrar sesión
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-6">
        {/* Panel Juez */}
        {role === "juez" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Equipos */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-bold mb-2">Equipos</h2>
              <input type="text" placeholder="Nombre equipo" value={newEquipo.nombre}
                onChange={e => setNewEquipo({ ...newEquipo, nombre: e.target.value })} className="p-1 mb-2 border rounded w-full"/>
              <select value={newEquipo.deporte} onChange={e => setNewEquipo({...newEquipo, deporte: e.target.value as Deporte})} className="p-1 mb-2 border rounded w-full">
                {deportes.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select value={newEquipo.categoria} onChange={e => setNewEquipo({...newEquipo, categoria: e.target.value as Categoria})} className="p-1 mb-2 border rounded w-full">
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={newEquipo.genero} onChange={e => setNewEquipo({...newEquipo, genero: e.target.value as Genero})} className="p-1 mb-2 border rounded w-full">
                {generos.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <button onClick={handleAddEquipo} className="bg-blue-500 text-white px-2 py-1 rounded w-full">Agregar</button>
              <ul className="mt-2">
                {equipos.map(eq => <li key={eq.id} className="flex justify-between items-center py-1 border-b">
                  <span>{eq.nombre} ({eq.deporte} - {eq.categoria} {eq.genero})</span>
                  <button onClick={() => handleEliminarEquipo(eq.id ?? "")} className="text-red-500 px-1">X</button>
                </li>)}
              </ul>
            </div>

            {/* Partidos */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-bold mb-2">Partidos</h2>
              <select onChange={e => setPartidoSel({...partidoSel, deporte: e.target.value as Deporte})} className="p-1 mb-2 border rounded w-full">
                <option value="">Deporte</option>
                {deportes.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <select onChange={e => setPartidoSel({...partidoSel, categoria: e.target.value as Categoria})} className="p-1 mb-2 border rounded w-full">
                <option value="">Categoría</option>
                {categorias.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select onChange={e => setPartidoSel({...partidoSel, genero: e.target.value as Genero})} className="p-1 mb-2 border rounded w-full">
                <option value="">Género</option>
                {generos.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <select onChange={e => setPartidoSel({...partidoSel, equipoA: e.target.value})} className="p-1 mb-2 border rounded w-full">
                <option value="">Equipo A</option>
                {equipos.map(eq => <option key={eq.id} value={eq.nombre}>{eq.nombre}</option>)}
              </select>
              <select onChange={e => setPartidoSel({...partidoSel, equipoB: e.target.value})} className="p-1 mb-2 border rounded w-full">
                <option value="">Equipo B</option>
                {equipos.map(eq => <option key={eq.id} value={eq.nombre}>{eq.nombre}</option>)}
              </select>
              <button onClick={handleCrearPartido} className="bg-green-500 text-white px-2 py-1 rounded w-full">Crear Partido</button>
              <ul className="mt-2">
                {partidos.map(p => (
                  <li key={p.id} className="flex justify-between items-center py-1 border-b">
                    <span>{p.equipoA} ({p.puntosA ?? 0}) vs {p.equipoB} ({p.puntosB ?? 0})</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleAnotar(p.id ?? "", "A")} className="bg-blue-200 px-1 rounded">+ A</button>
                      <button onClick={() => handleAnotar(p.id ?? "", "B")} className="bg-blue-200 px-1 rounded">+ B</button>
                      <button onClick={() => handleResetPartido(p.id ?? "")} className="bg-yellow-200 px-1 rounded">Reset</button>
                      <button onClick={() => handleEliminarPartido(p.id ?? "")} className="text-red-500 px-1 rounded">X</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Registro Jueces */}
            <div className="bg-white p-4 rounded shadow">
              <h2 className="font-bold mb-2">Registrar Juez</h2>
              <input type="email" placeholder="Correo" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="p-1 mb-2 border rounded w-full"/>
              <input type="password" placeholder="Contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="p-1 mb-2 border rounded w-full"/>
              <button onClick={handleRegister} className="bg-purple-500 text-white px-2 py-1 rounded w-full">Registrar</button>
              {registerError && <p className="text-red-500 mt-1">{registerError}</p>}
              {registerSuccess && <p className="text-green-500 mt-1">{registerSuccess}</p>}
            </div>
          </div>
        )}

        {/* Panel Visitante */}
        {role === "visitante" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partidos.length === 0 ? (
              <p>No hay partidos disponibles</p>
            ) : (
              partidos.map(p => {
                const key = `${p.categoria.toLowerCase().trim()}_${p.genero.toLowerCase().trim()}`;
                const videoUrl: string = videosData[p.deporte]?.[key] || "";

                const colorBg = p.deporte === "Voleibol" ? "bg-yellow-100" :
                                p.deporte === "Fútbol" ? "bg-green-100" :
                                "bg-blue-100";

                return (
                  <div key={p.id ?? Math.random()} className={`${colorBg} p-4 rounded shadow-lg border-l-4 border-blue-500`}>
                    <h3 className="font-bold text-lg mb-2 text-gray-800">{p.deporte} - {p.categoria} - {p.genero}</h3>
                    <p className="text-2xl font-extrabold mb-2 text-gray-900 text-center">
                      {p.equipoA} {p.puntosA ?? 0} : {p.puntosB ?? 0} {p.equipoB}
                    </p>
                    {videoUrl && (
                      <div className="relative w-full pb-[56.25%] mt-2 rounded overflow-hidden shadow">
                        <iframe
                          className="absolute top-0 left-0 w-full h-full"
                          src={videoUrl}
                          title={`${p.equipoA} vs ${p.equipoB}`}
                          allowFullScreen
                        />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
