import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IoEye, IoEyeOff } from "react-icons/io5";
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
  const [credentials, setCredentials] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        // Simple client-side validation before sign-up
        if (credentials.password.length < 8) {
          throw new Error("Password must be at least 8 characters long.");
        }
        if (credentials.password !== credentials.confirmPassword) {
          throw new Error("Passwords do not match.");
        }
        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              name: credentials.name,
            },
          },
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
      <div className="auth-container">
        <div className="auth-header">
          <h2>
            {authMode === "signIn" ? "Welcome back!" : "Join Harvestly today"}
          </h2>
          <p className="auth-subtext">
            {authMode === "signIn" ? (
              <>
                Don’t have an account?{" "}
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => setAuthMode("signUp")}
                  disabled={authLoading}
                >
                  Sign-up here
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  className="auth-link"
                  onClick={() => setAuthMode("signIn")}
                  disabled={authLoading}
                >
                  Login here
                </button>
              </>
            )}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {authMode === "signUp" && (
            <label>
              Name
              <input
                type="text"
                name="name"
                value={credentials.name}
                onChange={handleCredentialChange}
                placeholder="ex. Max"
                required
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              name="email"
              value={credentials.email}
              onChange={handleCredentialChange}
              placeholder="example@gmail.com"
              required
            />
          </label>

          <label>
            Password
            <div className="input-with-icon">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={handleCredentialChange}
                placeholder="must be 8 characters"
                required
                minLength={8}
              />
              <button
                type="button"
                className="toggle-visibility"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                {showPassword ? <IoEyeOff size={20} /> : <IoEye size={20} />}
              </button>
            </div>
          </label>

          {authMode === "signUp" && (
            <label>
              Confirm password
              <div className="input-with-icon">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={credentials.confirmPassword}
                  onChange={handleCredentialChange}
                  placeholder="repeat password"
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="toggle-visibility"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <IoEyeOff size={20} />
                  ) : (
                    <IoEye size={20} />
                  )}
                </button>
              </div>
            </label>
          )}

          <Button
            type="submit"
            icon={authMode === "signIn" ? "login" : "person_add"}
            text={
              authLoading
                ? authMode === "signIn"
                  ? "Signing in..."
                  : "Creating..."
                : authMode === "signIn"
                ? "Log In"
                : "Continue"
            }
            disabled={authLoading}
          />
        </form>

        {/* Social auth removed as requested */}

        {authError && <p className="error-message">{authError}</p>}
        {authMessage && <p className="auth-message">{authMessage}</p>}
        {authMode === "signUp" && (
          <p className="auth-help">
            After signing up, Supabase will email a confirmation link. Follow it
            before logging in.
          </p>
        )}
      </div>
    </div>
  );
}
