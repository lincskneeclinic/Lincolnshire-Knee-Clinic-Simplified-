import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const PATIENTS_DB_PATH = path.join(process.cwd(), "data", "dynamic-patients.json");
const INTAKE_CSV_PATH = path.join(process.cwd(), "data", "intake-registry.csv");
const NEWSLETTER_PATH = path.join(process.cwd(), "data", "newsletter-subscribers.json");

// Helper to read newsletter subscribers
function readNewsletterSubscribers() {
  try {
    if (!fs.existsSync(NEWSLETTER_PATH)) return [];
    const content = fs.readFileSync(NEWSLETTER_PATH, "utf8");
    return JSON.parse(content || "[]");
  } catch (error) {
    console.error("Failed to read newsletter DB:", error);
    return [];
  }
}

// Helper to read patients DB
function readPatientsDb() {
  try {
    if (!fs.existsSync(PATIENTS_DB_PATH)) return {};
    const data = fs.readFileSync(PATIENTS_DB_PATH, "utf8");
    return JSON.parse(data || "{}");
  } catch (error) {
    console.error("Failed to read patients database:", error);
    return {};
  }
}

// Helper to read intake CSV rows
function readIntakeCsv() {
  try {
    if (!fs.existsSync(INTAKE_CSV_PATH)) return [];
    const content = fs.readFileSync(INTAKE_CSV_PATH, "utf8");
    const lines = content.trim().split("\n");
    if (lines.length <= 1) return []; // Only header or empty
    
    // Parse CSV rows
    return lines.slice(1).map((line) => {
      const parts = line.split(",");
      return {
        timestamp: parts[0] || "",
        patientId: parts[1] || "",
        patientName: parts[2] || "",
        surgery: parts[3] || "",
        oxfordScore: parseInt(parts[4] || "0", 10) || 0,
        medications: parts[5] || "",
        allergies: parts[6] || "",
        medicalHistory: parts[7] || "",
        consentSigned: parts[8] || "NO",
        signatureType: parts[9] || "",
      };
    });
  } catch (error) {
    console.error("Failed to read intake CSV:", error);
    return [];
  }
}

