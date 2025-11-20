// Demo driver data for testing
export const initializeDemoDrivers = () => {
  // Always ensure demo drivers exist
  const existingDrivers = JSON.parse(localStorage.getItem("drivers") || "[]");
  
  const demoDrivers = [
    {
      id: "DRV-001",
      phone: "0501234567",
      fullName: "Kwame Mensah",
      email: "driver@koko.com",
      vehicleType: "Motorbike",
      vehicleRegistration: "GH-1234-25",
      approved: true,
      branch: "Central Branch",
      createdAt: new Date().toISOString(),
      deliveries: [],
      totalEarnings: 0
    },
    {
      id: "DRV-002",
      phone: "0247654321",
      fullName: "Ama Osei",
      email: "driver2@koko.com",
      vehicleType: "Bicycle",
      vehicleRegistration: "GH-5678-25",
      approved: true,
      branch: "Central Branch",
      createdAt: new Date().toISOString(),
      deliveries: [],
      totalEarnings: 0
    }
  ];
  
  // Merge demo drivers with existing (avoid duplicates)
  const updatedDrivers = [...existingDrivers];
  demoDrivers.forEach(demoDriver => {
    const exists = updatedDrivers.find(d => d.phone === demoDriver.phone);
    if (!exists) {
      updatedDrivers.push(demoDriver);
    }
  });
  
  localStorage.setItem("drivers", JSON.stringify(updatedDrivers));
  console.log("Demo drivers initialized:", demoDrivers);
};
