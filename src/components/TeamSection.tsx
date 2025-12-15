'use client';

import React, { useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
import Image from 'next/image';

const teamMembers = [
    {
        role: 'FOUNDER',
        name: 'Naksh Gupta',
        subName: '(Priyanshu Gupta)',
        photo: 'https://res.cloudinary.com/dhahxfyvo/image/upload/v1764329854/gdl_profiles/user_KgvQCIZGzPW5SpXPknDV.jpg',
        bio: 'Lead Editor in a premier photography team & Digital Marketing Expert. Visionary leader empowering individuals with practical digital skills.'
    },
    {
        role: 'HEAD INSTRUCTOR',
        name: 'Dharam Veer',
        subName: '',
        photo: 'https://ui-avatars.com/api/?name=Dharam+Veer&background=random', // Placeholder
        bio: 'Dharam Veer is the Head Instructor at LearnPeak, having mastered all core guidance and methodologies. His expertise, leadership, and vision play a key role in building LearnPeak’s strong foundation and long-term potential.'
    },
    {
        role: 'MANAGER',
        name: 'Prakhar Mishra',
        subName: '',
        photo: 'https://res.cloudinary.com/dhahxfyvo/image/upload/v1764872452/gdl_profiles/user_HA4pgFbtsGBjKCjomJzb.jpg',
        bio: 'Dedicated Operations Manager ensuring smooth platform experiences. Expert in student support and community management.'
    },
    {
        role: 'INSTRUCTOR',
        name: 'Himanshu',
        subName: '',
        photo: 'https://ui-avatars.com/api/?name=Himanshu&background=random', // Placeholder
        bio: 'Himanshu is an experienced instructor with over 3 years of expertise in digital skills. He focuses on practical learning, up-to-date industry knowledge, and helping learners build real-world digital capabilities.'
    },
    {
        role: 'SOCIAL MEDIA HEAD',
        name: 'Joy Alex',
        subName: '',
        photo: '/images/joy-alex.jpg',
        bio: 'Manages LearnPeak’s social media presence, focusing on creating engaging content, maintaining brand consistency, and strengthening audience connection across platforms.'
    }
];

export default function TeamSection() {
    const [emblaRef] = useEmblaCarousel({ loop: true }, [Autoplay({ delay: 3000, stopOnInteraction: false })]);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const MemberCard = ({ member }: { member: typeof teamMembers[0] }) => (
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex flex-col items-center text-center h-full mx-2 md:mx-0">
            <div className="relative mb-4">
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-[#732C3F] shadow-lg relative">
                    <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 96px, 128px"
                    />
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#732C3F] text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider whitespace-nowrap">
                    {member.role}
                </div>
            </div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900">{member.name}</h3>
            {member.subName && <p className="text-[#C57C8A] font-medium text-xs md:text-sm mb-2">{member.subName}</p>}
            <p className="text-gray-600 text-sm leading-relaxed mt-2">
                {member.bio}
            </p>
        </div>
    );

    return (
        <section className="py-12 bg-[#F7E8EC]">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-2xl md:text-3xl font-bold text-[#1A0B12] mb-8 text-center">Meet Our Team</h2>

                {/* Unified Carousel for all screens */}
                <div className="overflow-hidden" ref={emblaRef}>
                    <div className="flex -ml-4">
                        {teamMembers.map((member, index) => (
                            <div key={index} className="flex-[0_0_100%] md:flex-[0_0_50%] lg:flex-[0_0_33.33%] min-w-0 pl-4">
                                <MemberCard member={member} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
