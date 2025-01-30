
let vzCursor = false
export const parallax = function (event, x, y, noCT = true, isCursor, more) {
    if (event.type === 'mousemove') {
        parallaxMove(event, x, y, noCT = true, isCursor, more)
    } else if (event.type === 'mouseleave') {
        parallaxLeave(event, x, y, noCT = true, isCursor)
    }
};

export function parallaxMove(event, x, y, noCT = true, isCursor, more) {
    if (window.innerWidth > 1024) {
        const link = noCT ? typeof noCT !== 'object' ? event.currentTarget : noCT : event.currentTarget.children[0]
        if (event.type === 'mousemove') {
            const { clientX, clientY } = event;
            const container = event.currentTarget;
            const minTranslateX = -container.clientWidth / (x || 10);
            const maxTranslateX = container.clientWidth / (x || 10);
            const minTranslateY = -container.clientHeight / (y || 10);
            const maxTranslateY = container.clientHeight / (y || 10);

            const { left, top } = link.getBoundingClientRect();
            const linkCenterX = left + link.clientWidth / 2;
            const linkCenterY = top + link.clientHeight / 2;

            let translateX = clientX - linkCenterX;
            let translateY = clientY - linkCenterY;
            if (translateX < minTranslateX) {
                translateX = minTranslateX;
            } else if (translateX > maxTranslateX) {
                translateX = maxTranslateX;
            }

            if (translateY < minTranslateY) {
                translateY = minTranslateY;
            } else if (translateY > maxTranslateY) {
                translateY = maxTranslateY;
            }

            link.style.transform = `translate3d(${translateX}px, ${translateY}px, 0)${more || ''}`;

            // if (vzCursor) {
            //     const cursor = document.querySelector('#vz-cursor').children[0]
            //     if (isCursor && cursor.style.transform !== 'scale3d(0, 0, 0)') {
            //         down(cursor, true)
            //     }
            // }
        } else if (event.type === 'mouseleave') {
            link.style.transform = 'none';
            // if (vzCursor) {
            //     const cursor = document.querySelector('#vz-cursor')
            //     cursor.style.display = 'flex'

            // }
        }
    }

}

export function parallaxLeave(event, x, y, noCT = true, isCursor) {
    const link = noCT ? typeof noCT !== 'object' ? event.currentTarget : noCT : event.currentTarget.children[0]
    if (window.innerWidth > 1024 && link) {
        link.style.transform = 'none';
        // if (isCursor) {
        //     if (vzCursor) {
        //         up(document.querySelector('#vz-cursor').children[0], true)
        //     }
        // }
    }
}


