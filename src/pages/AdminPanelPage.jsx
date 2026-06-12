import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useActiveSurvey } from '../context/ActiveSurveyContext.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { getSurvey, saveSurvey } from '../services/survey.service.js';
import { getSession, saveSession, setPublished, subscribeSession } from '../services/session.service.js';
import { validateSurvey } from '../modules/spec-validator.js';
import { DEFAULT_META, DEFAULT_SETTINGS, QUESTION_TYPES, defaultConfigFor } from '../config/constants.js';
import AdminTabs from '../components/admin/AdminTabs.jsx';
import QuestionList from '../components/admin/QuestionList.jsx';
import QuestionEditor from '../components/admin/QuestionEditor.jsx';
import Button from '../components/ui/Button.jsx';
import Toggle from '../components/ui/Toggle.jsx';

function newQuestionId() {
  return `q-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function AdminPanelPage() {
  const { user } = useAuth();
  const { activeSurveyId, activeSessionId, setActiveSessionId } = useActiveSurvey();
  const { show } = useToast();

  const [meta, setMeta] = useState(DEFAULT_META);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [questions, setQuestions] = useState({}); // map id → question
  const [sessionLabel, setSessionLabel] = useState('');
  const [published, setPublishedState] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [editing, setEditing] = useState(null); // question being edited
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!activeSurveyId) return;
    const sid = activeSessionId || 'main';
    if (!activeSessionId) setActiveSessionId(sid);

    let surveyLoaded = false;
    let sessionLoaded = false;
    function checkDone() {
      if (surveyLoaded && sessionLoaded) setLoading(false);
    }

    (async () => {
      const survey = await getSurvey(activeSurveyId);
      if (survey) {
        setMeta({ ...DEFAULT_META, ...survey.meta });
        setSettings({ ...DEFAULT_SETTINGS, ...survey.settings });
        setQuestions(survey.questions || {});
      }
      surveyLoaded = true;
      checkDone();
    })();

    const unsub = subscribeSession((session) => {
      if (session) {
        setSessionLabel(session.label || '');
        setPublishedState(!!session.published);
        setRoomCode(session.roomCode || null);
      }
      sessionLoaded = true;
      checkDone();
    }, activeSurveyId, sid);

    return unsub;
  }, [activeSurveyId]);

  const orderedQuestions = Object.entries(questions)
    .map(([id, q]) => ({ id, ...q }))
    .sort((a, b) => a.order - b.order);

  function addQuestion() {
    const id = newQuestionId();
    const order = orderedQuestions.length;
    const type = QUESTION_TYPES.BINARY;
    const q = { order, type, prompt: '', required: false, config: defaultConfigFor(type) };
    setQuestions((prev) => ({ ...prev, [id]: q }));
    setEditing({ id, ...q });
  }

  function saveQuestion(updated) {
    const { id, ...rest } = updated;
    setQuestions((prev) => ({ ...prev, [id]: rest }));
    setEditing(null);
  }

  function deleteQuestion(id) {
    setQuestions((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function reorder(orderedIds) {
    setQuestions((prev) => {
      const next = { ...prev };
      orderedIds.forEach((id, idx) => {
        next[id] = { ...next[id], order: idx };
      });
      return next;
    });
  }

  async function handleSave() {
    const data = { meta, settings, questions };
    const { valid, errors } = validateSurvey(data);
    if (!valid) {
      show(errors[0], 'error');
      return;
    }
    setSaving(true);
    try {
      await saveSurvey(data, activeSurveyId);
      await saveSession({ label: sessionLabel, createdBy: user?.uid }, activeSurveyId, activeSessionId || 'main');
      show('Cambios guardados.', 'success');
    } catch (e) {
      show('No se pudo guardar.', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function togglePublish(value) {
    // Block publishing an invalid survey (NFR-05).
    if (value) {
      const { valid, errors } = validateSurvey({ meta, settings, questions });
      if (!valid) {
        show(errors[0], 'error');
        return;
      }
    }
    setPublishedState(value);
    try {
      await setPublished(value, user?.uid, activeSurveyId, activeSessionId || 'main');
      show(value ? 'Encuesta publicada.' : 'Encuesta despublicada.', 'success');
    } catch (e) {
      setPublishedState(!value);
      show('No se pudo actualizar la publicación.', 'error');
    }
  }

  if (loading) return <div className="page-center">Cargando…</div>;

  return (
    <div className="admin">
      <AdminTabs active="panel" />

      <section className="admin__section">
        <h3 className="admin__section-title">Metadatos</h3>
        <div className="card stack">
          <MetaField label="Título" value={meta.title} onChange={(v) => setMeta({ ...meta, title: v })} />
          <MetaField
            label="Descripción"
            value={meta.description}
            textarea
            onChange={(v) => setMeta({ ...meta, description: v })}
          />
          <MetaField
            label="URL de imagen de portada (opcional)"
            value={meta.coverImageUrl || ''}
            onChange={(v) => setMeta({ ...meta, coverImageUrl: v || null })}
          />
          <MetaField
            label="Etiqueta del botón de envío"
            value={meta.submitLabel}
            onChange={(v) => setMeta({ ...meta, submitLabel: v })}
          />
          <MetaField
            label="Título de agradecimiento"
            value={meta.thankYouTitle}
            onChange={(v) => setMeta({ ...meta, thankYouTitle: v })}
          />
          <MetaField
            label="Texto de agradecimiento"
            value={meta.thankYouBody}
            textarea
            onChange={(v) => setMeta({ ...meta, thankYouBody: v })}
          />
          <Toggle
            checked={settings.allowBackNavigation}
            onChange={(v) => setSettings({ ...settings, allowBackNavigation: v })}
            label="Permitir volver a preguntas anteriores"
          />
        </div>
      </section>

      <section className="admin__section">
        <h3 className="admin__section-title">Sesión</h3>
        <div className="card stack">
          <MetaField
            label="Nombre de la sesión"
            value={sessionLabel}
            onChange={setSessionLabel}
          />
          <Toggle checked={published} onChange={togglePublish} label="Publicada" />
          {roomCode && <RoomCodeBadge roomCode={roomCode} onCopy={() => show('¡Enlace copiado!', 'success')} />}
        </div>
      </section>

      <section className="admin__section">
        <h3 className="admin__section-title">Preguntas</h3>
        <QuestionList
          questions={orderedQuestions}
          onEdit={(id) => setEditing({ id, ...questions[id] })}
          onDelete={deleteQuestion}
          onReorder={reorder}
        />
        <Button variant="outline" onClick={addQuestion} style={{ marginTop: 8 }}>
          + Agregar pregunta
        </Button>
      </section>

      <div className="save-bar">
        <Button variant="primary" onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando…' : 'Guardar cambios'}
        </Button>
      </div>

      {editing && (
        <QuestionEditor
          question={editing}
          onSave={saveQuestion}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function MetaField({ label, value, onChange, textarea = false }) {
  return (
    <div className="field" style={{ margin: 0 }}>
      <label className="field__label">{label}</label>
      {textarea ? (
        <textarea className="textarea" value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input className="input" value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
  );
}

export function RoomCodeBadge({ roomCode, onCopy }) {
  function handleCopy() {
    const url = `${window.location.origin}${window.location.pathname}#/?room=${roomCode}`;
    navigator.clipboard.writeText(url).then(onCopy).catch(() => {});
  }
  return (
    <div>
      <label className="field__label">Código de sala</label>
      <button className="room-code-badge" onClick={handleCopy} title="Copiar enlace para participantes">
        <span className="room-code-badge__code">{roomCode}</span>
        <span className="room-code-badge__hint">Clic para copiar enlace</span>
      </button>
    </div>
  );
}
