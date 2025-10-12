import React from 'react';
export function IconoirArrowUpRight({ strokeWidth = 1.5, ...props }) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={strokeWidth} d="M6 19L19 6m0 0v12.48M19 6H6.52"></path></svg>);
}

export function RadixIconsCaretRight(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 15 15" {...props}><path fill="currentColor" fillRule="evenodd" d="M6.182 4.182a.45.45 0 0 1 .636 0l3 3a.45.45 0 0 1 0 .636l-3 3a.45.45 0 1 1-.636-.636L8.864 7.5L6.182 4.818a.45.45 0 0 1 0-.636" clipRule="evenodd"></path></svg>);
}

export function MdiArrowTopRightThin(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path fill="currentColor" d="m11.93 5l2.83 2.83L5 17.59L6.42 19l9.76-9.75L19 12.07V5z"></path></svg>);
}

export function UilArrowRight(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M17.92 11.62a1 1 0 0 0-.21-.33l-5-5a1 1 0 0 0-1.42 1.42l3.3 3.29H7a1 1 0 0 0 0 2h7.59l-3.3 3.29a1 1 0 0 0 0 1.42a1 1 0 0 0 1.42 0l5-5a1 1 0 0 0 .21-.33a1 1 0 0 0 0-.76"></path></svg>);
}

export function CircularText(props) {
	return (<svg viewBox="0 0 200 200"      {...props}    >      <defs>        <path d="M0, 100a100, 100 0 1, 0 200, 0a100, 100 0 1, 0 -200, 0" id="txt-path" />      </defs>      <text fontSize="22" letterSpacing="7" fontFamily="DM Sans, sans-serif" fontWeight="900"      >        <textPath startOffset="0" href="#txt-path"        >        PLAY VIDEO PLAY VIDEO PLAY VIDEO        </textPath>      </text>    </svg>);
}

export function BiPlayFill(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 16 16" {...props}><path fill="currentColor" d="m11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"></path></svg>);
}

export function EpCloseBold(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={1024} height={1024} viewBox="0 0 1024 1024" {...props}><path fill="currentColor" d="M195.2 195.2a64 64 0 0 1 90.496 0L512 421.504L738.304 195.2a64 64 0 0 1 90.496 90.496L602.496 512L828.8 738.304a64 64 0 0 1-90.496 90.496L512 602.496L285.696 828.8a64 64 0 0 1-90.496-90.496L421.504 512L195.2 285.696a64 64 0 0 1 0-90.496"></path></svg>);
}

export function EosIconsBubbleLoading(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={50} height={50} viewBox="0 0 24 24" {...props}><circle cx={12} cy={2} r={0} fill="currentColor"><animate attributeName="r" begin={0} calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"></animate></circle><circle cx={12} cy={2} r={0} fill="currentColor" transform="rotate(45 12 12)"><animate attributeName="r" begin="0.125s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"></animate></circle><circle cx={12} cy={2} r={0} fill="currentColor" transform="rotate(90 12 12)"><animate attributeName="r" begin="0.25s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"></animate></circle><circle cx={12} cy={2} r={0} fill="currentColor" transform="rotate(135 12 12)"><animate attributeName="r" begin="0.375s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"></animate></circle><circle cx={12} cy={2} r={0} fill="currentColor" transform="rotate(180 12 12)"><animate attributeName="r" begin="0.5s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"></animate></circle><circle cx={12} cy={2} r={0} fill="currentColor" transform="rotate(225 12 12)"><animate attributeName="r" begin="0.625s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"></animate></circle><circle cx={12} cy={2} r={0} fill="currentColor" transform="rotate(270 12 12)"><animate attributeName="r" begin="0.75s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"></animate></circle><circle cx={12} cy={2} r={0} fill="currentColor" transform="rotate(315 12 12)"><animate attributeName="r" begin="0.875s" calcMode="spline" dur="1s" keySplines="0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8;0.2 0.2 0.4 0.8" repeatCount="indefinite" values="0;2;0;0"></animate></circle></svg>);
}

