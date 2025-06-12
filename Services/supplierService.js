const STORAGE_KEY_For_Suppliers = "suppliersData";
const dummySuppliers = [
  {
    id: "1",
    loanID: "LN2000",
    name: "ElectroHub Ltd",
    email: "contact@electrohub.com",
    phone: "+2348011112222",
    address: "12 Victoria Island, Lagos",
    bank: "GTBank",
    accountNumber: "1234567890",
    accountName: "ElectroHub Ltd",
    categories: [
      {
        id: "1", // Electronics
        name: "Electronics",
        products: [
          { id: "1", name: "Smartphone", price: 150000 },
          { id: "2", name: "Laptop", price: 350000 },
        ],
      },
    ],
  },
  {
    id: "2",
    loanID: "LN2001",
    name: "BookVerse",
    email: "info@bookverse.ng",
    phone: "+2348092223333",
    address: "45 Ikeja Street, Lagos",
    bank: "Access Bank",
    accountNumber: "9876543210",
    accountName: "BookVerse Enterprises",
    categories: [
      {
        id: "2", // Books
        name: "Books",
        products: [
          { id: "3", name: "Novel", price: 2500 },
          { id: "4", name: "Biography", price: 3000 },
        ],
      },
    ],
  },
  {
    id: "3",
    loanID: "LN2000",
    name: "ClothWorld",
    email: "sales@clothworld.com",
    phone: "+2348033334444",
    address: "78 Mushin Avenue, Lagos",
    bank: "First Bank",
    accountNumber: "1122334455",
    accountName: "ClothWorld Nig Ltd",
    categories: [
      {
        id: "3", // Clothing
        name: "Clothing",
        products: [
          { id: "5", name: "T-Shirt", price: 3500 },
          { id: "6", name: "Jeans", price: 8000 },
        ],
      },
    ],
  },
  {
    id: "4",
    loanID: "LN2001",
    name: "MultiSupply Co.",
    email: "contact@multisupply.ng",
    phone: "+2348077778888",
    address: "100 Aba Road, Port Harcourt",
    bank: "Ecobank",
    accountNumber: "5544332211",
    accountName: "MultiSupply Co. Ltd",
    categories: [
      {
        id: "1",
        name: "Electronics",
        products: [{ id: "2", name: "Laptop", price: 340000 }],
      },
      {
        id: "2",
        name: "Books",
        products: [{ id: "3", name: "Novel", price: 2600 }],
      },
      {
        id: "3",
        name: "Clothing",
        products: [{ id: "6", name: "Jeans", price: 7500 }],
      },
    ],
  },
];

// Initialize localStorage with dummy data if empty
function initializeData() {
  if (!localStorage.getItem(STORAGE_KEY_For_Suppliers)) {
    localStorage.setItem(
      STORAGE_KEY_For_Suppliers,
      JSON.stringify(dummySuppliers)
    );
  }
}

function getAllSuppliers() {
  initializeData(); // ensure data is initialized before fetching
  const data = localStorage.getItem(STORAGE_KEY_For_Suppliers);
  return data ? JSON.parse(data) : [];
}

function saveAllSuppliers(suppliers) {
  localStorage.setItem(STORAGE_KEY_For_Suppliers, JSON.stringify(suppliers));
}

function generateId() {
  // simple ID generator - you can replace with UUID if you want
  return Date.now().toString();
}

export function getSuppliers() {
  return getAllSuppliers();
}

export function getSupplierById(id) {
  const suppliers = getAllSuppliers();
  return suppliers.find((s) => s.id === id);
}

export function addSupplier(supplier) {
  const suppliers = getAllSuppliers();
  const newSupplier = { id: generateId(), ...supplier };
  suppliers.push(newSupplier);
  saveAllSuppliers(suppliers);
  return newSupplier;
}

export function updateSupplier(id, updatedSupplier) {
  const suppliers = getAllSuppliers();
  const index = suppliers.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error("Supplier not found");
  }
  suppliers[index] = { ...suppliers[index], ...updatedSupplier };
  saveAllSuppliers(suppliers);
  return suppliers[index];
}

export function deleteSupplier(id) {
  let suppliers = getAllSuppliers();
  suppliers = suppliers.filter((s) => s.id !== id);
  saveAllSuppliers(suppliers);
}
