// ─────────────────────────────────────────────────────────────
// SEEDED AVERAGE PRICES — ESTIMATES, NOT LIVE FARES
// All amounts in INR. Approximate typical averages for economy
// travel booked 3–4 weeks ahead, off-peak-to-shoulder season.
// Edit numbers here freely; no logic lives in this file.
// ─────────────────────────────────────────────────────────────

export const PRICES_UPDATED = "September 2026";

export const ORIGINS = ["Delhi", "Mumbai", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata"];

export const TRIP_TYPES = ["beach", "mountains", "heritage", "spiritual", "adventure", "nightlife"];

export const TIERS = ["hostel", "budget", "mid", "premium"];
export const TIER_LABEL = { hostel: "Hostel", budget: "Budget hotel", mid: "Mid-range hotel", premium: "Premium hotel" };

// Weekend travel (Fri out / Sun–Mon back) costs more than weekday travel.
export const WEEKEND_MULTIPLIER = { flight: 1.25, train: 1.1, bus: 1.1 };

// Destinations.
//   gateway: arrival airport/station; transferHours / transferCostRT apply only to flights
//   tiers: nightly [weekday, weekend]. hostel = per bed; hotels = per room (2 share a room)
//   limited: true = only a mid-range estimate is available
export const DESTINATIONS = {
  goa:       { name: "Goa", gateway: "Goa (GOI)", transferHours: 1, transferCostRT: 1200, types: ["beach", "nightlife"], altitude: false, dailySpend: 1800,
               tiers: { hostel: [700, 950], budget: [2200, 3000], mid: [5000, 6800], premium: [11000, 15000] } },
  jaipur:    { name: "Jaipur", gateway: "Jaipur (JAI)", transferHours: 0.5, transferCostRT: 600, types: ["heritage"], altitude: false, dailySpend: 1300,
               tiers: { hostel: [500, 600], budget: [1800, 2100], mid: [4000, 4600], premium: [9500, 11000] } },
  udaipur:   { name: "Udaipur", gateway: "Udaipur (UDR)", transferHours: 0.5, transferCostRT: 800, types: ["heritage"], altitude: false, dailySpend: 1400,
               tiers: { hostel: [550, 700], budget: [2000, 2500], mid: [4800, 5800], premium: [12000, 15000] } },
  manali:    { name: "Manali", gateway: "Chandigarh (IXC)", transferHours: 7, transferCostRT: 3000, types: ["mountains", "adventure"], altitude: false, dailySpend: 1400,
               tiers: { hostel: [500, 700], budget: [1600, 2200], mid: [3800, 5000], premium: [8500, 11000] } },
  rishikesh: { name: "Rishikesh", gateway: "Dehradun (DED)", transferHours: 1, transferCostRT: 1500, types: ["spiritual", "adventure", "mountains"], altitude: false, dailySpend: 1100,
               tiers: { hostel: [450, 600], budget: [1500, 1900], mid: [3500, 4400], premium: [8000, 10000] } },
  munnar:    { name: "Kochi & Munnar", gateway: "Kochi (COK)", transferHours: 4, transferCostRT: 3500, types: ["mountains", "heritage"], altitude: false, dailySpend: 1400,
               limited: true, tiers: { mid: [4200, 5000] } },
  pondy:     { name: "Pondicherry", gateway: "Chennai (MAA)", transferHours: 3, transferCostRT: 1200, types: ["beach", "heritage"], altitude: false, dailySpend: 1300,
               limited: true, tiers: { mid: [4000, 4800] } },
  leh:       { name: "Leh", gateway: "Leh (IXL)", transferHours: 0.3, transferCostRT: 500, types: ["mountains", "adventure"], altitude: true, dailySpend: 1800,
               limited: true, tiers: { mid: [4500, 5400] } },
  andaman:   { name: "Port Blair (Andamans)", gateway: "Port Blair (IXZ)", transferHours: 0.3, transferCostRT: 600, types: ["beach", "adventure"], altitude: false, dailySpend: 2200,
               limited: true, tiers: { mid: [5500, 6600] } },
  varanasi:  { name: "Varanasi", gateway: "Varanasi (VNS)", transferHours: 0.7, transferCostRT: 800, types: ["spiritual", "heritage"], altitude: false, dailySpend: 1000,
               limited: true, tiers: { mid: [3500, 4200] } },
  coorg:     { name: "Coorg", gateway: "Mangaluru (IXE)", transferHours: 4, transferCostRT: 2500, types: ["mountains"], altitude: false, dailySpend: 1300,
               limited: true, tiers: { mid: [4800, 5800] } },
  gokarna:   { name: "Gokarna", gateway: "Goa (GOI)", transferHours: 3, transferCostRT: 2000, types: ["beach", "spiritual"], altitude: false, dailySpend: 1200,
               limited: true, tiers: { mid: [3500, 4200] } },
};

// Average round-trip fares per person, weekday: [fare, one-way hours, mode].
// For flights, hours = typical flight time incl. layovers; the destination
// transfer is added on top. For train/bus, hours and fare are door to destination.
export const ROUTES = {
  goa:       { Delhi: [9500, 2.5, "flight"], Mumbai: [5500, 1.2, "flight"], Bengaluru: [5800, 1.2, "flight"], Hyderabad: [6500, 1.3, "flight"], Chennai: [7500, 1.5, "flight"], Pune: [6500, 2.5, "flight"], Kolkata: [11000, 2.7, "flight"] },
  jaipur:    { Delhi: [2000, 4.5, "train"], Mumbai: [7500, 1.7, "flight"], Bengaluru: [9500, 2.5, "flight"], Hyderabad: [8500, 2, "flight"], Chennai: [10000, 2.7, "flight"], Pune: [8000, 2, "flight"], Kolkata: [9500, 2.3, "flight"] },
  udaipur:   { Delhi: [8500, 1.3, "flight"], Mumbai: [7500, 1.3, "flight"], Bengaluru: [10500, 2.2, "flight"], Hyderabad: [10000, 3.5, "flight"], Chennai: [11500, 4, "flight"], Pune: [9000, 3.5, "flight"], Kolkata: [12000, 4.5, "flight"] },
  manali:    { Delhi: [3000, 12, "bus"], Mumbai: [10000, 2.5, "flight"], Bengaluru: [11500, 3, "flight"], Hyderabad: [11000, 2.7, "flight"], Chennai: [12500, 4.5, "flight"], Pune: [11000, 4, "flight"], Kolkata: [11500, 4.5, "flight"] },
  rishikesh: { Delhi: [1800, 6, "train"], Mumbai: [10000, 2.5, "flight"], Bengaluru: [11000, 3, "flight"], Hyderabad: [10500, 2.5, "flight"], Chennai: [12000, 4.5, "flight"], Pune: [11000, 4, "flight"], Kolkata: [11000, 4, "flight"] },
  munnar:    { Delhi: [12000, 3.3, "flight"], Mumbai: [8000, 2, "flight"], Bengaluru: [4500, 1, "flight"], Hyderabad: [7000, 1.5, "flight"], Chennai: [5500, 1.2, "flight"], Pune: [8500, 2, "flight"], Kolkata: [12500, 3.5, "flight"] },
  pondy:     { Delhi: [10500, 2.8, "flight"], Mumbai: [8000, 2, "flight"], Bengaluru: [1800, 7, "bus"], Hyderabad: [6000, 1.3, "flight"], Chennai: [800, 3, "bus"], Pune: [8000, 2, "flight"], Kolkata: [9000, 2.3, "flight"] },
  leh:       { Delhi: [11000, 1.3, "flight"], Mumbai: [17000, 4.5, "flight"], Bengaluru: [18500, 5.5, "flight"], Hyderabad: [18000, 5, "flight"], Chennai: [19000, 6, "flight"], Pune: [17500, 5, "flight"], Kolkata: [17000, 5.5, "flight"] },
  andaman:   { Delhi: [17000, 4, "flight"], Mumbai: [17500, 5, "flight"], Bengaluru: [13000, 2.5, "flight"], Hyderabad: [13500, 2.5, "flight"], Chennai: [10500, 2.2, "flight"], Pune: [17000, 5, "flight"], Kolkata: [11000, 2.2, "flight"] },
  varanasi:  { Delhi: [8000, 1.5, "flight"], Mumbai: [10000, 2.3, "flight"], Bengaluru: [11000, 2.5, "flight"], Hyderabad: [9500, 2, "flight"], Chennai: [11000, 2.5, "flight"], Pune: [10000, 2.2, "flight"], Kolkata: [7000, 1.3, "flight"] },
  coorg:     { Delhi: [12500, 3, "flight"], Mumbai: [7500, 1.5, "flight"], Bengaluru: [1600, 5.5, "bus"], Hyderabad: [8000, 1.5, "flight"], Chennai: [7000, 3, "flight"], Pune: [8000, 2.5, "flight"], Kolkata: [13000, 4.5, "flight"] },
  gokarna:   { Delhi: [9500, 2.5, "flight"], Mumbai: [5500, 1.2, "flight"], Bengaluru: [2000, 9, "bus"], Hyderabad: [6500, 1.3, "flight"], Chennai: [7500, 1.5, "flight"], Pune: [6500, 2.5, "flight"], Kolkata: [11000, 2.7, "flight"] },
};

// Hard no's a person can pick (in addition to excluding specific destinations).
export const HARD_NOS = {
  long_road: "No road or rail legs over 6 hours each way",
  altitude: "No high-altitude places",
  hostel: "No hostels",
  overnight: "No overnight buses or trains",
};
