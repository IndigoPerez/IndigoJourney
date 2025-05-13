import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogIn, LogOut, UserPlus } from 'lucide-react';

const Auth: React.FC = () => {
  const { supabase, user, signOut } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [signupCooldown, setSignupCooldown] = useState(false);
  const [cooldownTime, setCooldownTime] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (signupCooldown && cooldownTime > 0) {
      timer = setInterval(() => {
        setCooldownTime((prev) => prev - 1);
      }, 1000);
    }

    if (cooldownTime === 0) {
      setSignupCooldown(false);
      setCooldownTime(60);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [signupCooldown, cooldownTime]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) {
          if (error.status === 429) {
            setSignupCooldown(true);
            throw new Error('Please wait before attempting to sign up again.');
          }
          throw error;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1 px-3 py-1 text-sm text-gray-700 hover:text-gray-900"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleAuth} className="flex items-center gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="px-3 py-1 text-sm border rounded"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="px-3 py-1 text-sm border rounded"
        required
      />
      <button
        type="submit"
        disabled={loading || (isSignUp && signupCooldown)}
        className={`flex items-center gap-1 px-3 py-1 text-sm text-white rounded ${
          loading || (isSignUp && signupCooldown)
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        {isSignUp ? (
          <>
            <UserPlus className="w-4 h-4" />
            {signupCooldown ? `Wait ${cooldownTime}s` : 'Sign Up'}
          </>
        ) : (
          <>
            <LogIn className="w-4 h-4" />
            Sign In
          </>
        )}
      </button>
      <button
        type="button"
        onClick={() => {
          setIsSignUp(!isSignUp);
          setError(null);
        }}
        className="text-sm text-blue-500 hover:text-blue-600"
      >
        {isSignUp ? 'Have an account? Sign In' : 'Need an account? Sign Up'}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
};

export default Auth;