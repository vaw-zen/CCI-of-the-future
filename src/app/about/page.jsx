
import React from 'react'
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import Presentation from './1-section/presentation';
import Vision from './2-vision/vision';
import StrokeEffect from './3-webkit/strokeEffect';
import Showcase from '../home/sections/5-showcase/showcase';
import styles from './page.module.css'
import Refrences from '../home/sections/7-refrences/refrences';
import GreenBand from '@/utils/components/GreenBand/GreenBand';

export default function page  ()  {
  return (
    <main className={styles.page}>
    <HeroHeader title={"About us"}/>
    <Presentation/>
    <Vision/>
    <StrokeEffect/>
    <Showcase className={styles.showCase}  />
    <Refrences className={styles.refrences}/>
    <GreenBand className={styles.greenBandWrapper}/>
    </main>
  )
}
