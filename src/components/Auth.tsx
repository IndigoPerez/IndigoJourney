import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { LogIn, LogOut, UserPlus } from 'lucide-react';

const Auth: React.FC = () => {
  const { supabase, user, signOut } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        if (error) throw error;
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
        disabled={loading}
        className="flex items-center gap-1 px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
      >
        {isSignUp ? (
          <>
            <UserPlus className="w-4 h-4" />
            Sign Up
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
        onClick={() => setIsSignUp(!isSignUp)}
        className="text-sm text-blue-500 hover:text-blue-600"
      >
        {isSignUp ? 'Have an account? Sign In' : 'Need an account? Sign Up'}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  );
};

export default Auth;