

function cursor_mouseMove(event) {
    const primaryCursor = document.querySelector('#vz-cursor');
    const circle = primaryCursor.children[0]
    if (!circle.style.transform) circle.style.transform = 'scale3d(1, 1, 1)'; circle.style.opacity = 1
    const { clientX, clientY } = event;
    primaryCursor.style.transform = `translate3d(${clientX -
        primaryCursor.clientWidth / 2}px, ${clientY -
        primaryCursor.clientHeight / 2}px, 0)`;
}

let preScale;
export function crsor(event) {
    if (window.innerWidth <= 1023) return
    const type = event.type
    if (type === 'mousemove') {
        cursor_mouseMove(event)
    } else if (type === 'mousedown' || type === 'mouseleave') {
        down(document.querySelector('#vz-cursor').children[0], true)
    } else if (type === 'mouseup' || type === 'mouseenter') {
        up(document.querySelector('#vz-cursor').children[0], true)
    }
}
export function down(param, isCursor) {
    const element = isCursor ? param : param.currentTarget
    preScale = element.style.transform
    element.style.transform = 'scale3d(0, 0, 0)'
}
export function up(param, isCursor) {
    const element = isCursor ? param : param.currentTarget
    element.style.transform = preScale && preScale !== 'scale3d(0, 0, 0)' ? preScale : 'scale3d(1, 1, 1)'
    preScale = null

}


export function revertColor(event, scale) {
    if (window.innerWidth <= 1023) return
    const cursor = document.querySelector('#vz-cursor')
    if (event.type === 'mouseenter') {
        cursor.children[0].style.transform = `scale3d(${scale || 3}, ${scale || 3}, ${scale || 3})`
        cursor.children[0].style.background = 'white'
        cursor.style.mixBlendMode = 'difference'
    } else if (event.type === 'mouseleave') {
        cursor.children[0].style.transform = `scale3d(1, 1, 1)`
        cursor.children[0].style.background = 'var(--Vz-Cursor)'
        cursor.style.mixBlendMode = 'normal'
    }
}

let prevColor;
export function customColor(event, custom) {
    const cursor = document.querySelector('#vz-cursor')
    if (event) {
        if (typeof event === 'string') {
            cursor.children[0].style.background = event
            if (cursor.children[0].style.background !== event) {
                cursor.children[0].style.transition = 'background .75s'
                requestAnimationFrame(() => {
                    cursor.children[0].style.background = event
                    setTimeout(() => {
                        cursor.children[0].style.transition = 'none'
                    }, 800)
                })
            }
        } else {
            const enter = event.type === 'mouseenter'
            if (!custom) {
                cursor.style.filter = enter ? 'invert(1)' : 'none'
            } else {
                prevColor = enter ? cursor.children[0].style.background : 'white'
                cursor.children[0].style.background = enter ? custom : prevColor && 'white'
            }
        }
    } else {
        if (cursor.style.filter === 'invert(1)') {
            cursor.style.filter = 'none'
        }
        cursor.children[0].style.transform = 'scale3d(1, 1, 1)'
        preScale = null
    }
}



