'use client'; // Required for interactivity

import React, { useState } from 'react';
import { Mail, Phone, MapPin, Loader2, Instagram, Youtube, Linkedin, Facebook } from 'lucide-react';

export default function ContactUs() {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setStatus('success');
                setFormData({ name: '', email: '', phone: '', message: '' });
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
            }
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <div className="min-h-screen bg-[#F7E8EC] py-16 px-4 font-sans">
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
                <h1 className="text-3xl font-bold text-[#1A0B12] mb-8 text-center">Contact Us</h1>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-[#732C3F]">Get in Touch</h2>
                        <p className="text-gray-600">
                            Have questions or need support? We are here to help. Reach out to us through any of the following channels.
                        </p>

                        <div className="flex items-center space-x-4">
                            <div className="bg-[#F7E8EC] p-3 rounded-full">
                                <Mail className="text-[#732C3F]" size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Email</p>
                                <p className="text-gray-600">learnpeak.in@gmail.com</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-[#F7E8EC] p-3 rounded-full">
                                <Phone className="text-[#732C3F]" size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Phone</p>
                                <p className="text-gray-600">+91 9554819859</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="bg-[#F7E8EC] p-3 rounded-full">
                                <MapPin className="text-[#732C3F]" size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Address</p>
                                <p className="text-gray-600">Lucknow, India</p>
                            </div>
                        </div>

                        {/* Social Media Links */}
                        <div className="pt-6 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-[#732C3F] mb-4">Follow Us</h3>
                            <div className="flex space-x-4">
                                <a
                                    href="https://www.instagram.com/learnpeak.in?igsh=MW1pYjFxZTV2N21vOA=="
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#F7E8EC] p-3 rounded-full text-[#732C3F] hover:bg-[#732C3F] hover:text-white transition duration-300"
                                    title="Instagram"
                                >
                                    <Instagram size={24} />
                                </a>
                                <a
                                    href="https://youtube.com/@learnpeak-o8r?si=5YRNUnwqJco1fvPy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#F7E8EC] p-3 rounded-full text-[#732C3F] hover:bg-[#732C3F] hover:text-white transition duration-300"
                                    title="YouTube"
                                >
                                    <Youtube size={24} />
                                </a>
                                <a
                                    href="https://www.linkedin.com/in/naksh-gupta-b51358394?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#F7E8EC] p-3 rounded-full text-[#732C3F] hover:bg-[#732C3F] hover:text-white transition duration-300"
                                    title="LinkedIn"
                                >
                                    <Linkedin size={24} />
                                </a>
                                <a
                                    href="https://www.facebook.com/share/17pkX8BC3z/"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-[#F7E8EC] p-3 rounded-full text-[#732C3F] hover:bg-[#732C3F] hover:text-white transition duration-300"
                                    title="Facebook"
                                >
                                    <Facebook size={24} />
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl">
                        <form className="space-y-4" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#732C3F] outline-none text-gray-900 bg-white placeholder-gray-400"
                                    placeholder="Your Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#732C3F] outline-none text-gray-900 bg-white placeholder-gray-400"
                                    placeholder="Your Email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                                <input
                                    type="tel"
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#732C3F] outline-none text-gray-900 bg-white placeholder-gray-400"
                                    placeholder="Your Mobile Number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    required
                                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#732C3F] outline-none h-32 text-gray-900 bg-white placeholder-gray-400"
                                    placeholder="How can we help?"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                className="w-full bg-[#732C3F] text-white py-2 rounded-lg font-bold hover:bg-[#5a2231] transition flex items-center justify-center disabled:opacity-70"
                            >
                                {status === 'loading' ? <Loader2 className="animate-spin" /> : 'Send Message'}
                            </button>
                            {status === 'success' && (
                                <p className="text-green-600 text-sm text-center font-medium">Message sent successfully!</p>
                            )}
                            {status === 'error' && (
                                <p className="text-red-500 text-sm text-center font-medium">Failed to send message. Please try again.</p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
