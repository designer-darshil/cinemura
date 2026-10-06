import React, { useState } from 'react';
import { Mail, MessageSquare, MapPin, Send, CheckCircle2 } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F5F3EE] pt-28 pb-20 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 w-full space-y-12">
      
      {/* Header */}
      <div className="border-b border-white/10 pb-8 space-y-3">
        <span className="text-[10px] tracking-mega text-[#F27A21] uppercase font-bold">
          GET IN TOUCH WITH CINEMURA EDITORIAL
        </span>
        <h1 className="font-display-hero text-6xl sm:text-8xl text-white uppercase tracking-wider">
          CONTACT US
        </h1>
        <p className="text-sm text-[#8E8E93] max-w-xl font-light">
          Have press inquiries, metadata correction notes, or film submission requests? Send a message directly to our editorial team.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Contact Information Cards */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#121212] border border-white/10 p-6 space-y-3">
            <div className="flex items-center gap-3 text-[#F27A21]">
              <Mail className="w-5 h-5" />
              <h3 className="font-editorial-heading text-xl text-white uppercase">EDITORIAL & PRESS</h3>
            </div>
            <p className="text-xs text-[#8E8E93] font-mono">press@cinemura.io</p>
            <p className="text-xs text-[#8E8E93]">For review copy requests, interview access, and media kits.</p>
          </div>

          <div className="bg-[#121212] border border-white/10 p-6 space-y-3">
            <div className="flex items-center gap-3 text-[#F27A21]">
              <MessageSquare className="w-5 h-5" />
              <h3 className="font-editorial-heading text-xl text-white uppercase">METADATA & API PARTNERSHIPS</h3>
            </div>
            <p className="text-xs text-[#8E8E93] font-mono">api@cinemura.io</p>
            <p className="text-xs text-[#8E8E93]">For developer access keys, data licensing, and studio integrations.</p>
          </div>

          <div className="bg-[#121212] border border-white/10 p-6 space-y-3">
            <div className="flex items-center gap-3 text-[#F27A21]">
              <MapPin className="w-5 h-5" />
              <h3 className="font-editorial-heading text-xl text-white uppercase">EDITORIAL HEADQUARTERS</h3>
            </div>
            <p className="text-xs text-[#8E8E93] leading-relaxed">
              CINEMURA Bureau<br />
              450 Broadway, Floor 8<br />
              New York, NY 10013
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-7 bg-[#121212] border border-white/10 p-8">
          {submitted ? (
            <div className="text-center py-16 space-y-4">
              <CheckCircle2 className="w-16 h-16 text-[#F27A21] mx-auto animate-bounce" />
              <h3 className="font-editorial-heading text-3xl text-white uppercase">MESSAGE RECEIVED</h3>
              <p className="text-xs text-[#8E8E93] max-w-md mx-auto">
                Thank you for contacting CINEMURA. Our editorial team will review your inquiry and respond within 24 hours.
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({ name: '', email: '', subject: 'General Inquiry', message: '' });
                }}
                className="bg-[#F27A21] text-black font-bold text-xs px-6 py-3 uppercase tracking-widest"
              >
                SEND ANOTHER MESSAGE
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="font-editorial-heading text-2xl text-white uppercase border-b border-white/10 pb-4">
                TRANSMIT MESSAGE
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-widest block">YOUR NAME</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/15 focus:border-[#F27A21] text-xs text-white p-3 outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-widest block">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    placeholder="jane@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/15 focus:border-[#F27A21] text-xs text-white p-3 outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-widest block">SUBJECT CATEGORY</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/15 focus:border-[#F27A21] text-xs text-white p-3 outline-none"
                >
                  <option value="General Inquiry">GENERAL INQUIRY</option>
                  <option value="Press & Reviews">PRESS & FILM REVIEWS</option>
                  <option value="Metadata Correction">METADATA CORRECTION</option>
                  <option value="Partnership">STUDIO PARTNERSHIP</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-[#8E8E93] uppercase font-bold tracking-widest block">MESSAGE CONTENT</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Enter message text..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#0A0A0A] border border-white/15 focus:border-[#F27A21] text-xs text-white p-3 outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#F27A21] hover:bg-[#FF8D38] text-black font-bold text-xs uppercase tracking-widest py-4 flex items-center justify-center gap-2 transition-all"
              >
                <span>TRANSMIT MESSAGE</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
};
