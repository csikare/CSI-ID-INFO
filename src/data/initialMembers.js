// Default 80 Core Team Member initial profiles for CSI KARE Core Team 2026-27

const sampleRoles = [
  "Core Team Lead",
  "Technical Lead",
  "Events & Workshops Lead",
  "Design & Media Lead",
  "Public Relations Lead",
  "Web & App Operations Lead",
  "Competitive Programming Lead",
  "Sponsorship & Logistics Lead",
  "Content & Editorial Lead",
  "Core Executive Member"
];

export const generateInitial80Members = () => {
  const members = [];
  const now = new Date().toISOString();

  // Highlight first member as example Krishna Chaithanya with physical card reference data
  members.push({
    memberId: "CSI26-001",
    name: "Krishna Chaithanya",
    role: "Core Team Lead",
    year: "3rd Year",
    department: "CSE (AIML) | KARE",
    quote: "Tech People, Better Tomorrow",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
    instagram: "https://instagram.com/csikare",
    linkedin: "https://linkedin.com/company/csi-kare",
    email: "krishna.csi@klu.ac.in",
    phone: "+91 9876543210",
    createdAt: now,
    updatedAt: now,
  });

  // Generate the remaining 79 members
  for (let i = 2; i <= 80; i++) {
    const paddedId = String(i).padStart(3, '0');
    const memberId = `CSI26-${paddedId}`;
    const roleIndex = (i - 2) % sampleRoles.length;
    const year = i % 2 === 0 ? "3rd Year" : "2nd Year";

    members.push({
      memberId,
      name: `Core Member ${paddedId}`,
      role: sampleRoles[roleIndex],
      year,
      department: "CSE | KARE",
      quote: i % 3 === 0 ? "Innovating for a better digital tomorrow" : "",
      photoUrl: "",
      instagram: "",
      linkedin: "",
      email: `member${paddedId}@klu.ac.in`,
      phone: "",
      createdAt: now,
      updatedAt: now,
    });
  }

  return members;
};

export const INITIAL_MEMBERS = generateInitial80Members();