export function MingcuteMenuFill(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"></path><path fill="currentColor" d="M20 17.5a1.5 1.5 0 0 1 .144 2.993L20 20.5H4a1.5 1.5 0 0 1-.144-2.993L4 17.5zm0-7a1.5 1.5 0 0 1 0 3H4a1.5 1.5 0 0 1 0-3zm0-7a1.5 1.5 0 0 1 0 3H4a1.5 1.5 0 1 1 0-3z"></path></g></svg>);
}

export function LucideDot(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><circle cx={12.1} cy={12.1} r={1} fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}></circle></svg>);
}

export function CiCaretDownSm(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 11l-3 3l-3-3"></path></svg>);
}

export function BulletIcon({ strokeWidth = 1.5, animate, ...props }) { return (<svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 15 15" {...props}><path d="M7.49609 2.55469C4.76172 2.55469 2.54688 4.76953 2.54688 7.50391C2.54688 10.2383 4.76172 12.4531 7.49609 12.4531C10.2305 12.4531 12.4453 10.2383 12.4453 7.50391C12.4453 4.76953 10.2305 2.55469 7.49609 2.55469ZM7.49609 11.6328C5.22656 11.6328 3.36719 9.77344 3.36719 7.50391C3.36719 5.23438 5.22656 3.375 7.49609 3.375C9.76562 3.375 11.625 5.23438 11.625 7.50391C11.625 9.77344 9.76562 11.6328 7.49609 11.6328Z" fill="currentColor" fillOpacity={0.7} /></svg>); }

export function FaCaretUp(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={1024} height={1280} viewBox="0 0 1024 1280" {...props}><path fill="currentColor" d="M1024 960q0 26-19 45t-45 19H64q-26 0-45-19T0 960t19-45l448-448q19-19 45-19t45 19l448 448q19 19 19 45"></path></svg>);
}


export function LineMdTiktok(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><mask id="lineMdTiktok0"><g fill="none" stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path fill="#fff" stroke="none" d="M16.6 5.82c-0.68 -0.78 -1.06 -1.78 -1.06 -2.82h-3.09v12.4c-0.02 0.67 -0.31 1.31 -0.79 1.77c-0.48 0.47 -1.13 0.73 -1.8 0.73c-1.42 0 -2.6 -1.16 -2.6 -2.6c0 -1.72 1.66 -3.01 3.37 -2.48v-3.16c-3.45 -0.46 -6.47 2.22 -6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69 -2.55 5.69 -5.7v-6.29c1.25 0.9 2.76 1.38 4.3 1.38v-3.09c0 0 -1.88 0.09 -3.24 -1.48Z"></path><path stroke="#000" strokeDasharray={36} strokeDashoffset={72} strokeWidth={4} d="M11 11h-1c-2.21 0 -4.5 1.79 -4.5 4c0 2.21 1.5 4.5 4.5 4.5c2.21 0 4 -2.29 4 -4.5v-12.5"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="72;36"></animate></path><path stroke="#000" strokeDasharray={10} strokeDashoffset={20} strokeWidth={4} d="M18 2.5v8"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.1s" values="20;10"></animate></path></g></mask><rect width={24} height={24} fill="currentColor" mask="url(#lineMdTiktok0)"></rect></svg>);
}


export function LineMdFacebook(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={4}><path strokeDasharray={24} strokeDashoffset={24} d="M17 4l-2 0c-2.5 0 -4 1.5 -4 4v12"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="24;0"></animate></path><path strokeDasharray={8} strokeDashoffset={8} d="M8 12h7"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.2s" values="8;0"></animate></path></g></svg>);
}


export function LineMdYoutubeFilled(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><mask id="SVGsyA92bmM"><g fill="none" fillOpacity={0} stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path fill="#fff" strokeDasharray={64} strokeDashoffset={64} d="M12 5c9 0 9 0 9 7c0 7 0 7 -9 7c-9 0 -9 0 -9 -7c0 -7 0 -7 9 -7Z"><animate fill="freeze" attributeName="fill-opacity" begin="0.6s" dur="0.5s" values="0;1"></animate><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"></animate></path><path fill="#000" stroke="none" d="M12 11L12 12L12 13z"><animate fill="freeze" attributeName="d" begin="1.1s" dur="0.2s" values="M12 11L12 12L12 13z;M10 8.5L16 12L10 15.5z"></animate><set fill="freeze" attributeName="fill-opacity" begin="1.1s" to={1}></set></path></g></mask><rect width={24} height={24} fill="#CBFB42" mask="url(#SVGsyA92bmM)"></rect></svg>);
}

export function LineMdInstagram(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><circle cx={17} cy={7} r={1.5} fill="currentColor" fillOpacity={0}><animate fill="freeze" attributeName="fill-opacity" begin="1.3s" dur="0.15s" values="0;1"></animate></circle><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path strokeDasharray={72} strokeDashoffset={72} d="M16 3c2.76 0 5 2.24 5 5v8c0 2.76 -2.24 5 -5 5h-8c-2.76 0 -5 -2.24 -5 -5v-8c0 -2.76 2.24 -5 5 -5h4Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="72;0"></animate></path><path strokeDasharray={28} strokeDashoffset={28} d="M12 8c2.21 0 4 1.79 4 4c0 2.21 -1.79 4 -4 4c-2.21 0 -4 -1.79 -4 -4c0 -2.21 1.79 -4 4 -4"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.6s" values="28;0"></animate></path></g></svg>);
}

export function LineMdLinkedin(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><circle cx={4} cy={4} r={2} fill="currentColor" fillOpacity={0}><animate fill="freeze" attributeName="fill-opacity" dur="0.15s" values="0;1"></animate></circle><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={4}><path strokeDasharray={12} strokeDashoffset={12} d="M4 10v10"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.15s" dur="0.2s" values="12;0"></animate></path><path strokeDasharray={12} strokeDashoffset={12} d="M10 10v10"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.45s" dur="0.2s" values="12;0"></animate></path><path strokeDasharray={24} strokeDashoffset={24} d="M10 15c0 -2.76 2.24 -5 5 -5c2.76 0 5 2.24 5 5v5"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.65s" dur="0.2s" values="24;0"></animate></path></g></svg>);
}

export function LineMdPhoneTwotone(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path fill="currentColor" fillOpacity={0} stroke="currentColor" strokeDasharray={64} strokeDashoffset={64} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 3c0.5 0 2.5 4.5 2.5 5c0 1 -1.5 2 -2 3c-0.5 1 0.5 2 1.5 3c0.39 0.39 2 2 3 1.5c1 -0.5 2 -2 3 -2c0.5 0 5 2 5 2.5c0 2 -1.5 3.5 -3 4c-1.5 0.5 -2.5 0.5 -4.5 0c-2 -0.5 -3.5 -1 -6 -3.5c-2.5 -2.5 -3 -4 -3.5 -6c-0.5 -2 -0.5 -3 0 -4.5c0.5 -1.5 2 -3 4 -3Z"><animate fill="freeze" attributeName="fill-opacity" begin="0.7s" dur="0.15s" values="0;0.3"></animate><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"></animate></path></svg>);
}

