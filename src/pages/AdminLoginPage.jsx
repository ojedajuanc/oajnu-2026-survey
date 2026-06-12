import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { ROUTES } from '../config/constants.js';
import Button from '../components/ui/Button.jsx';
import FieldError from '../components/ui/FieldError.jsx';

export default function AdminLoginPage() {
  const { isAdmin, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  // Already authenticated as admin → go to surveys list.
  useEffect(() => {
    if (!loading && isAdmin) navigate(ROUTES.ADMIN_SURVEYS, { replace: true });
  }, [isAdmin, loading, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await signIn(email, password);
      navigate(ROUTES.ADMIN_SURVEYS, { replace: true });
    } catch (err) {
      setError('Credenciales incorrectas.');
      setBusy(false);
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login__card" onSubmit={handleSubmit}>
        <h2 className="admin-login__title">Acceso moderador</h2>
        <div className="field">
          <label className="field__label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="field">
          <label className="field__label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <FieldError message={error} />
        <Button variant="primary" type="submit" disabled={busy} style={{ width: '100%', marginTop: 8 }}>
          {busy ? 'Ingresando…' : 'Ingresar'}
        </Button>
      </form>
    </div>
  );
}
