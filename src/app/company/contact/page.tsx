import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function ContactUs() {
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
                                <p className="text-gray-600">neonxpro30@gmail.com</p>
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
                    </div>

                    <div className="bg-gray-50 p-6 rounded-xl">
                        <form className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#732C3F] outline-none" placeholder="Your Name" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#732C3F] outline-none" placeholder="Your Email" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-[#732C3F] outline-none h-32" placeholder="How can we help?"></textarea>
                            </div>
                            <button className="w-full bg-[#732C3F] text-white py-2 rounded-lg font-bold hover:bg-[#5a2231] transition">
                                Send Message
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
