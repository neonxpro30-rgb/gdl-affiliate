'use client';

import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

const slides = [
    {
        id: 1,
        image: '/images/carousel-new-1.jpg',
        title: '',
        description: ''
    },
    {
        id: 2,
        image: '/images/carousel-new-2.jpg',
        title: '',
        description: ''
    },
    {
        id: 3,
        image: '/images/carousel-new-3.jpg',
        title: '',
        description: ''
    }
];

export default function HomeCarousel() {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 5000 })]);

    return (
        <div className="overflow-hidden bg-gray-100" ref={emblaRef}>
            <div className="flex">
                {slides.map((slide) => (
                    <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative aspect-[16/9] md:aspect-[16/9]">
                        <Image
                            src={slide.image}
                            alt="Carousel Slide"
                            fill
                            className="object-cover"
                            priority={slide.id === 1}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
