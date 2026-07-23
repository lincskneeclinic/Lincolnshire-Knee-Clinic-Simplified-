export interface ClinicLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  services: string;
  parking: string;
  accessibility: string;
  facilities: string;
  availability: string;
  mapLink: string;
  bookingLink?: string;
  
  // Extended fields for ClinicInfoMapBlock (Pass 1)
  mapEmbedCode?: string;
  disabledAccess?: string;
  accessibleEntrance?: string;
  liftInformation?: string;
  receptionContact?: string;
  consultationNotes?: string;
  image?: string;
}

export const clinicLocations: ClinicLocation[] = [
  {
    id: "st-hughs-hospital",
    name: "St Hugh's Hospital",
    address: "Peaks Lane, Grimsby, Lincolnshire, DN32 9RP",
    phone: "01472 251100",
    email: "admin@lincsknee.com",
    services: "Consultations, Joint Injections, Surgical Procedures, Diagnostic Referrals",
    parking: "Patient parking available on-site.",
    accessibility: "Step-free access and disabled facilities.",
    facilities: "Private consulting rooms, modern theatre suites, and diagnostic imaging (X-ray, MRI, Ultrasound).",
    availability: "Please contact clinic for scheduling.",
    mapLink: "https://www.google.com/maps/search/?api=1&query=St+Hughs+Hospital+Peaks+Lane+Grimsby",
    bookingLink: "/book-appointment",
    mapEmbedCode: `<iframe width="100%" height="100%" style="border:0;" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=St%20Hugh%27s%20Hospital%20Peaks%20Lane%20Grimsby%20DN32%209RP&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=&amp;output=embed" title="St Hugh's Hospital Google Map Embed"></iframe>`,
    disabledAccess: "Full wheelchair access and ground-floor clinics.",
    accessibleEntrance: "Automatic main entrance doors with ramped access.",
    liftInformation: "Patient lift available to all clinical floors.",
    receptionContact: "01472 251100",
    consultationNotes: "Please check in at main reception on arrival. Bring any relevant MRI/X-ray discs."
  },
  {
    id: "inspire-health-scunthorpe",
    name: "Inspire Health",
    address: "290 Ashby Road, Scunthorpe, North Lincolnshire, DN16 2RS",
    phone: "01724 413333",
    email: "admin@lincsknee.com",
    services: "Consultations, Joint Injections, Diagnostic Referrals",
    parking: "On-site patient parking available.",
    accessibility: "Ground floor clinics with accessible access.",
    facilities: "Private consulting suites and clinical assessment rooms.",
    availability: "Please contact clinic for scheduling.",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Inspire+Health+290+Ashby+Road+Scunthorpe",
    bookingLink: "/book-appointment",
    mapEmbedCode: `<iframe width="100%" height="100%" style="border:0;" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Inspire%20Health%20290%20Ashby%20Road%20Scunthorpe%20DN16%202RS&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=&amp;output=embed" title="Inspire Health Google Map Embed"></iframe>`,
    disabledAccess: "Ground floor access throughout.",
    accessibleEntrance: "Level threshold entry doors.",
    receptionContact: "01724 413333",
    consultationNotes: "Check in at the ground floor reception lobby. Accessible toilet facilities on-site."
  },
  {
    id: "parkhill-hospital",
    name: "Parkhill Hospital",
    address: "Thorne Road, Doncaster, South Yorkshire, DN2 5TH",
    phone: "01302 730300",
    email: "admin@lincsknee.com",
    services: "Consultations, Joint Injections, Surgical Procedures, Diagnostic Referrals",
    parking: "On-site patient parking available.",
    accessibility: "Step-free access and disabled facilities.",
    facilities: "Private consulting suites, modern theatres, and diagnostic imaging referrals.",
    availability: "Please contact clinic for scheduling.",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Parkhill+Hospital+Thorne+Road+Doncaster",
    bookingLink: "/book-appointment",
    mapEmbedCode: `<iframe width="100%" height="100%" style="border:0;" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Parkhill%20Hospital%20Thorne%20Road%20Doncaster%20DN2%205TH&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=&amp;output=embed" title="Parkhill Hospital Google Map Embed"></iframe>`,
    disabledAccess: "Step-free patient routes and clinical rooms.",
    accessibleEntrance: "Flat accessible entry with automated doors.",
    liftInformation: "No lift required - all consulting rooms are ground level.",
    receptionContact: "01302 730300",
    consultationNotes: "Follow signs for Outpatients Reception. Free parking is registered at reception."
  },
  {
    id: "lincoln-private-hospital",
    name: "Lincoln Private Hospital",
    address: "Nettleham Road, Lincoln, Lincolnshire, LN2 1QU",
    phone: "01522 578000",
    email: "admin@lincsknee.com",
    services: "Consultations, Joint Injections, Surgical Procedures, Diagnostic Referrals",
    parking: "On-site patient parking available.",
    accessibility: "Step-free access and disabled facilities.",
    facilities: "Private consulting rooms and diagnostic imaging referrals.",
    availability: "Please contact clinic for scheduling.",
    mapLink: "https://www.google.com/maps/search/?api=1&query=Lincoln+Private+Hospital+Nettleham+Road+Lincoln",
    bookingLink: "/book-appointment",
    mapEmbedCode: `<iframe width="100%" height="100%" style="border:0;" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade" src="https://maps.google.com/maps?q=Lincoln%20Private%20Hospital%20Nettleham%20Road%20Lincoln%20LN2%201QU&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=&amp;output=embed" title="Lincoln Private Hospital Google Map Embed"></iframe>`,
    disabledAccess: "Accessible parking bays and step-free routes.",
    accessibleEntrance: "Low-slope ramped access to main doors.",
    receptionContact: "01522 578000"
  }
];
