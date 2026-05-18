import { SVGAttributes } from 'react';

export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] ${props.className || ''}`}>
            <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
    );
}