export function SiMailDuotone(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><g fill="none"><path fill="currentColor" fillOpacity={0.16} d="M3.2 4h17.6c.66 0 1.2.54 1.2 1.2v12.4c0 1.32-1.08 2.4-2.4 2.4H4.4C3.08 20 2 18.92 2 17.6V5.2C2 4.54 2.54 4 3.2 4"></path><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m5 7.06l6.87 5.89c.07.06.19.06.26 0L19 7.06M3.2 4h17.6c.66 0 1.2.54 1.2 1.2v12.4c0 1.32-1.08 2.4-2.4 2.4H4.4C3.08 20 2 18.92 2 17.6V5.2C2 4.54 2.54 4 3.2 4"></path></g></svg>);
}

export function LineMdHomeTwotone(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={1664} height={1312} viewBox="0 0 1664 1312" {...props}><path fill="currentColor" d="M1408 768v480q0 26-19 45t-45 19H960V928H704v384H320q-26 0-45-19t-19-45V768q0-1 .5-3t.5-3l575-474l575 474q1 2 1 6m223-69l-62 74q-8 9-21 11h-3q-13 0-21-7L832 200L140 777q-12 8-24 7q-13-2-21-11l-62-74q-8-10-7-23.5T37 654L756 55q32-26 76-26t76 26l244 204V64q0-14 9-23t23-9h192q14 0 23 9t9 23v408l219 182q10 8 11 21.5t-7 23.5"></path></svg>);
}

