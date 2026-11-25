import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  AlertCircle,
  Check,
  X
} from 'lucide-react';
import ApiService from '../services/api';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from './ConfirmModal';
import Toast from './Toast';

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nombre, setNombre] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('Usuarios');
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [modalSuspend, setModalSuspend] = useState({ isOpen: false, id: null, nombre: '', nuevoEstado: false });

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const res = await ApiService.getUsuarios();
      setUsuarios(res.data);
    } catch (err) {
      setError(err.message || 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const passwordChecks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
  const isPasswordValid = Object.values(passwordChecks).every(Boolean);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setError('La contraseña debe cumplir con todos los requisitos de seguridad');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await ApiService.createUsuario({
        nombre_completo: nombre.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        rol
      });
      setNombre('');
      setUsername('');
      setEmail('');
      setPassword('');
      setRol('Usuarios');
      showToast('Usuario creado correctamente');
      fetchUsuarios();
    } catch (err) {
      setError(err.message || 'Error al crear usuario');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRol = async (id, nuevoRol) => {
    try {
      await ApiService.updateRol(id, nuevoRol);
      showToast('Rol actualizado correctamente');
      fetchUsuarios();
    } catch (err) {
      setError(err.message || 'Error al cambiar rol');
    }
  };

  const requestToggleEstado = (id, nombreUsuario, nuevoEstado) => {
    setModalSuspend({
      isOpen: true,
      id,
      nombre: nombreUsuario,
      nuevoEstado
    });
  };

  const confirmToggleEstado = async () => {
    if (!modalSuspend.id) return;
    try {
      await ApiService.toggleEstadoUsuario(modalSuspend.id, modalSuspend.nuevoEstado);
      const accion = modalSuspend.nuevoEstado ? 'reactivado' : 'suspendido';
      showToast(`Usuario ${accion} correctamente`);
      fetchUsuarios();
    } catch (err) {
      setError(err.message || 'Error al actualizar estado');
    } finally {
      setModalSuspend({ isOpen: false, id: null, nombre: '', nuevoEstado: false });
    }
  };

  const isSuperAdmin = currentUser?.rol === 'Super Admin';

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-4xl mx-auto">
      <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900 leading-tight">
            Control de Usuarios y Roles
          </h2>
          <p className="text-xs text-slate-500">
            {isSuperAdmin ? 'Gestión total de roles de administración y colaboradores' : 'Gestión de colaboradores y administradores'}
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle size={15} className="shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white/80 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
          <UserPlus size={14} className="text-slate-600" />
          <span>Registrar nuevo usuario</span>
        </h3>

        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
            <input
              type="text"
              required
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-800"
            />

            <input
              type="text"
              required
              placeholder="Nombre de usuario"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-800"
            />

            <input
              type="email"
              required
              placeholder="Correo corporativo"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-800"
            />

            <input
              type="password"
              required
              placeholder="Contraseña robusta"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-slate-800"
            />

            <div className="flex gap-2">
              <select
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-slate-800"
              >
                <option value="Usuarios">Usuarios</option>
                <option value="Admin">Admin</option>
              </select>

              <button
                type="submit"
                disabled={saving || (password && !isPasswordValid)}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium cursor-pointer transition-colors disabled:opacity-50"
              >
                Crear
              </button>
            </div>
          </div>

          {password.length > 0 && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-[11px] grid grid-cols-2 sm:grid-cols-5 gap-2">
              <span className={`flex items-center gap-1 ${passwordChecks.length ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                {passwordChecks.length ? <Check size={12} /> : <X size={12} />} Mínimo 8 caracteres
              </span>
              <span className={`flex items-center gap-1 ${passwordChecks.upper ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                {passwordChecks.upper ? <Check size={12} /> : <X size={12} />} 1 Mayúscula
              </span>
              <span className={`flex items-center gap-1 ${passwordChecks.lower ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                {passwordChecks.lower ? <Check size={12} /> : <X size={12} />} 1 Minúscula
              </span>
              <span className={`flex items-center gap-1 ${passwordChecks.number ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                {passwordChecks.number ? <Check size={12} /> : <X size={12} />} 1 Número
              </span>
              <span className={`flex items-center gap-1 ${passwordChecks.special ? 'text-emerald-700 font-medium' : 'text-slate-400'}`}>
                {passwordChecks.special ? <Check size={12} /> : <X size={12} />} 1 Signo especial
              </span>
            </div>
          )}
        </form>
      </div>

      <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-3.5 border-b border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">
            Usuarios registrados ({usuarios.length})
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">
            Cargando usuarios...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium text-[11px]">
                <tr>
                  <th className="py-2.5 px-4">Usuario</th>
                  <th className="py-2.5 px-4">Nombre</th>
                  <th className="py-2.5 px-4">Correo</th>
                  <th className="py-2.5 px-4">Rol asignado</th>
                  <th className="py-2.5 px-4">Estado</th>
                  <th className="py-2.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => {
                  const isCurrent = u.id_usuario === currentUser?.id_usuario;
                  const isTargetSuperAdmin = u.rol === 'Super Admin';
                  const canToggleState = !isTargetSuperAdmin && !isCurrent;

                  return (
                    <tr key={u.id_usuario} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-900">
                            {u.username || u.email.split('@')[0]}
                            {isCurrent && <span className="ml-1.5 text-[10px] text-slate-400">(Tú)</span>}
                          </span>
                          <span className="text-[10px] text-slate-400">{u.nombre_completo}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {u.email}
                      </td>
                      <td className="py-3 px-4">
                        {isSuperAdmin && !isTargetSuperAdmin && !isCurrent ? (
                          <select
                            value={u.rol}
                            onChange={(e) => handleUpdateRol(u.id_usuario, e.target.value)}
                            className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 cursor-pointer"
                          >
                            <option value="Admin">Admin</option>
                            <option value="Usuarios">Usuarios</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                            u.rol === 'Super Admin'
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : u.rol === 'Admin'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {u.rol}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${
                          u.activo ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {u.activo ? 'Activo' : 'Suspendido'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canToggleState ? (
                          <button
                            type="button"
                            onClick={() => requestToggleEstado(u.id_usuario, u.nombre_completo, !u.activo)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                              u.activo
                                ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                            }`}
                          >
                            {u.activo ? 'Suspender' : 'Reactivar'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Protegido</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={modalSuspend.isOpen}
        title={modalSuspend.nuevoEstado ? '¿Desea reactivar a este usuario?' : '¿Desea suspender a este usuario?'}
        message={
          modalSuspend.nuevoEstado
            ? `El usuario "${modalSuspend.nombre}" volverá a tener acceso a la plataforma.`
            : `El usuario "${modalSuspend.nombre}" no podrá iniciar sesión en la plataforma mientras se encuentre suspendido.`
        }
        confirmText={modalSuspend.nuevoEstado ? 'Reactivar usuario' : 'Suspender usuario'}
        cancelText="Cancelar"
        variant={modalSuspend.nuevoEstado ? 'info' : 'danger'}
        onConfirm={confirmToggleEstado}
        onCancel={() => setModalSuspend({ isOpen: false, id: null, nombre: '', nuevoEstado: false })}
      />

      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
}
