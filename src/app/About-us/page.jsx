import React from 'react'
import HeroHeader from "@/utils/components/reusableHeader/HeroHeader";
import Presentation from './1-section/presentation';
export default function page  ()  {
  return (
    <>
    <HeroHeader title={"About us"}/>
    <Presentation/>
    </>
  )
}
