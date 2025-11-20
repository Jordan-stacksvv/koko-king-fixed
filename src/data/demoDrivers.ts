// Demo driver data for testing
export const initializeDemoDrivers = () => {
  const existingDrivers = localStorage.getItem("drivers");
  
  if (!existingDrivers || JSON.parse(existingDrivers).length === 0) {
    const demoDrivers = [
      {
        id: "DRV-001",
        phone: "0501234567",
        fullName: "Kwame Mensah",
        email: "driver@koko.com",
        vehicleType: "Motorbike",
        vehicleRegistration: "GH-1234-25",
        approved: true,
        createdAt: new Date().toISOString(),
        deliveries: []
      },
      {
        id: "DRV-002",
        phone: "0247654321",
        fullName: "Ama Osei",
        email: "driver2@koko.com",
        vehicleType: "Bicycle",
        vehicleRegistration: "GH-5678-25",
        approved: true,
        createdAt: new Date().toISOString(),
        deliveries: []
      }
    ];
    
    localStorage.setItem("drivers", JSON.stringify(demoDrivers));
    console.log("Demo drivers initialized:", demoDrivers);
  }
};
