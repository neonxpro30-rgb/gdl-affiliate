'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

const slides = [
    {
        id: 1,
        image: '/images/carousel-1.png',
        title: 'Master the Silicon Skills of Tomorrow',
        description: 'Future-ready tech training for the digital age.'
    },
    {
        id: 2,
        image: '/images/carousel-2.png',
        title: 'Grow Your Digital Career With Us',
        description: 'Step-by-step guidance to financial freedom.'
    },
    {
        id: 3,
        image: '/images/carousel-3.png',
        title: 'Join a Learning Community',
        description: 'Collaborate, learn, and succeed together.'
    }
];

export default function HomeCarousel() {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

    return (
        <div className="overflow-hidden bg-gray-100" ref={emblaRef}>
            <div className="flex">
                {slides.map((slide) => (
                    <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative aspect-[16/9] md:aspect-[21/9]">
                        <Image
                            src={slide.image}
                            alt={slide.title}
                            fill
                            className="object-cover"
                            priority={slide.id === 1}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8 md:p-16">
                            <div className="text-white max-w-2xl">
                                <h2 className="text-2xl md:text-4xl font-bold mb-2">{slide.title}</h2>
                                <p className="text-sm md:text-lg opacity-90">{slide.description}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