export function CiArrowUpRightMd(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.75} d="M7 17L17 7m0 0H9m8 0v8"></path></svg>);
}
 
export function LineMdPlus(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><g fill="none" stroke="currentColor" strokeDasharray={16} strokeDashoffset={16} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path d="M5 12h14"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="16;0"></animate></path><path d="M12 5v14"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.4s" dur="0.4s" values="16;0"></animate></path></g></svg>);
}

export function ChatIcon(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={576} height={512} viewBox="0 0 576 512" {...props}><path fill="currentColor" d="M416 192c0-88.4-93.1-160-208-160S0 103.6 0 192c0 34.3 14.1 65.9 38 92c-13.4 30.2-35.5 54.2-35.8 54.5c-2.2 2.3-2.8 5.7-1.5 8.7S4.8 352 8 352c36.6 0 66.9-12.3 88.7-25c32.2 15.7 70.3 25 111.3 25c114.9 0 208-71.6 208-160m122 220c23.9-26 38-57.7 38-92c0-66.9-53.5-124.2-129.3-148.1c.9 6.6 1.3 13.3 1.3 20.1c0 105.9-107.7 192-240 192c-10.8 0-21.3-.8-31.7-1.9C207.8 439.6 281.8 480 368 480c41 0 79.1-9.2 111.3-25c21.8 12.7 52.1 25 88.7 25c3.2 0 6.1-1.9 7.3-4.8c1.3-2.9.7-6.3-1.5-8.7c-.3-.3-22.4-24.2-35.8-54.5"></path></svg>);
}
export function MdiHeartOutline(props) {
	return (
<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path fill="currentColor" d="m12.1 18.55l-.1.1l-.11-.1C7.14 14.24 4 11.39 4 8.5C4 6.5 5.5 5 7.5 5c1.54 0 3.04 1 3.57 2.36h1.86C13.46 6 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5c0 2.89-3.14 5.74-7.9 10.05M16.5 3c-1.74 0-3.41.81-4.5 2.08C10.91 3.81 9.24 3 7.5 3C4.42 3 2 5.41 2 8.5c0 3.77 3.4 6.86 8.55 11.53L12 21.35l1.45-1.32C18.6 15.36 22 12.27 22 8.5C22 5.41 19.58 3 16.5 3"></path></svg> )
}
export function Comment(props) {
return (
	<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path fill="#CBFB1C " d="M20 2H4c-1.103 0-2 .897-2 2v18l5.333-4H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2m0 14H6.667L4 18V4h16z"></path></svg>
);
}

export function MdiShareOutline(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} {...props} viewBox="0 0 24 24"><path fill="#CBFB1C " fillRule="evenodd" d="M14.839 14.92a3 3 0 1 1-.8 1.599l-4.873-2.443a3 3 0 1 1 0-4.151l4.873-2.443a3 3 0 1 1 .8 1.599l-4.877 2.438a3 3 0 0 1 0 .962zM17 8a1 1 0 1 0 0-2a1 1 0 0 0 0 2m0 10a1 1 0 1 0 0-2a1 1 0 0 0 0 2M7 13a1 1 0 1 0 0-2a1 1 0 0 0 0 2"></path></svg>)
}


export function MdiCommentOutline(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path fill="#CBFB1C" d="M9 22a1 1 0 0 1-1-1v-3H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6.1l-3.7 3.71c-.2.19-.45.29-.7.29zm1-6v3.08L13.08 16H20V4H4v12z"></path></svg>);
}


