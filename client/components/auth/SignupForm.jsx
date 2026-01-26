'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, User, ArrowRight, Loader2, Sprout, CheckCircle, Leaf } from 'lucide-react';

export default function SignupForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [role, setRole] = useState('user');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signUp(email, password, { name, role });
            // Show success or redirect
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] overflow-hidden relative font-sans">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[10%] right-[10%] w-[500px] h-[500px] bg-indigo-400/30 rounded-full blur-[120px] mix-blend-multiply filter animate-blob"></div>
                <div className="absolute bottom-[0%] left-[10%] w-[500px] h-[500px] bg-cyan-400/30 rounded-full blur-[120px] mix-blend-multiply filter animate-blob animation-delay-2000"></div>
            </div>

            <div className="max-w-md w-full relative z-10 p-6">
                <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-2xl shadow-indigo-900/10 border border-white/50 p-8 md:p-12 overflow-hidden relative">

                    {/* Decorative Top Gradient */}
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                    <div className="text-center mb-10">
                        <div className="mx-auto h-20 w-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
                            <Leaf size={40} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">
                            Join SmartAg
                        </h2>
                        <p className="text-gray-500 font-medium">
                            Start your journey to smarter, data-driven agriculture today.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        {error && (
                            <div className="rounded-2xl bg-red-50 p-4 border border-red-100 flex items-start gap-3 animate-in slide-in-from-top-2">
                                <div className="p-1 bg-red-100 rounded-full text-red-600 shrink-0">
                                    <Leaf size={14} className="rotate-180" />
                                </div>
                                <p className="text-sm font-bold text-red-800 pt-0.5">{error}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <User size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all font-bold text-gray-900 placeholder-gray-300"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all font-bold text-gray-900 placeholder-gray-300"
                                    placeholder="farmer@smartag.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                </div>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full pl-11 pr-4 py-4 bg-gray-50/50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-500 transition-all font-bold text-gray-900 placeholder-gray-300"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Terms checkbox */}
                        <div className="flex items-center gap-3 px-1">
                            <div className="relative flex items-center">
                                <input type="checkbox" id="terms" className="peer h-5 w-5 cursor-pointer appearance-none rounded-lg border-2 border-gray-200 checked:bg-indigo-600 checked:border-indigo-600 transition-all" required />
                                <CheckCircle size={12} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                            </div>
                            <label htmlFor="terms" className="text-xs font-bold text-gray-500 cursor-pointer select-none">
                                I agree to the <span className="text-indigo-600">Terms of Service</span> & <span className="text-indigo-600">Privacy Policy</span>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center gap-2 py-4 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-bold text-sm uppercase tracking-wider shadow-xl shadow-gray-900/20 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <span className="flex items-center gap-2">Create Account <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" /></span>}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <p className="text-sm font-medium text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-1 hover:gap-2 duration-300">
                                Sign In <ArrowRight size={14} />
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
