'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, ArrowRight, Loader2, Leaf, Sprout } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background overflow-hidden relative font-sans">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-400/30 rounded-full blur-[120px] mix-blend-multiply filter animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[120px] mix-blend-multiply filter animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-purple-400/30 rounded-full blur-[120px] mix-blend-multiply filter animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-md w-full relative z-10 p-6">
        <div className="bg-card/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-green-900/10 border border-border p-8 md:p-12 overflow-hidden relative">

          {/* Decorative Top Gradient */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500"></div>

          <div className="text-center mb-10">
            <div className="mx-auto h-24 w-24 mb-6 transform hover:scale-105 transition-transform duration-300">
              <img src="/logo.png" alt="SmartAg Logo" className="w-full h-full object-contain" />
            </div>
            <h2 className="text-4xl font-black text-foreground tracking-tight mb-2">
              Welcome Back
            </h2>
            <p className="text-foreground/50 font-medium">
              Enter your credentials to access your farm dashboard.
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
                <div className="p-1 bg-red-100 rounded-full text-red-600 shrink-0">
                  <Leaf size={14} className="rotate-180" />
                </div>
                <p className="text-sm font-bold text-red-800 pt-0.5">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest ml-1">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail size={18} className="text-foreground/40 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-foreground/5 border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-card focus:border-green-500 transition-all font-bold text-foreground placeholder-foreground/20"
                    placeholder="farmer@smartag.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-foreground/40 uppercase tracking-widest ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock size={18} className="text-foreground/40 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-11 pr-4 py-4 bg-foreground/5 border border-border rounded-2xl focus:outline-none focus:ring-4 focus:ring-green-500/10 focus:bg-card focus:border-green-500 transition-all font-bold text-foreground placeholder-foreground/20"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-green-600 focus:ring-green-500 border-border rounded-lg cursor-pointer bg-foreground/5" />
                <label htmlFor="remember-me" className="ml-2 block text-xs font-bold text-foreground/50 cursor-pointer">Remember me</label>
              </div>
              <a href="#" className="text-xs font-bold text-green-600 hover:text-green-700 transition-colors">Recover Password</a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-foreground text-background rounded-2xl font-bold text-sm uppercase tracking-wider shadow-xl shadow-foreground/10 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <span className="flex items-center gap-2">Sign In <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>}
            </button>
          </form>

          < div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm font-medium text-foreground/50">
              New to SmartAg?{' '}
              <Link href="/signup" className="font-bold text-green-600 hover:text-green-700 transition-colors inline-flex items-center gap-1 hover:gap-2 duration-300">
                Create Account <ArrowRight size={14} />
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}