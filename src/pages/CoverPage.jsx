import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useActiveSurvey } from '../context/ActiveSurveyContext.jsx';
import { useAuthContext } from '../context/AuthContext.jsx';
import { getSessionByRoomCode } from '../services/session.service.js';
import { hasParticipantResponded } from '../services/response.service.js';
import {
  sendParticipantEmailLink,
  isEmailLink,
  signInWithLink,
} from '../services/auth.service.js';
import { useSurvey } from '../hooks/useSurvey.js';
import { ROUTES } from '../config/constants.js';
import Button from '../components/ui/Button.jsx';

const EMAIL_KEY = 'participantEmailForSignIn';

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function CoverPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeSurveyId, activeSessionId, setActiveSurveyId, setActiveSessionId } = useActiveSurvey();
  const { user } = useAuthContext();

  const [roomResolved, setRoomResolved] = useState(false);
  const [roomError, setRoomError] = useState(null);
  const [roomCode, setRoomCode] = useState(null);

  // Auth flow states
  const [authStep, setAuthStep] = useState('idle'); // idle | email-entry | link-sent | signing-in | checking | done | already-responded
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [authError, setAuthError] = useState('');

  // Step 1: Resolve room code from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('room');
    if (code) setRoomCode(code);

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
      .catch(() => {
        setRoomError('No se pudo resolver el código de sala.');
        setRoomResolved(true);
      });
  }, []);

  // Step 2: Handle email link sign-in when landing back from email link
  useEffect(() => {
    if (!isEmailLink(window.location.href)) return;

    setAuthStep('signing-in');
    let storedEmail = localStorage.getItem(EMAIL_KEY);
    if (!storedEmail) {
      storedEmail = window.prompt('Por favor ingresá tu email para confirmar el acceso:') || '';
    }

    signInWithLink(storedEmail, window.location.href)
      .then(() => {
        localStorage.removeItem(EMAIL_KEY);
        // Clean up the sign-in link from URL without reload
        window.history.replaceState(null, '', window.location.pathname + window.location.hash.split('?')[0] + (roomCode ? `?room=${roomCode}` : ''));
      })
      .catch((err) => {
        setAuthError('No se pudo completar el acceso. Intentá de nuevo.');
        setAuthStep('email-entry');
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
    if (isEmailLink(window.location.href)) return; // handled by step 2
    if (authStep === 'idle') {
      setAuthStep('email-entry');
    }
  }, [roomResolved, user]);

  const { survey, session, loading } = useSurvey();

  async function handleSendLink() {
    if (!isValidEmail(email)) {
      setEmailError('Ingresá un email válido.');
      return;
    }
    setEmailError('');
    setAuthStep('signing-in');

    const params = new URLSearchParams(location.search);
    const code = params.get('room') || roomCode;
    const redirectUrl = `${window.location.origin}${window.location.pathname}${window.location.hash.split('?')[0]}${code ? `?room=${code}` : ''}`;

    try {
      await sendParticipantEmailLink(email, {
        url: redirectUrl,
        handleCodeInApp: true,
      });
      localStorage.setItem(EMAIL_KEY, email);
      setAuthStep('link-sent');
    } catch (err) {
      setAuthError('No se pudo enviar el enlace. Verificá el email e intentá de nuevo.');
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

  if (authStep === 'link-sent') {
    return (
      <div className="cover">
        <h1 className="cover__title">Revisá tu email</h1>
        <p className="cover__desc">
          Te enviamos un enlace a <strong>{email}</strong>. Hacé clic en el enlace para continuar.
        </p>
      </div>
    );
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
              onKeyDown={(e) => e.key === 'Enter' && handleSendLink()}
              autoFocus
            />
            {emailError && <p className="cover__field-error">{emailError}</p>}
            {authError && <p className="cover__field-error">{authError}</p>}
            <Button variant="primary" lg onClick={handleSendLink}>
              Enviar enlace →
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
