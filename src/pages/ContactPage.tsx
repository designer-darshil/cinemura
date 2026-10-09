import React, { useState, useRef } from 'react';
import { Mail, MessageSquare, MapPin, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { Seo } from '../seo/Seo';

interface FormErrors {
  name?: string;
  email?: string;
  topic?: string;
  message?: string;
}

export const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    topic: 'Editorial Inquiry',
    message: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [draftOpened, setDraftOpened] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);

  const validate = (): boolean => {
    const errs: FormErrors = {};

    if (!formData.name.trim()) {
      errs.name = 'Please provide your name.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      errs.email = 'Please provide your email address.';
    } else if (!emailRegex.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!formData.message.trim()) {
      errs.message = 'Please include a message for our editorial team.';
    } else if (formData.message.trim().length < 15) {
      errs.message = 'Your message must be at least 15 characters.';
    }

    setErrors(errs);

    // Focus the first invalid field
    if (errs.name) {
      nameInputRef.current?.focus();
    } else if (errs.email) {
      emailInputRef.current?.focus();
    } else if (errs.message) {
      messageInputRef.current?.focus();
    }

    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Create prefilled mailto draft
    const recipient = 'editorial@cinemura.io';
    const subject = encodeURIComponent(`[${formData.topic}] from ${formData.name}`);
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\nTopic: ${formData.topic}\n\nMessage:\n${formData.message}\n`
    );

    const mailtoUrl = `mailto:${recipient}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;

    setDraftOpened(true);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0D] text-[#F2F0EC] pt-28 pb-24 selection:bg-[#E43D3D] selection:text-white">
      <Seo
        title="Contact Editorial"
        description="Get in touch with the Cinemura editorial team for review access, film corrections, and press inquiries."
      />

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 space-y-12">
        
        {/* Masthead */}
        <div className="border-b border-white/10 pb-8 space-y-3">
          <span className="type-label text-[#E43D3D] block font-bold">
            GET IN TOUCH WITH CINEMURA EDITORIAL
          </span>
          <h1 className="type-display-xl text-white tracking-tight uppercase">
            CONTACT EDITORIAL
          </h1>
          <p className="type-body text-sm sm:text-base text-[#8E8E93] max-w-xl font-light">
            Have press inquiries, metadata corrections, or festival invitations? Connect directly with our editorial and curation team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Contact Information Channels */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-[#111114] border border-white/10 p-6 space-y-3">
              <div className="flex items-center gap-3 text-[#E43D3D]">
                <Mail className="w-5 h-5" />
                <h3 className="type-h3 text-lg text-white uppercase">EDITORIAL & PRESS</h3>
              </div>
              <p className="text-xs text-[#8E8E93] font-mono">editorial@cinemura.io</p>
              <p className="text-xs text-[#8E8E93] font-light">
                For press releases, festival coverage credentials, and screener access.
              </p>
            </div>

            <div className="bg-[#111114] border border-white/10 p-6 space-y-3">
              <div className="flex items-center gap-3 text-[#E43D3D]">
                <MessageSquare className="w-5 h-5" />
                <h3 className="type-h3 text-lg text-white uppercase">METADATA & API INQUIRIES</h3>
              </div>
              <p className="text-xs text-[#8E8E93] font-mono">metadata@cinemura.io</p>
              <p className="text-xs text-[#8E8E93] font-light">
                For data attribution inquiries, catalog sync notes, or developer collaborations.
              </p>
            </div>

            <div className="bg-[#111114] border border-white/10 p-6 space-y-3">
              <div className="flex items-center gap-3 text-[#E43D3D]">
                <MapPin className="w-5 h-5" />
                <h3 className="type-h3 text-lg text-white uppercase">EDITORIAL BUREAU</h3>
              </div>
              <p className="text-xs text-[#8E8E93] leading-relaxed font-light">
                CINEMURA Platform<br />
                Film Discovery & Curation Office<br />
                New York, NY 10013
              </p>
            </div>
          </div>

          {/* Contact Form with Validation & Prefilled Mailto Action */}
          <div className="lg:col-span-7 bg-[#111114] border border-white/10 p-8 sm:p-10">
            {draftOpened ? (
              <div className="py-12 text-center space-y-6">
                <div className="w-16 h-16 bg-[#E43D3D]/10 text-[#E43D3D] border border-[#E43D3D]/30 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h3 className="type-h2 text-2xl sm:text-3xl text-white uppercase">EMAIL DRAFT OPENED</h3>
                  <p className="type-body text-sm text-[#8E8E93] max-w-md mx-auto leading-relaxed">
                    A prefilled message draft has been opened in your system email client. Please send the email from your application to complete transmission.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setDraftOpened(false);
                    setFormData({ name: '', email: '', topic: 'Editorial Inquiry', message: '' });
                    setErrors({});
                  }}
                  className="btn-secondary text-xs uppercase"
                >
                  START ANOTHER INQUIRY
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="type-h3 text-xl text-white uppercase">
                    COMPOSE INQUIRY
                  </h3>
                  <p className="text-xs text-[#8E8E93]">
                    Submitting this form prepares a formatted email draft directly to our editorial team.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name field */}
                  <div className="space-y-2">
                    <label htmlFor="contact-name" className="type-label text-xs text-[#8E8E93] block">
                      YOUR NAME *
                    </label>
                    <input
                      id="contact-name"
                      ref={nameInputRef}
                      type="text"
                      value={formData.name}
                      onChange={e => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      className={`w-full bg-[#17171B] border px-4 py-3 text-sm text-white outline-none transition-colors ${
                        errors.name ? 'border-[#E43D3D]' : 'border-white/10 focus:border-[#E43D3D]'
                      }`}
                      placeholder="e.g. Maya Lin"
                    />
                    {errors.name && (
                      <p className="text-xs text-[#E43D3D] flex items-center gap-1 font-mono">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email field */}
                  <div className="space-y-2">
                    <label htmlFor="contact-email" className="type-label text-xs text-[#8E8E93] block">
                      EMAIL ADDRESS *
                    </label>
                    <input
                      id="contact-email"
                      ref={emailInputRef}
                      type="email"
                      value={formData.email}
                      onChange={e => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      className={`w-full bg-[#17171B] border px-4 py-3 text-sm text-white outline-none transition-colors ${
                        errors.email ? 'border-[#E43D3D]' : 'border-white/10 focus:border-[#E43D3D]'
                      }`}
                      placeholder="e.g. maya@cinema.org"
                    />
                    {errors.email && (
                      <p className="text-xs text-[#E43D3D] flex items-center gap-1 font-mono">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Topic selection */}
                <div className="space-y-2">
                  <label htmlFor="contact-topic" className="type-label text-xs text-[#8E8E93] block">
                    TOPIC
                  </label>
                  <select
                    id="contact-topic"
                    value={formData.topic}
                    onChange={e => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-[#17171B] border border-white/10 focus:border-[#E43D3D] px-4 py-3 text-sm text-white outline-none"
                  >
                    <option value="Editorial Inquiry">Editorial & Criticism Inquiry</option>
                    <option value="Festival & Press Credentials">Festival & Press Credentials</option>
                    <option value="Metadata Correction">Metadata Correction Note</option>
                    <option value="Partnership & Licensing">Partnership & Licensing</option>
                    <option value="General Feedback">General Feedback</option>
                  </select>
                </div>

                {/* Message field */}
                <div className="space-y-2">
                  <label htmlFor="contact-message" className="type-label text-xs text-[#8E8E93] block">
                    MESSAGE BODY *
                  </label>
                  <textarea
                    id="contact-message"
                    ref={messageInputRef}
                    rows={6}
                    value={formData.message}
                    onChange={e => {
                      setFormData({ ...formData, message: e.target.value });
                      if (errors.message) setErrors({ ...errors, message: undefined });
                    }}
                    className={`w-full bg-[#17171B] border px-4 py-3 text-sm text-white outline-none transition-colors ${
                      errors.message ? 'border-[#E43D3D]' : 'border-white/10 focus:border-[#E43D3D]'
                    }`}
                    placeholder="Enter details regarding your inquiry..."
                  />
                  {errors.message && (
                    <p className="text-xs text-[#E43D3D] flex items-center gap-1 font-mono">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary text-xs w-full py-4 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>PREPARE EMAIL DRAFT</span>
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ContactPage;