export function LineMdCalendar(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><rect width={14} height={0} x={5} y={5} fill="currentColor"><animate fill="freeze" attributeName="height" begin="0.6s" dur="0.2s" values="0;3"></animate></rect><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path strokeDasharray={64} strokeDashoffset={64} d="M12 4h7c0.55 0 1 0.45 1 1v14c0 0.55 -0.45 1 -1 1h-14c-0.55 0 -1 -0.45 -1 -1v-14c0 -0.55 0.45 -1 1 -1Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"></animate></path><path strokeDasharray={4} strokeDashoffset={4} d="M7 4v-2M17 4v-2"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="4;0"></animate></path><path strokeDasharray={12} strokeDashoffset={12} d="M7 11h10"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="12;0"></animate></path><path strokeDasharray={8} strokeDashoffset={8} d="M7 15h7"><animate fill="freeze" attributeName="stroke-dashoffset" begin="1s" dur="0.2s" values="8;0"></animate></path></g></svg>);
}

// Video Control Icons
export function MdiPause(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M14 19h4V5h-4M6 19h4V5H6z"></path></svg>);
}

export function LineMdVolumeHighFilled(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><g fill="currentColor" fillOpacity={0}><path d="M5 8.5v7c0 .55.45 1 1 1h2.1l3.9 3.9l3.9-3.9H18c.55 0 1-.45 1-1v-7c0-.55-.45-1-1-1h-2.1l-3.9-3.9l-3.9 3.9H6c-.55 0-1 .45-1 1z"><animate fill="freeze" attributeName="fill-opacity" begin="0.2s" dur="0.15s" values="0;1"></animate></path><path d="M11.5 6.5v11c0 .6-.4 1-1 1s-1-.4-1-1v-11c0-.6.4-1 1-1s1 .4 1 1z"><animate fill="freeze" attributeName="fill-opacity" begin="0.35s" dur="0.15s" values="0;1"></animate></path></g><g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}><path strokeDasharray={28} strokeDashoffset={28} d="M6 14.5V9.5c0-.55.45-1 1-1h2l4-4v15l-4-4H7c-.55 0-1-.45-1-1z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.4s" values="28;0"></animate></path><path strokeDasharray={8} strokeDashoffset={8} d="M15.5 7.5c1.5 1.33 1.5 6.67 0 8"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.5s" dur="0.2s" values="8;0"></animate></path><path strokeDasharray={10} strokeDashoffset={10} d="M17.5 5.5c3 2.5 3 10.5 0 13"><animate fill="freeze" attributeName="stroke-dashoffset" begin="0.7s" dur="0.2s" values="10;0"></animate></path></g></svg>);
}

export function MdiVolumeMute(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M12 4L9.91 6.09L12 8.18M4.27 3L3 4.27L7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21L21 19.73l-9-9M19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.96 8.96 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.42.05-.63"></path></svg>);
}

export function MdiFullscreen(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M5 5h5V3H3v7h2zm5 14H5v-5H3v7h7zm11-5h-2v5h-5v2h7zm-2-4h2V3h-7v2h5z"></path></svg>);
}

export function MdiFullscreenExit(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M14 14h5v2h-7v-7h2zm-9 0h2v5h5v2H5v-7zm5-9h7v7h-2V9h-5zM5 5h5v2H8v2H6V7H5z"></path></svg>);
}



// export function MdiFullscreen(props) {
// 	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path fill="currentColor" d="M5 5h5v2H7v3H5zm9 0h5v5h-2V7h-3zm3 9h2v5h-5v-2h3zm-7 3v2H5v-5h2v3z"></path></svg>);
// }





export function LineMdYoutubeTwotone(props) {
	return (<svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" {...props}><path fill="#CBFB42" fillOpacity={0} d="M12 11L12 12L12 13z"><animate fill="freeze" attributeName="d" begin="0.6s" dur="0.2s" values="M12 11L12 12L12 13z;M10 8.5L16 12L10 15.5z"></animate><set fill="freeze" attributeName="fill-opacity" begin="0.6s" to={1}></set></path><path fill="none" stroke="#CBFB42" strokeDasharray={64} strokeDashoffset={64} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5c9 0 9 0 9 7c0 7 0 7 -9 7c-9 0 -9 0 -9 -7c0 -7 0 -7 9 -7Z"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"></animate></path></svg>);
}