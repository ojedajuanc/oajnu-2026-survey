import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useActiveSurvey } from '../context/ActiveSurveyContext.jsx';
import { useAuthContext } from '../context/AuthContext.jsx';
import { getSessionByRoomCode } from '../services/session.service.js';
import { hasParticipantResponded } from '../services/response.service.js';
import { signInParticipant } from '../services/auth.service.js';
import { useSurvey } from '../hooks/useSurvey.js';
import { ROUTES } from '../config/constants.js';
import Button from '../components/ui/Button.jsx';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function CoverPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    activeSurveyId,
    activeSessionId,
    setActiveSurveyId,
    setActiveSessionId,
    setParticipantEmail,
  } = useActiveSurvey();
  const { user } = useAuthContext();

  const [roomResolved, setRoomResolved] = useState(false);
  const [roomError, setRoomError] = useState(null);

  // Auth flow states
  const [authStep, setAuthStep] = useState('idle'); // idle | email-entry | signing-in | checking | done | already-responded
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [authError, setAuthError] = useState('');

  // Step 1: Resolve room code from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('room');

    if (!code) {
      setRoomResolved(true);
      return;
    }

    if (activeSurveyId && activeSessionId) {
      setRoomResolved(true);
      return;
    }

    getSessionByRoomCode(code)
      .then((result) => {
        if (!result) {
          setRoomError(`Código de sala "${code}" no encontrado.`);
        } else {
          setActiveSurveyId(result.surveyId);
          setActiveSessionId(result.sessionId);
        }
        setRoomResolved(true);
      })
      .catch((err) => {
        console.error('getSessionByRoomCode error:', err);
        setRoomError('No se pudo resolver el código de sala.');
        setRoomResolved(true);
      });
  }, []);

  // Step 3: Once user is authenticated (or already was), check duplicate + show start button
  useEffect(() => {
    if (!user || !activeSurveyId || !activeSessionId) return;
    if (authStep === 'done' || authStep === 'already-responded') return;

    setAuthStep('checking');
    hasParticipantResponded(user.uid, activeSurveyId, activeSessionId)
      .then((responded) => {
        setAuthStep(responded ? 'already-responded' : 'done');
      })
      .catch(() => {
        setAuthStep('done'); // fail open — let them proceed if check fails
      });
  }, [user, activeSurveyId, activeSessionId]);

  // Step 4: If not authenticated yet, show email entry after room resolved
  useEffect(() => {
    if (!roomResolved) return;
    if (user) return; // already handled by step 3
    if (authStep === 'idle') {
      setAuthStep('email-entry');
    }
  }, [roomResolved, user]);

  const { survey, session, loading } = useSurvey();

  async function handleEnter() {
    if (!isValidEmail(email)) {
      setEmailError('Ingresá un email válido.');
      return;
    }
    setEmailError('');
    setAuthStep('signing-in');

    try {
      setParticipantEmail(email);
      await signInParticipant();
      // onAuthStateChanged sets `user`; Step 3 takes over (duplicate check → done).
    } catch (err) {
      setAuthError('No se pudo acceder. Intentá de nuevo.');
      setAuthStep('email-entry');
    }
  }

  if (!roomResolved || loading || authStep === 'idle' || authStep === 'checking') {
    return <div className="page-center">Cargando…</div>;
  }

  if (roomError) {
    return (
      <div className="cover">
        <p className="cover__unavailable">{roomError}</p>
      </div>
    );
  }

  if (!activeSurveyId) {
    return (
      <div className="cover">
        <p className="cover__unavailable">Ingresá un código de sala para acceder a la encuesta.</p>
      </div>
    );
  }

  const meta = survey?.meta;
  const published = session?.published === true;

  // Auth flow UI
  if (authStep === 'signing-in') {
    return <div className="page-center">Verificando acceso…</div>;
  }

  if (authStep === 'already-responded') {
    return (
      <div className="cover">
        <h1 className="cover__title">{meta?.title || 'Encuesta'}</h1>
        <p className="cover__unavailable">Ya registraste tus respuestas para esta sesión.</p>
      </div>
    );
  }

  if (authStep === 'email-entry') {
    return (
      <div className="cover">
        {meta?.coverImageUrl && (
          <img className="cover__image" src={meta.coverImageUrl} alt="" />
        )}
        <h1 className="cover__title">{meta?.title || 'Encuesta'}</h1>
        {meta?.description && <p className="cover__desc">{meta.description}</p>}

        {!published ? (
          <p className="cover__unavailable">La encuesta no está disponible en este momento.</p>
        ) : (
          <div className="cover__email-form">
            <label className="field__label">Ingresá tu email para acceder</label>
            <input
              className="input"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleEnter()}
              autoFocus
            />
            {emailError && <p className="cover__field-error">{emailError}</p>}
            {authError && <p className="cover__field-error">{authError}</p>}
            <Button variant="primary" lg onClick={handleEnter}>
              Comenzar →
            </Button>
          </div>
        )}
      </div>
    );
  }

  // authStep === 'done': authenticated, not duplicate
  return (
    <div className="cover">
      {meta?.coverImageUrl && (
        <img className="cover__image" src={meta.coverImageUrl} alt="" />
      )}
      <h1 className="cover__title">{meta?.title || 'Encuesta'}</h1>
      {meta?.description && <p className="cover__desc">{meta.description}</p>}

      {published ? (
        <Button variant="primary" lg onClick={() => navigate(ROUTES.SURVEY)}>
          Comenzar →
        </Button>
      ) : (
        <p className="cover__unavailable">
          La encuesta no está disponible en este momento.
        </p>
      )}
    </div>
  );
}
