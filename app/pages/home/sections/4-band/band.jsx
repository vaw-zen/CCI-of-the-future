import React from 'react'
import s from './band.module.css'
export default function Band() {
    const list = [
        "Services",
        "Nettoyage En Profondeur",
        "Marble",
        "Tapisserie",
        "Tapis",
        "Moquette",
        "Salons",
        "Bateaux",
        "Voitures",
        "Travaux de fin de chantier"
    ]

    return (
        <div className={s.container}>
            <div className={s.band}>
                {[...list,...list].map((element, index) => <strong key={index}>{element} - </strong>)}
            </div>
        </div>
    )
}
