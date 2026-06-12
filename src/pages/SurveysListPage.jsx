import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useActiveSurvey } from '../context/ActiveSurveyContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { listSurveys, createSurvey, deleteSurvey, renameSurvey } from '../services/survey.service.js';
import { ROUTES } from '../config/constants.js';
import Button from '../components/ui/Button.jsx';
import Modal from '../components/ui/Modal.jsx';
import AdminTabs from '../components/admin/AdminTabs.jsx';

function formatDate(ts) {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function SurveysListPage() {
  const { user } = useAuth();
  const { setActiveSurveyId, setActiveSessionId } = useActiveSurvey();
  const { show } = useToast();
  const navigate = useNavigate();

  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [renameTarget, setRenameTarget] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  async function load() {
    setLoading(true);
    try {
      setSurveys(await listSurveys());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    try {
      const id = await createSurvey(name, user?.uid);
      setCreating(false);
      setNewName('');
      setActiveSurveyId(id);
      setActiveSessionId(null);
      navigate(ROUTES.ADMIN_PANEL);
    } catch {
      show('No se pudo crear la encuesta.', 'error');
    }
  }

  async function handleDelete() {
    try {
      await deleteSurvey(deleteTarget.id);
      show('Encuesta eliminada.', 'success');
      setDeleteTarget(null);
      load();
    } catch {
      show('No se pudo eliminar.', 'error');
    }
  }

  async function handleRename() {
    const name = renameValue.trim();
    if (!name) return;
    try {
      await renameSurvey(renameTarget.id, name);
      show('Nombre actualizado.', 'success');
      setRenameTarget(null);
      setRenameValue('');
      load();
    } catch {
      show('No se pudo renombrar.', 'error');
    }
  }

  function openSurvey(survey) {
    setActiveSurveyId(survey.id);
    setActiveSessionId(null);
    navigate(ROUTES.ADMIN_PANEL);
  }

  return (
    <div className="admin">
      <AdminTabs active="surveys" />

      <section className="admin__section">
        <div className="admin__section-head">
          <h3 className="admin__section-title">Mis encuestas</h3>
          <Button variant="primary" onClick={() => setCreating(true)}>
            + Nueva encuesta
          </Button>
        </div>

        {loading ? (
          <p className="muted">Cargando…</p>
        ) : surveys.length === 0 ? (
          <p className="muted">No hay encuestas todavía. Creá una para empezar.</p>
        ) : (
          <div className="surveys-list">
            {surveys.map((s) => (
              <div className="surveys-list__row" key={s.id}>
                <div className="surveys-list__info">
                  <span className="surveys-list__name">{s.name || s.meta?.title || 'Sin nombre'}</span>
                  <span className="surveys-list__date">Creada: {formatDate(s.createdAt)}</span>
                </div>
                <div className="surveys-list__actions">
                  <Button variant="primary" onClick={() => openSurvey(s)}>Abrir</Button>
                  <Button
                    variant="outline"
                    onClick={() => { setRenameTarget(s); setRenameValue(s.name || ''); }}
                  >
                    Renombrar
                  </Button>
                  <Button variant="ghost" onClick={() => setDeleteTarget(s)}>Eliminar</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {creating && (
        <Modal title="Nueva encuesta" onClose={() => setCreating(false)}>
          <div className="stack">
            <div className="field" style={{ margin: 0 }}>
              <label className="field__label">Nombre interno</label>
              <input
                className="input"
                placeholder="Ej: PEO 2026 — Dinámica 1"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                autoFocus
              />
            </div>
            <div className="modal__actions">
              <Button variant="primary" onClick={handleCreate} disabled={!newName.trim()}>
                Crear
              </Button>
              <Button variant="ghost" onClick={() => setCreating(false)}>Cancelar</Button>
            </div>
          </div>
        </Modal>
      )}

      {renameTarget && (
        <Modal title="Renombrar encuesta" onClose={() => setRenameTarget(null)}>
          <div className="stack">
            <div className="field" style={{ margin: 0 }}>
              <label className="field__label">Nuevo nombre</label>
              <input
                className="input"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                autoFocus
              />
            </div>
            <div className="modal__actions">
              <Button variant="primary" onClick={handleRename} disabled={!renameValue.trim()}>
                Guardar
              </Button>
              <Button variant="ghost" onClick={() => setRenameTarget(null)}>Cancelar</Button>
            </div>
          </div>
        </Modal>
      )}

      {deleteTarget && (
        <Modal title="Eliminar encuesta" onClose={() => setDeleteTarget(null)}>
          <div className="stack">
            <p>
              ¿Estás seguro/a de eliminar <strong>{deleteTarget.name || 'esta encuesta'}</strong>?
              Esta acción no se puede deshacer.
            </p>
            <div className="modal__actions">
              <Button variant="primary" onClick={handleDelete}>Eliminar</Button>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancelar</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
