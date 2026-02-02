'use client'

import React, { useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, DollarSign, Tag, Calendar, FileText, Loader2 } from 'lucide-react'
import { createExpense } from '@/lib/api'
import { toast } from 'react-hot-toast'
import { useTranslation } from 'react-i18next'

const AddTransactionModal = ({ isOpen, onClose, onSuccess }) => {
    const { t } = useTranslation()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        category: 'Supplies',
        amount: '',
        date: new Date().toISOString().split('T')[0]
    })

    const categories = ['Supplies', 'Utility', 'Repairs', 'Income', 'Other']

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const amount = parseFloat(formData.amount)
            if (isNaN(amount)) throw new Error('Invalid amount')

            // Adjust amount: negative for expenses (all except Income), positive for Income
            const finalAmount = formData.category === 'Income' ? Math.abs(amount) : -Math.abs(amount)

            await createExpense({
                ...formData,
                amount: finalAmount,
                date: new Date(formData.date).toISOString()
            })

            toast.success(t('expenses_page.modal.success'))
            onSuccess()
            onClose()
            setFormData({
                title: '',
                category: 'Supplies',
                amount: '',
                date: new Date().toISOString().split('T')[0]
            })
        } catch (error) {
            console.error('Error adding transaction:', error)
            toast.error(error.message || t('expenses_page.modal.error'))
        } finally {
            setLoading(false)
        }
    }

    return (
        <Transition show={isOpen} as={React.Fragment}>
            <Dialog as="div" className="relative z-[100]" onClose={onClose}>
                <Transition.Child
                    as={React.Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={React.Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-[2.5rem] bg-card border border-border p-8 text-left align-middle shadow-2xl transition-all">
                                <div className="flex justify-between items-center mb-6">
                                    <Dialog.Title as="h3" className="text-2xl font-black text-foreground tracking-tight">
                                        {t('expenses_page.modal.title')} <span className="text-accent underline decoration-accent/30 decoration-4 underline-offset-4">{t('expenses_page.modal.subtitle')}</span>
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-foreground/40 hover:text-foreground transition-colors">
                                        <X size={24} />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Title */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">{t('expenses_page.modal.item_name')}</label>
                                        <div className="relative">
                                            <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" size={18} />
                                            <input
                                                type="text"
                                                required
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full bg-foreground/5 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-accent/50 transition-all font-medium"
                                                placeholder={t('expenses_page.modal.placeholder_item')}
                                            />
                                        </div>
                                    </div>

                                    {/* Category & Amount */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">{t('expenses_page.modal.category')}</label>
                                            <div className="relative">
                                                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" size={18} />
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full bg-foreground/5 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground appearance-none focus:outline-none focus:border-accent/50 transition-all font-medium cursor-pointer"
                                                >
                                                    {categories.map(cat => (
                                                        <option key={cat} value={cat} className="bg-card text-foreground">{t(`expenses_page.categories.${cat.toLowerCase()}`)}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">{t('expenses_page.modal.amount')}</label>
                                            <div className="relative">
                                                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" size={18} />
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    required
                                                    value={formData.amount}
                                                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                                    className="w-full bg-foreground/5 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-accent/50 transition-all font-medium"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date */}
                                    <div>
                                        <label className="block text-[10px] font-bold text-foreground/40 uppercase tracking-widest mb-2">{t('expenses_page.modal.date')}</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none" size={18} />
                                            <input
                                                type="date"
                                                required
                                                value={formData.date}
                                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                onClick={(e) => {
                                                    try {
                                                        if (e.target.showPicker) e.target.showPicker();
                                                    } catch (err) {
                                                        console.warn('showPicker failed:', err);
                                                    }
                                                }}
                                                className="w-full bg-foreground/5 border border-border rounded-2xl py-4 pl-12 pr-4 text-foreground focus:outline-none focus:border-accent/50 transition-all font-medium cursor-pointer dark:[color-scheme:dark]"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full py-4 bg-accent rounded-2xl text-[#020603] font-black text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(21,255,113,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                                    >
                                        {loading ? (
                                            <Loader2 size={20} className="animate-spin" />
                                        ) : (
                                            <>
                                                {t('expenses_page.modal.save')}
                                                <X size={18} className="rotate-45 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </form>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    )
}

export default AddTransactionModal
