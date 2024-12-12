import Initializer from "@/utils/initializer/initalizer";
import Hero from "./sections/1-hero/hero";
import About from "./sections/2-about/about";
import Services from "./sections/3-services/services";
import Band from "./sections/4-band/band";
import Showcase from "./sections/5-showcase/showcase";
import Project from "./sections/6-projects/project";
import Refrences from "./sections/7-refrences/refrences";
import GreenBand from "@/utils/components/GreenBand/GreenBand";
import Testimonials from "./sections/8-testimonials/testimonials";
import Overlay from "./sections/9-overlay/overlay";
import styles from './home.module.css'

export default function Home() {
    return <>
        <Initializer />
        <Hero />
        <main className={styles.Home}>
            <div className={styles.wrapper}>
                <About />
                <Services />
                <Band />
                <Showcase />
                <Project />
                <Refrences />
                <GreenBand />
                <Testimonials />
            </div>
        </main>
        <Overlay />
    </>
}
