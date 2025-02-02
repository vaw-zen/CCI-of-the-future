import dynamic from 'next/dynamic';
import Hero from "./sections/1-hero/hero";
import styles from './home.module.css';
import Head from 'next/head';

const About = dynamic(() => import("./sections/2-about/about"));
const Services = dynamic(() => import("./sections/3-services/services"));
const Band = dynamic(() => import("./sections/4-band/band"));
const Showcase = dynamic(() => import("./sections/5-showcase/showcase"));
const Project = dynamic(() => import("./sections/6-projects/project"));
const Refrences = dynamic(() => import("./sections/7-refrences/refrences"));
const GreenBand = dynamic(() => import("@/utils/components/GreenBand/GreenBand"));
const Testimonials = dynamic(() => import("./sections/8-testimonials/testimonials"));
const Overlay = dynamic(() => import("./sections/9-overlay/overlay"));
const Initializer = dynamic(() => import("@/utils/initializer/initalizer"));

export default function Home() {
    return <>
      <Head>
        <link
          rel="preload"
          as="image"
          href="/home/1-hero/linesGlow.webp"
          fetchpriority="high"
        />
      </Head>
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
    <Initializer />
  </>
}
