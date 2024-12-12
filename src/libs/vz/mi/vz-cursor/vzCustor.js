export default function VzCursor({ children }) {
    return (<>
        <div id="vz-cursor">
            <div>
                <span />
                {children}
            </div>
        </div>

        <style>{`
        #vz-cursor { position: fixed; width: .8vw; height: .8vw; border-radius: 100%; display: flex; justify-content: center; align-items: center; z-index: 999; left: 0; top: 0; transition: width 0.5s, height 0.5s, transform 0.1s linear; pointer-events: none; will-change: transform, width, height  }
        #vz-cursor div { white-space: nowrap; text-align: center; pointer-events: none; font-size: .2vw; color: var(--black_white); background: var(--Vz-Cursor); width: 100%; height:100%; border-radius: inherit; transition: transform .3s, opacity 1s .3s; transform: scale3d(0, 0, 0); will-change: transform; display: flex; justify-content: center; align-items: center; z-index: 0; opacity: 0 }
        #vz-cursor span { white-space: nowrap; text-align: center; pointer-events: none; font-size: inherit; color: var(--black_white);  width: 100%; height:100%; border-radius: inherit;  display: flex; justify-content: center; align-items: center; position: absolute; }
        @media (max-width: 1024px) { #vz-cursor{ display: none } }

        `}</style>
    </>)
}
