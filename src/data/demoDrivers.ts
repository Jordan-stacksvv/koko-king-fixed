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
      vehicleReg: "GH-1234-25",
      vehicleRegistration: "GH-1234-25",
      approved: true,
      status: "approved",
      branch: "Central Branch",
      branchId: "branch-001",
      createdAt: new Date().toISOString(),
      deliveries: [],
      totalEarnings: 0,
      earnings: 0
    },
    {
      id: "DRV-002",
      phone: "0247654321",
      fullName: "Ama Osei",
      email: "driver2@koko.com",
      vehicleType: "Bicycle",
      vehicleReg: "GH-5678-25",
      vehicleRegistration: "GH-5678-25",
      approved: true,
      status: "approved",
      branch: "Central Branch",
      branchId: "branch-001",
      createdAt: new Date().toISOString(),
      deliveries: [],
      totalEarnings: 0,
      earnings: 0
    },
    {
      id: "DRV-003",
      phone: "0559876543",
      fullName: "Kofi Asante",
      email: "driver3@koko.com",
      vehicleType: "Motorbike",
      vehicleReg: "GH-2345-25",
      vehicleRegistration: "GH-2345-25",
      approved: true,
      status: "approved",
      branch: "Central Branch",
      branchId: "branch-001",
      createdAt: new Date().toISOString(),
      deliveries: [],
      totalEarnings: 0,
      earnings: 0
    },
    {
      id: "DRV-004",
      phone: "0203456789",
      fullName: "Abena Frimpong",
      email: "driver4@koko.com",
      vehicleType: "Car",
      vehicleReg: "GH-7890-25",
      vehicleRegistration: "GH-7890-25",
      approved: true,
      status: "approved",
      branch: "Central Branch",
      branchId: "branch-001",
      createdAt: new Date().toISOString(),
      deliveries: [],
      totalEarnings: 0,
      earnings: 0
    },
    {
      id: "DRV-005",
      phone: "0244567890",
      fullName: "Yaw Boateng",
      email: "driver5@koko.com",
      vehicleType: "Motorbike",
      vehicleReg: "GH-4567-25",
      vehicleRegistration: "GH-4567-25",
      approved: true,
      status: "approved",
      branch: "Central Branch",
      branchId: "branch-001",
      createdAt: new Date().toISOString(),
      deliveries: [],
      totalEarnings: 0,
      earnings: 0
    },
    {
      id: "DRV-006",
      phone: "0265432109",
      fullName: "Efua Adom",
      email: "driver6@koko.com",
      vehicleType: "Bicycle",
      vehicleReg: "GH-8901-25",
      vehicleRegistration: "GH-8901-25",
      approved: true,
      status: "approved",
      branch: "Central Branch",
      branchId: "branch-001",
      createdAt: new Date().toISOString(),
      deliveries: [],
      totalEarnings: 0,
      earnings: 0
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