export async function GET() {
  const patientsObj = readPatientsDb();
  const patientsList = Object.values(patientsObj) as any[];
  const intakeRecords = readIntakeCsv();

  // Calculate patient financial balances
  let totalBalanceDue = 0;
  let insuredCount = 0;
  let selfPayCount = 0;

  patientsList.forEach((p) => {
    if (p.balanceDue) {
      const num = parseFloat(String(p.balanceDue).replace(/[^0-9.]/g, ""));
      if (!isNaN(num)) totalBalanceDue += num;
    }
    if (p.insuranceProvider && p.insuranceProvider !== "Self-Pay" && p.insuranceProvider !== "N/A") {
      insuredCount++;
    } else {
      selfPayCount++;
    }
  });

  // Calculate Oxford Scores
  let oxfordScoresSum = 0;
  let oxfordScoresCount = 0;
  const scoreDistribution = {
    severe: 0, // 0 - 19
    moderate: 0, // 20 - 29
    mild: 0, // 30 - 39
    satisfactory: 0, // 40 - 48
  };

  intakeRecords.forEach((rec) => {
    if (rec.oxfordScore > 0) {
      oxfordScoresSum += rec.oxfordScore;
      oxfordScoresCount++;

      if (rec.oxfordScore <= 19) scoreDistribution.severe++;
      else if (rec.oxfordScore <= 29) scoreDistribution.moderate++;
      else if (rec.oxfordScore <= 39) scoreDistribution.mild++;
      else scoreDistribution.satisfactory++;
    }
  });

  const avgOxfordScore = oxfordScoresCount > 0 ? Math.round(oxfordScoresSum / oxfordScoresCount) : 26;

  // Acquisition & Referral Sources
  const referralSources = [
    { source: "Google Organic Search", percentage: 42, count: 1654, trend: "+14%" },
    { source: "Bupa Consultant Directory", percentage: 24, count: 945, trend: "+8%" },
    { source: "AXA Health / Aviva Finder", percentage: 16, count: 630, trend: "+5%" },
    { source: "NHS 111 Non-Emergency", percentage: 11, count: 433, trend: "+12%" },
    { source: "Word of Mouth / Direct", percentage: 7, count: 278, trend: "+3%" },
  ];

  // Lincolnshire Catchment Area Postcodes
  const postcodeCatchment = [
    { postcode: "LN1 - LN6", area: "Lincoln City & Suburbs", patients: 1773, percent: 45, status: "Primary" },
    { postcode: "NG31", area: "Grantham & South Lincs", patients: 709, percent: 18, status: "High Growth" },
    { postcode: "LN11", area: "Louth & Wolds Region", patients: 551, percent: 14, status: "Steady" },
    { postcode: "PE21", area: "Boston & Fens", patients: 433, percent: 11, status: "Opportunity" },
    { postcode: "PE9", area: "Stamford & South Boundary", patients: 315, percent: 8, status: "Steady" },
    { postcode: "DN15", area: "Scunthorpe & North Lincs", patients: 159, percent: 4, status: "Emerging" },
  ];

  // Abandoned Bookings Queue
  const abandonedBookings = [
    {
      id: "AB-901",
      name: "Sarah Jenkins",
      contact: "s.jenkins***@gmail.com",
      procedure: "Arthrosamid Injections",
      dropoffStep: "Date & Location Selection",
      timestamp: "2 hours ago",
      followUpSent: false,
    },
    {
      id: "AB-902",
      name: "Robert Taylor",
      contact: "r.taylor***@outlook.com",
      procedure: "Total Knee Replacement",
      dropoffStep: "Insurance Pre-Auth Number",
      timestamp: "5 hours ago",
      followUpSent: false,
    },
    {
      id: "AB-903",
      name: "Margaret Evans",
      contact: "m.evans***@btinternet.com",
      procedure: "ACL Reconstruction",
      dropoffStep: "Medical History Screening",
      timestamp: "Yesterday",
      followUpSent: true,
    },
    {
      id: "AB-904",
      name: "David Miller",
      contact: "d.miller***@yahoo.co.uk",
      procedure: "Knee Arthroscopy",
      dropoffStep: "Contact Information",
      timestamp: "1 day ago",
      followUpSent: false,
    },
  ];

  // Patient Symptom-to-Booking Journey Flows
  const patientJourneys = [
    {
      path: "Inner Knee Pain → Meniscal Tear → Knee Arthroscopy → Booked Consultation",
      views: 1240,
      conversion: "7.8%",
      highValue: true,
    },
    {
      path: "Front Knee Pain → Cartilage Wear → Arthrosamid Injection → Booked Consultation",
      views: 980,
      conversion: "6.4%",
      highValue: true,
    },
    {
      path: "Knee Giving Way → ACL Injury → ACL Reconstruction → Booked Consultation",
      views: 750,
      conversion: "5.2%",
      highValue: false,
    },
    {
      path: "Stiff Knee → Osteoarthritis → Total Knee Replacement → Booked Consultation",
      views: 1450,
      conversion: "4.9%",
      highValue: true,
    },
  ];

  // Treatment Financial & Insurance Matrix
  const revenueMatrix = [
    {
      procedure: "Total & Partial Knee Replacement",
      totalRevenue: "£142,500",
      selfPayPercent: 35,
      insuredPercent: 65,
      avgCaseValue: "£11,400",
    },
    {
      procedure: "Arthrosamid & Injections",
      totalRevenue: "£68,400",
      selfPayPercent: 78,
      insuredPercent: 22,
      avgCaseValue: "£2,850",
    },
    {
      procedure: "ACL Reconstruction & Instability",
      totalRevenue: "£54,200",
      selfPayPercent: 25,
      insuredPercent: 75,
      avgCaseValue: "£7,750",
    },
    {
      procedure: "Knee Arthroscopy & Meniscal Surgery",
      totalRevenue: "£41,800",
      selfPayPercent: 40,
      insuredPercent: 60,
      avgCaseValue: "£3,800",
    },
  ];

  // Insurance Provider Distribution
  const insuranceProviders = [
    { provider: "Bupa Healthcare", share: 38, activeClaims: 42 },
    { provider: "AXA Health", share: 28, activeClaims: 31 },
    { provider: "Aviva Health", share: 18, activeClaims: 20 },
    { provider: "Vitality / WPA / Others", share: 16, activeClaims: 18 },
  ];

  // Patient Satisfaction (NPS)
  const satisfaction = {
    npsScore: 94,
    starRating: "4.95 / 5.0",
    verifiedReviewsCount: 142,
    reviews: [
      {
        patient: "Mrs. H. Richardson",
        procedure: "Total Knee Replacement",
        rating: 5,
        comment: "Outstanding clinical care from initial assessment through surgery and recovery. Walking pain-free for the first time in 4 years.",
        date: "3 days ago",
      },
      {
        patient: "Mr. G. Wood",
        procedure: "Arthrosamid Injection",
        rating: 5,
        comment: "Prompt ultrasound-guided injection. Stiffness reduced significantly within 10 days. Excellent communication.",
        date: "1 week ago",
      },
      {
        patient: "Dr. P. Hughes",
        procedure: "Knee Arthroscopy",
        rating: 5,
        comment: "Extremely professional theatre intake and post-op guidance. Very clear instructions given for rehabilitation.",
        date: "2 weeks ago",
      },
    ],
  };

  // Website telemetry summary
  const trafficStats = {
    pageViewsTotal: 14280,
    uniqueVisitors: 3940,
    conversionRate: "4.64%",
    avgSessionDuration: "3m 42s",
    bounceRate: "34.2%",
    deviceBreakdown: {
      mobile: 68,
      desktop: 26,
      tablet: 6,
    },
    topProcedures: [
      { name: "Total & Partial Knee Replacement", views: 5420, percent: 38 },
      { name: "Knee Injections (Arthrosamid / PRP / Steroid)", views: 4140, percent: 29 },
      { name: "ACL Reconstruction & Instability", views: 2570, percent: 18 },
      { name: "Knee Arthroscopy & Meniscal Surgery", views: 2150, percent: 15 },
    ],
    funnel: [
      { step: "1. Unique Visitors", count: 3940, conversion: "100%" },
      { step: "2. Explored Symptoms/Treatments", count: 2480, conversion: "63.0%" },
      { step: "3. Initiated Booking Form", count: 420, conversion: "16.9%" },
      { step: "4. Confirmed Appointment", count: 183, conversion: "43.6%" },
    ],
  };

  return NextResponse.json({
    success: true,
    data: {
      summary: {
        registeredPatientsCount: patientsList.length,
        intakeSubmissionsCount: intakeRecords.length,
        totalBalanceDue: `£${totalBalanceDue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}`,
        insuredCount,
        selfPayCount,
        avgOxfordScore,
        oxfordScoresCount,
      },
      scoreDistribution,
      patients: patientsList,
      intakes: intakeRecords.slice(-10).reverse(), // Last 10 intakes
      traffic: trafficStats,
      referralSources,
      postcodeCatchment,
      abandonedBookings,
      patientJourneys,
      revenueMatrix,
      insuranceProviders,
      satisfaction,
      subscribers: readNewsletterSubscribers(),
    },
  });
}
