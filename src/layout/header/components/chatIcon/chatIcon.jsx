import React from 'react'

export default function ChatIcon(props) {

    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width={24} 
            height={24} 
            viewBox="0 0 24 24" 
            {...props}
        >
            <path fill="currentColor" fillOpacity={0} d="M5 15.5c1 1 2.5 2 4 2.5c-0.71 -0.24 -1.43 -0.59 -2.09 -1c-0.72 -0.45 -1.39 -0.98 -1.91 -1.5Z">
                <animate 
                    id="pathAnim"
                    fill="freeze" 
                    attributeName="d" 
                    begin="1.2s" 
                    dur="0.4s" 
                    values="M5 15.5c1 1 2.5 2 4 2.5c-0.71 -0.24 -1.43 -0.59 -2.09 -1c-0.72 -0.45 -1.39 -0.98 -1.91 -1.5Z;M5 15.5c1 1 2.5 2 4 2.5c-2 2 -5 3 -7 3c2 -2 3 -3.5 3 -5.5Z">
                </animate>
                <set 
                    id="opacityAnim"
                    fill="freeze" 
                    attributeName="fill-opacity" 
                    begin="1.2s;opacityAnim.end+2s" 
                    to={1}>
                </set>
            </path>
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
                <path strokeDasharray={56} strokeDashoffset={56} d="M7 16.82c-2.41 -1.25 -4 -3.39 -4 -5.82c0 -3.87 4.03 -7 9 -7c4.97 0 9 3.13 9 7c0 3.87 -4.03 7 -9 7c-1.85 0 -3.57 -0.43 -5 -1.18Z">
                    <animate 
                        id="outlineAnim"
                        fill="freeze" 
                        attributeName="stroke-dashoffset" 
                        begin="0s;outlineAnim.end+2s" 
                        dur="1s" 
                        values="56;0">
                    </animate>
                </path>
                <path strokeDasharray={2} strokeDashoffset={2} d="M8 11h0.01">
                    <animate 
                        id="dot1Anim"
                        fill="freeze" 
                        attributeName="stroke-dashoffset" 
                        begin="outlineAnim.end" 
                        dur="0.3s" 
                        values="2;0">
                    </animate>
                </path>
                <path strokeDasharray={2} strokeDashoffset={2} d="M12 11h0.01">
                    <animate 
                        id="dot2Anim"
                        fill="freeze" 
                        attributeName="stroke-dashoffset" 
                        begin="dot1Anim.end" 
                        dur="0.3s" 
                        values="2;0">
                    </animate>
                </path>
                <path strokeDasharray={2} strokeDashoffset={2} d="M16 11h0.01">
                    <animate 
                        id="dot3Anim"
                        fill="freeze" 
                        attributeName="stroke-dashoffset" 
                        begin="dot2Anim.end" 
                        dur="0.3s" 
                        values="2;0">
                    </animate>
                </path>
            </g>
        </svg>
    );
}
