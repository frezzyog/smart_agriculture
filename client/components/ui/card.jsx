import React from 'react'

export const Card = ({ children, className = '', ...props }) => {
    return (
        <div
            className={`bg-card rounded-[2rem] border border-white/5 overflow-hidden ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}
