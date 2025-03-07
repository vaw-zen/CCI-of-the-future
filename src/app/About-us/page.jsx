"use client"
import React from 'react'
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import Presentation from './1-section/presentation';
import Vision from './2-vision/vision';
import StrokeEffect from './3-webkit/strokeEffect';
export default function page  ()  {
  return (
    <>
    <HeroHeader title={"About us"}/>
    <Presentation/>
    <Vision/>
    <StrokeEffect/>
    </>
  )
}
