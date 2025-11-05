export const defaultBranches = [
  {
    id: "branch-east-legon",
    name: "East Legon",
    location: "East Legon Main Road, Accra",
    phone: "+233 24 123 4567",
    manager: "John Mensah",
    image: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "branch-osu",
    name: "Osu",
    location: "Osu Oxford Street, Accra",
    phone: "+233 24 234 5678",
    manager: "Ama Serwaa",
    image: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "branch-cantonments",
    name: "Cantonments",
    location: "Cantonments Road, Accra",
    phone: "+233 24 345 6789",
    manager: "Kwame Boateng",
    image: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "branch-airport",
    name: "Airport Residential",
    location: "Airport Residential Area, Accra",
    phone: "+233 24 456 7890",
    manager: "Grace Asante",
    image: "",
    createdAt: new Date().toISOString()
  },
  {
    id: "branch-spintex",
    name: "Spintex",
    location: "Spintex Road, Accra",
    phone: "+233 24 567 8901",
    manager: "Kofi Darko",
    image: "",
    createdAt: new Date().toISOString()
  }
];

// Initialize branches in localStorage if not exists
export const initializeBranches = () => {
  const existing = localStorage.getItem("branches");
  if (!existing || JSON.parse(existing).length === 0) {
    localStorage.setItem("branches", JSON.stringify(defaultBranches));
  }
};
