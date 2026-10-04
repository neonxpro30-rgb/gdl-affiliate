'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';
import Link from 'next/link';

const slides = [
    {
        id: 1,
        image: '/images/hero-slide-1.jpg',
        eyebrow: 'LearnPeak',
        title: 'Learn Digital Skills.\nOwn Your Future.',
        description: 'Affiliate marketing, content creation, video editing — real skills, taught simply.',
        ctaText: 'Explore Packages',
        ctaHref: '#packages',
    },
    {
        id: 2,
        image: '/images/hero-slide-2.jpg',
        eyebrow: 'Start with Silicon Demo · ₹19',
        title: 'Taste the Skills\nBefore You Go All In.',
        description: 'A tiny demo package to experience how we teach. No big commitment.',
        ctaText: 'Try the Demo',
        ctaHref: '#packages',
    },
    {
        id: 3,
        image: '/images/hero-slide-3.jpg',
        eyebrow: 'Join the Community',
        title: 'Create. Learn.\nRepeat.',
        description: 'Thousands of students building real digital skills every day.',
        ctaText: 'Get Started',
        ctaHref: '/signup',
    }
];

export default function HomeCarousel() {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 6000 })]);

    return (
        <div className="overflow-hidden bg-[#1A0B12]" ref={emblaRef}>
            <div className="flex">
                {slides.map((slide) => (
                    <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative aspect-[16/10] md:aspect-[16/7]">
                        <Image
                            src={slide.image}
                            alt={slide.title.replace(/\n/g, ' ')}
                            fill
                            className="object-cover"
                            priority={slide.id === 1}
                        />
                        {/* Readability gradient */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#1A0B12]/85 via-[#1A0B12]/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A0B12]/70 via-transparent to-transparent" />
                        {/* Text overlay */}
                        <div className="absolute inset-0 flex items-center">
                            <div className="max-w-7xl mx-auto px-6 md:px-10 w-full">
                                <p className="text-[#C57C8A] font-bold text-xs md:text-sm tracking-[0.2em] uppercase mb-3">
                                    {slide.eyebrow}
                                </p>
                                <h2 className="text-white font-extrabold text-3xl md:text-6xl leading-[1.05] mb-4 whitespace-pre-line max-w-2xl">
                                    {slide.title}
                                </h2>
                                <p className="text-gray-200 text-sm md:text-lg mb-6 max-w-xl">
                                    {slide.description}
                                </p>
                                <Link
                                    href={slide.ctaHref}
                                    className="inline-block bg-[#732C3F] text-white px-7 py-3 rounded-full font-bold text-sm md:text-base hover:bg-[#5a2231] transition shadow-lg"
                                >
                                    {slide.ctaText}
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
