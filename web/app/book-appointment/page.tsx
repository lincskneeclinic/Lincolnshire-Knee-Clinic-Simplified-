import React from "react";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { MedicalDisclaimerBlock } from "@/components/MedicalDisclaimerBlock";
import { Button } from "@/components/Button";
import { PageHeader } from "@/components/PageHeader";
import { clinicLocations } from "@/data/clinics";

export default function BookAppointment() {
  const videoBookingUrl = null as string | null; // Placeholder: [Google Calendar Video Consultation Link]

  const isPlaceholder = (val: string | null) => {
    return !val || val.includes("[") || val.includes("placeholder");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-16 font-sans">
      <Breadcrumbs items={[{ label: "Book Appointment" }]} />

      {/* 1. Compact dark navy page header */}
      <PageHeader
        category="Appointment Booking"
        title="Book an Appointment"
        subtitle="Lincolnshire Knee Clinic offers face-to-face specialist consultations and secure online video consultations."
      />

      {/* 2. Introductory booking explanation */}
      <div className="my-8 bg-pale-clinical-blue border border-clinical-teal/20 rounded-xl p-5 md:p-6 text-sm text-text-secondary leading-relaxed">
        <p className="font-bold text-deep-navy text-base mb-2">Choosing Your Pathway</p>
        <p className="mb-2">
          To ensure you receive the most appropriate care, we offer two consultation pathways. Please review the options below to select between a face-to-face clinical assessment or a video-based consultation.
        </p>
        <p className="text-xs text-text-muted italic">
          Please note that booking arrangements differ by location, and this website does not confirm face-to-face appointments directly.
        </p>
      </div>

      {/* WhatsApp booking assistance panel */}
      <div className="my-6 flex flex-col sm:flex-row sm:items-center gap-4 bg-white border border-[#25D366]/30 rounded-xl p-5 md:p-6 shadow-sm">
        <div className="flex items-start gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] shrink-0 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-deep-navy text-sm mb-0.5">Need help booking?</p>
            <p className="text-xs text-text-secondary">
              Our team can assist with booking enquiries by telephone or WhatsApp. Administrative enquiries only — please do not send medical details via WhatsApp.
            </p>
          </div>
        </div>
        <a
          href="https://wa.me/447770473437?text=Hello%20I%20would%20like%20to%20enquire%20about%20a%20consultation."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact us on WhatsApp to help with booking — administrative enquiries only"
          className="inline-flex items-center gap-2 shrink-0 bg-[#25D366] text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-[#1ebe59] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Message on WhatsApp
        </a>
      </div>

      {/* 3. Two large pathway cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-10">
        {/* Pathway A: Face-to-Face */}
        <div className="bg-white border border-border-clinical rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-clinical-teal mb-2 block">Pathway A</span>
            <h3 className="font-serif text-xl font-bold text-deep-navy mb-4">Face-to-Face Consultation</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Best for clinical joint examinations, initial assessments, and in-clinic knee injection procedures. Conducted at one of our regional clinic locations.
            </p>
            <ul className="space-y-2 text-xs text-text-secondary mb-6 list-disc pl-5">
              <li>Comprehensive physical assessment by our specialist.</li>
              <li>Arranged directly with the local clinic reception team.</li>
              <li>Required before arranging diagnostic referrals (MRI, X-ray).</li>
            </ul>
          </div>
          <Button href="#face-to-face-selector" variant="primary" className="w-full">
            Choose Location &amp; Arrange
          </Button>
        </div>

        {/* Pathway B: Video */}
        <div className="bg-white border border-border-clinical rounded-xl p-6 md:p-8 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-clinical-teal mb-2 block">Pathway B</span>
            <h3 className="font-serif text-xl font-bold text-deep-navy mb-4">Video Consultation</h3>
            <p className="text-sm text-text-secondary leading-relaxed mb-4">
              Secure online consultations for initial clinical discussions, reviewing diagnostic imaging reports, or post-treatment check-ups.
            </p>
            <ul className="space-y-2 text-xs text-text-secondary mb-6 list-disc pl-5">
              <li>Conducted securely online via Google Meet.</li>
              <li>Booked and scheduled online using Google Calendar.</li>
              <li>Payments processed securely through Stripe where required.</li>
            </ul>
          </div>
          <Button href="#video-selector" variant="teal" className="w-full">
            View Video Booking Details
          </Button>
        </div>
      </div>

      {/* 4. Clinic location selector for face-to-face booking */}
      <div id="face-to-face-selector" className="my-12 scroll-mt-24">
        <div className="border-b border-border-clinical/30 pb-4 mb-6">
          <h2 className="font-serif text-2xl font-bold text-deep-navy">Face-to-Face Clinic Locations</h2>
          <p className="text-sm text-text-secondary leading-relaxed mt-2">
            “Face-to-face appointments are arranged directly with the reception team at your preferred clinic location. Each clinic reception manages appointment availability for the days the consultant practises there.”
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clinicLocations.map((clinic, index) => (
            <div
              key={index}
              className="bg-soft-blue border border-border-clinical/40 rounded-xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(8,47,73,0.02)]"
            >
              <div>
                <h4 className="font-serif text-lg font-bold text-deep-navy mb-2">{clinic.name}</h4>
                <p className="text-xs text-text-secondary mb-4 leading-relaxed font-semibold italic text-clinical-teal">
                  ⚠️ Reception manages the local diary. Call this clinic to arrange your appointment. The website does not confirm face-to-face bookings directly. Arrangements may differ by location.
                </p>
                <div className="space-y-2 text-xs text-text-secondary mb-6">
                  <p><strong>Address:</strong> {clinic.address}</p>
                  <p><strong>Phone:</strong> {clinic.phone}</p>
                  <p><strong>Availability:</strong> {clinic.availability}</p>
                  <p><strong>Facilities:</strong> {clinic.facilities}</p>
                  <p><strong>Parking:</strong> {clinic.parking}</p>
                  <p><strong>Accessibility:</strong> {clinic.accessibility}</p>
                  <p><strong>Services Available:</strong> {clinic.services}</p>
                </div>
              </div>
              <div className="flex gap-4 border-t border-border-clinical/20 pt-4">
                {isPlaceholder(clinic.phone) ? (
                  <Button disabled variant="teal" className="flex-1 text-xs py-2 h-10 min-h-[40px]">
                    [Clinic Reception Phone Number]
                  </Button>
                ) : (
                  <Button href={`tel:${clinic.phone}`} variant="teal" className="flex-1 text-xs py-2 h-10 min-h-[40px]">
                    Call Clinic Reception
                  </Button>
                )}
                <Button href={`/clinics#${clinic.id}`} variant="secondary" className="flex-1 text-xs py-2 h-10 min-h-[40px]">
                  View Clinic &amp; Directions
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Google Calendar information for video booking */}
      <div id="video-selector" className="my-12 bg-warm-off-white border border-border-clinical rounded-xl p-6 md:p-8 scroll-mt-24">
        <h2 className="font-serif text-2xl font-bold text-deep-navy mb-4">Secure Video Consultation</h2>
        
        <div className="space-y-4 text-sm text-text-secondary leading-relaxed mb-6">
          <p>
            “Video consultations, where available, are booked through Google Calendar. A Google Meet link will be provided after the appointment is confirmed.”
          </p>
          
          <div className="bg-white border border-border-clinical/30 p-5 rounded-lg">
            <h4 className="font-bold text-deep-navy mb-2">Video Consultation Details</h4>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <p><strong>Duration:</strong> [Duration]</p>
              <p><strong>Fee:</strong> [Fee]</p>
            </div>
            <p className="text-xs text-text-muted mt-2">
              Suitable for review of imaging results or follow-up consults where clinical joint palpation is not required.
            </p>
          </div>

          <p>
            “Payment, where required, will be processed securely by Stripe. Lincolnshire Knee Clinic does not store card details on this website.”
          </p>
        </div>

        {isPlaceholder(videoBookingUrl) ? (
          <Button disabled variant="teal" className="w-full md:w-auto">
            Video booking link pending
          </Button>
        ) : (
          <Button href={videoBookingUrl!} variant="teal" className="w-full md:w-auto">
            Book Video Consultation
          </Button>
        )}
      </div>

      {/* 6. Payment and privacy note */}
      <div className="my-8 border-t border-border-clinical/30 pt-6 text-xs text-text-muted leading-relaxed">
        <h4 className="font-bold text-text-secondary mb-1">Booking Privacy &amp; Data Security</h4>
        <p>
          To protect patient confidentiality, face-to-face clinic telephone bookings do not collect or store patient medical data through this website. Video consultation schedules process scheduling details securely through Google Calendar and Stripe processes payment information. Lincolnshire Knee Clinic does not store credit card credentials. For full terms, please read our{" "}
          <a href="/privacy-policy" className="text-clinical-teal hover:underline font-semibold">
            Privacy Policy
          </a>.
        </p>
      </div>

      {/* 7. Urgent advice notice */}
      <div className="bg-status-error-bg border border-status-error/20 text-status-error p-5 rounded-xl my-8">
        <h3 className="font-serif text-base font-bold mb-2">Urgent Appointments</h3>
        <p className="text-sm leading-relaxed text-text-secondary">
          Lincolnshire Knee Clinic does not provide emergency medical services.
          If you are experiencing urgent symptoms, severe joint pain, or suspected infection, please dial 999 or call NHS 111 immediately. You can review detailed instructions on our{" "}
          <a href="/urgent-advice" className="text-status-error hover:underline font-bold">
            Urgent Advice
          </a>{" "}
          page.
        </p>
      </div>

      {/* 8. Alternative contact section */}
      <div className="bg-soft-blue border border-border-clinical/30 rounded-xl p-6 my-8 text-sm text-text-secondary">
        <h4 className="font-bold text-deep-navy mb-2">Alternative Contacts</h4>
        <p className="leading-relaxed">
          For administrative support or general business enquiries, please visit our{" "}
          <a href="/contact" className="text-clinical-teal hover:underline font-semibold">
            Contact Page
          </a>{" "}
          or contact us directly at <span className="font-bold text-deep-navy">[Clinic Email Address]</span>.
        </p>
      </div>

      <MedicalDisclaimerBlock />
    </div>
  );
}
