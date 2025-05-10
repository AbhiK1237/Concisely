import React from 'react';

interface SectionHeaderProps {
    badge?: string;
    title: string;
    description?: string;
    dotColor?: string;
}

export function SectionHeader({ badge, title, description, dotColor = 'bg-blue-400' }: SectionHeaderProps) {
    return (
        <div className="text-center mb-20">
            {badge && (
                <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium shadow-sm mb-4">
                    <span className={`flex h-2 w-2 rounded-full ${dotColor} mr-2`}></span>
                    {badge}
                </div>
            )}
            <h2 className="text-3xl font-bold mb-4">{title}</h2>
            {description && <p className="text-gray-700 max-w-2xl mx-auto">{description}</p>}
        </div>
    );
}
