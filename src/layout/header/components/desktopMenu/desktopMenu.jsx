import HeroImage from '@/app/home/sections/1-hero/Image';
import { UilArrowRight } from '@/utils/components/icons';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react'

export default function DesktopMenu() {
    return (
        <div style={{ width: '100vw', height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 1, background: 'linear-gradient(45deg, var(--bg-base) 25%, var(--bg-elevated) 50%, var(--bg-base) 75%)' }}>
            <HeroImage responsiveWidth sizes="150vw" src='/home/1-hero/background.jpg' alt="menu-background" style={{ position: 'absolute', left: 0, top: 0, zIndex: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
            <div style={{ background: 'rgba(255, 255, 255, .025)', width: '100%', height: '100%', position: 'absolute', zIndex: 2, left: 0, top: 0, padding: '4vw 12.5vw 0vw 12.5vw', backdropFilter: 'blur(2px)' }}>
                <div style={{ display: 'flex', height: '100%', width: '100%' }}>
                    <div style={{ width: '60%', height: '100%', display: 'flex', paddingTop: '12.5vw', gap: '2vw' }}>
                        <div style={{ width: '30%', fontSize: '1.1vw', color: 'var(--t-secondary)', marginTop: '1.5vw', display: 'flex', flexDirection: 'column', gap: '10.5vw' }}>
                            <p>Qui sommes-nous ?</p>
                            <p>Réseaux sociaux</p>
                        </div>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5vw', fontSize: '2.25vw' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1vw' }}>
                                <Link href='/' style={{ fontWeight: 'normal' }}>À propos de nous</Link>
                                <Link href='/' style={{ fontWeight: 'normal' }}>Carrière</Link>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '2.25vw', gap: '1vw' }}>
                                <Link href='/' >Facebook</Link>
                                <Link href='/' >Instagram</Link>
                                <Link href='/' >Twitter</Link>
                                <Link href='/' >Linkedin</Link>
                            </div>
                        </div>
                    </div>
                    <div style={{ width: '60%', height: '100%' }}>
                        <h2 style={{ fontSize: '6vw', borderBottom: '2px solid white', marginBottom: '1vw' }}>Menu</h2>
                        <div style={{ display: 'flex', padding: '0   0', gap: '4.5vw' }}>
                            <div style={{ width: '22%', fontSize: '1.1vw', color: 'var(--t-secondary)', marginTop: '.75vw', display: 'flex', flexDirection: 'column', gap: '10.5vw' }}>
                                <p style={{}}>Plus de pages</p>
                                <p style={{}}>Newsletter</p>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', fontSize: '2.25vw', fontWeight: '500', flex: 1, gap: '5vw' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1vw' }}>
                                    <Link href='/'>Contact</Link>
                                    <Link href='/'>Nouveauté</Link>
                                </div>
                                <form style={{ display: 'block', position: 'relative' }}>
                                    <label style={{ fontWeight: 'normal' }}>Restez à jour</label>
                                    <input placeholder='Adresse Email' style={{
                                        padding: '.75vw 0', marginTop: '1vw', width: '100%', background: 'transparent', border: 'none', color: 'var(--t-primary)', fontSize: '.9vw',
                                        outline: 'none', borderBottom: '1px solid rgba(255, 255,255, .2)'
                                    }} />
                                    <button style={{
                                        width: '3.25vw', height: '3.25vw', borderRadius: '50%', border: '2px solid var(--t-primary)', color: 'var(--t-primary)',
                                        position: 'absolute', right: 0, bottom: 0, transform: 'translateY(50%)'

                                    }}>
                                        <UilArrowRight style={{ color: 'var(--ac-primary)', width: '55%', height: '55%', transform: 'rotate(-45deg)' }} />

                                    </button>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75vw', marginTop: '1.25vw', position: 'relative' }}>
                                        <input
                                            type="checkbox"
                                            id="privacy-checkbox"
                                            style={{
                                                appearance: 'none',
                                                width: '.75vw',
                                                height: '.75vw',
                                                border: '2px solid var(--t-primary)',
                                                borderRadius: '50%',
                                                outline: 'none',
                                                cursor: 'pointer',
                                                position: 'relative',
                                                backgroundColor: 'transparent',
                                                transition: 'background-color 0.2s ease'
                                            }}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    e.target.style.background = `
                                                                  radial-gradient(
                                                                    circle at center, 
                                                                    var(--t-primary) 50%, 
                                                                    transparent 50%
                                                                  )
                                                                `;
                                                } else {
                                                    e.target.style.background = 'transparent';
                                                }
                                            }}
                                        />
                                        <label
                                            htmlFor="privacy-checkbox"
                                            style={{
                                                fontSize: '0.8vw',
                                                // color: 'var(--t-secondary)',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            J'accepte la politique de confidentialité
                                        </label>
                                    </div>
                                </form>

                            </div>
                        </div>
                        <div style={{ display: 'flex', marginTop: '4vw', height: '6vw' }}>
                            <a href='/' target='_blank' style={{ flex: 1 }}>
                                <Image style={{ objectFit: 'cover', objectPosition: 'center', width: '100%', height: '100%' }} src='/contact/location.png' alt='location' width={650} height={382} />
                            </a>
                            <a href='/' style={{ flex: 1, background: 'green' }}>
                            </a>
                            <a href='/' style={{ flex: 1, background: 'blue' }}>
                            </a>
                        </div>
                    </div>

                </div>

            </div>
        </div>)
}
