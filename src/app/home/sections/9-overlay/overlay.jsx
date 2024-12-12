'use client'
import { BiPlayFill, CircularText, EosIconsBubbleLoading, EpCloseBold } from '@/utils/components/icons'
import styles from './overlay.module.css'
import { useOverlayLogic } from './overlay.func'
import content from './overlay.json'
import { parallax } from '@/libs/vz/mi/mi'

export default function Overlay() {
    const { isActive, handleOpen, handleClose } = useOverlayLogic()

    return <>
        <div className={styles.section}>
            <div className={styles.container} style={{ backgroundImage: `url(${content.BG})` }}>
                <div className={styles.filter} />
                <button onMouseMove={parallax} onMouseLeave={parallax} onClick={handleOpen} className={styles.playButton} aria-label="voir-video">
                    <div className={styles.textContainer}>
                        <CircularText className={styles.circularText} />
                    </div>
                    <div className={styles.innerButton}>
                        <BiPlayFill className={styles.playIcon} />
                    </div>
                </button>
            </div>
        </div>

        {isActive && (
            <div onClick={handleClose} className={styles.modal}>
                <EpCloseBold className={styles.closeIcon} />
                <div className={styles.videoContainer}>
                    <EosIconsBubbleLoading className={styles.loadingIcon} />
                    <iframe
                        className={styles.iframe}
                        width="100%"
                        height="100%"
                        src={'https://www.youtube.com/embed/' + content.VIDEO_ID}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            </div>
        )}
    </>
}