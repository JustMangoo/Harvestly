import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/Button.jsx";
import { supabase } from "../lib/supabaseClient";
import "./AuthPage.css";

export default function AuthPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [authMode, setAuthMode] = useState("signIn");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authMessage, setAuthMessage] = useState(null);
  const [credentials, setCredentials] = useState({ email: "", password: "" });

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      navigate("/", { replace: true });
    }
  }, [session, navigate]);

  const handleCredentialChange = (event) => {
    const { name, value } = event.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setAuthLoading(true);
    setAuthError(null);
    setAuthMessage(null);

    try {
      if (authMode === "signIn") {
        const { error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
        });
        if (error) throw error;
        if (!data.user) {
          setAuthMessage(
            "Check your email to confirm your account before signing in."
          );
        } else {
          setAuthMessage(
            "Account created! You can sign in once you confirm the email from Supabase."
          );
        }
      }
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h2>{authMode === "signIn" ? "Sign in" : "Create an account"}</h2>
      <p>
        {authMode === "signIn"
          ? "Access your saved plants and tasks."
          : "Create an account to keep your plants in sync across devices."}
      </p>

      <form onSubmit={handleSubmit} className="auth-form">
        <label>
          Email
          <input
            type="email"
            name="email"
            value={credentials.email}
            onChange={handleCredentialChange}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={credentials.password}
            onChange={handleCredentialChange}
            required
          />
        </label>
        <Button
          type="submit"
          icon={authMode === "signIn" ? "login" : "person_add"}
          text={
            authLoading
              ? authMode === "signIn"
                ? "Signing in..."
                : "Creating..."
              : authMode === "signIn"
              ? "Sign In"
              : "Sign Up"
          }
          disabled={authLoading}
        />
      </form>
      <Button
        variant="ghost"
        onClick={() =>
          setAuthMode((mode) => (mode === "signIn" ? "signUp" : "signIn"))
        }
        text={
          authMode === "signIn"
            ? "Need an account? Sign up"
            : "Already have an account? Sign in"
        }
        disabled={authLoading}
      />

      {authError && <p className="error-message">{authError}</p>}
      {authMessage && <p className="auth-message">{authMessage}</p>}
      {authMode === "signUp" && (
        <p className="auth-help">
          After signing up, Supabase will email a confirmation link. Follow it
          before logging in.
        </p>
      )}
    </div>
  );
}
