
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
            
            // Batch all DOM reads first
            const containerWidth = container.clientWidth;
            const containerHeight = container.clientHeight;
            const minTranslateX = -containerWidth / (x || 10);
            const maxTranslateX = containerWidth / (x || 10);
            const minTranslateY = -containerHeight / (y || 10);
            const maxTranslateY = containerHeight / (y || 10);

            const rect = link.getBoundingClientRect();
            const linkWidth = link.clientWidth;
            const linkHeight = link.clientHeight;
            const linkCenterX = rect.left + linkWidth / 2;
            const linkCenterY = rect.top + linkHeight / 2;

            // Calculate transforms
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

            // Now do DOM write
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


