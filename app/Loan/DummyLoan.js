const dummyLoans = [
  {
    LoanID: "1",
    Equity: 20,
    clientId: "CL001",
    bankAccount: "0123456789",
    loanAmount: 250000,
    loanType: "Personal",
    interestRate: 12,
    loanPurpose: "Business Expansion",
    interestAmount: 0, // Will be calculated later
    guarantors: [
      {
        name: "John Doe",
        email: "john@example.com",
        phone: "08012345678",
        address: "12 Marina Street, Lagos",
      },
    ],
    document: "loan_doc_001.pdf",
    memo: "Urgent disbursement needed.",
    status: "Pending",
    currentBalance: 45000,
    transactions: [
      {
        date: "2025-01-15",
        type: "Disbursement",
        amount: 50000,
        description: "Initial loan disbursement",
        status: "Approved",
        docNbr: "DOC-1-1",
        interestRate: 12,
        assignedRole: "MANG001", // Added assignedRole
      },
    ],
    roleAssigned: "MANG001", // Updated role
  },
  {
    LoanID: "2",
    Equity: 20,
    clientId: "CL002",
    bankAccount: "0987654321",
    loanAmount: 500000,
    loanType: "Mortgage",
    interestRate: 10,
    loanPurpose: "Home Purchase",
    interestAmount: 0, // Will be calculated later
    guarantors: [
      {
        name: "Mark Anthony",
        email: "marka@example.com",
        phone: "08033445566",
        address: "15 Bourdillon Road, Ikoyi",
      },
    ],
    document: "loan_doc_002.pdf",
    memo: "Client needs approval by end of week.",
    status: "Approved",
    currentBalance: 200000,
    transactions: [
      {
        date: "2025-01-20",
        type: "Disbursement",
        amount: 200000,
        description: "Initial mortgage disbursement",
        status: "Pending",
        docNbr: "DOC-2-1",
        interestRate: 10,
        assignedRole: "ADMIN", // Added assignedRole
      },
    ],
    roleAssigned: "ADMIN", // Updated role
  },
  {
    LoanID: "3",
    Equity: 25,
    clientId: "CL003",
    bankAccount: "1122334455",
    loanAmount: 1000000,
    loanType: "Business",
    interestRate: 15,
    loanPurpose: "Business Expansion",
    interestAmount: 0, // Will be calculated later
    guarantors: [
      {
        name: "Sophia Williams",
        email: "sophia@example.com",
        phone: "08123456789",
        address: "34 Lekki Phase 1, Lagos",
      },
    ],
    document: "loan_doc_003.pdf",
    memo: "Approval pending for larger amount.",
    status: "Pending",
    currentBalance: 500000,
    transactions: [
      {
        date: "2025-02-10",
        type: "Disbursement",
        amount: 500000,
        description: "Business loan disbursement",
        status: "Approved",
        docNbr: "DOC-3-1",
        interestRate: 15,
        assignedRole: "MANG001", // Added assignedRole
      },
    ],
    roleAssigned: "MANG001", // Updated role
  },
  {
    LoanID: "4",
    Equity: 15,
    clientId: "CL004",
    bankAccount: "6677889900",
    loanAmount: 150000,
    loanType: "Car Loan",
    interestRate: 8,
    loanPurpose: "Vehicle Purchase",
    interestAmount: 0, // Will be calculated later
    guarantors: [
      {
        name: "Evelyn Okafor",
        email: "evelyn@example.com",
        phone: "09011223344",
        address: "25 Victoria Island, Lagos",
      },
    ],
    document: "loan_doc_004.pdf",
    memo: "Final approval needed.",
    status: "Approved",
    currentBalance: 75000,
    transactions: [
      {
        date: "2025-01-25",
        type: "Disbursement",
        amount: 75000,
        description: "Car loan disbursement",
        status: "Approved",
        docNbr: "DOC-4-1",
        interestRate: 8,
        assignedRole: "ADMIN", // Added assignedRole
      },
    ],
    roleAssigned: "ADMIN", // Updated role
  },
  {
    LoanID: "5",
    Equity: 30,
    clientId: "CL005",
    bankAccount: "4455667788",
    loanAmount: 2000000,
    loanType: "Business",
    interestRate: 20,
    loanPurpose: "Factory Setup",
    interestAmount: 0, // Will be calculated later
    guarantors: [
      {
        name: "Samuel Jacobs",
        email: "samuel@example.com",
        phone: "07012345678",
        address: "44 Ogunlana Drive, Lagos",
      },
    ],
    document: "loan_doc_005.pdf",
    memo: "Immediate loan disbursement required.",
    status: "Pending",
    currentBalance: 1000000,
    transactions: [
      {
        date: "2025-02-01",
        type: "Disbursement",
        amount: 1000000,
        description: "Business loan disbursement",
        status: "Approved",
        docNbr: "DOC-5-1",
        interestRate: 20,
        assignedRole: "MANG001", // Added assignedRole
      },
    ],
    roleAssigned: "MANG001", // Updated role
  },
  {
    LoanID: "6",
    Equity: 10,
    clientId: "CL006",
    bankAccount: "3344556677",
    loanAmount: 750000,
    loanType: "Personal",
    interestRate: 18,
    loanPurpose: "Wedding Expenses",
    interestAmount: 0, // Will be calculated later
    guarantors: [
      {
        name: "Chuka Okonkwo",
        email: "chuka@example.com",
        phone: "08055667788",
        address: "77 Allen Avenue, Ikeja",
      },
    ],
    document: "loan_doc_006.pdf",
    memo: "Need approval urgently.",
    status: "Approved",
    currentBalance: 250000,
    transactions: [
      {
        date: "2025-01-30",
        type: "Disbursement",
        amount: 250000,
        description: "Wedding loan disbursement",
        status: "Approved",
        docNbr: "DOC-6-1",
        interestRate: 18,
        assignedRole: "ADMIN", // Added assignedRole
      },
    ],
    roleAssigned: "ADMIN", // Updated role
  },
  {
    LoanID: "7",
    Equity: 5,
    clientId: "CL007",
    bankAccount: "1231231231",
    loanAmount: 300000,
    loanType: "Personal",
    interestRate: 14,
    loanPurpose: "Education",
    interestAmount: 0, // Will be calculated later
    guarantors: [
      {
        name: "Amina Bello",
        email: "amina@example.com",
        phone: "08098765432",
        address: "12 Yaba, Lagos",
      },
    ],
    document: "loan_doc_007.pdf",
    memo: "Urgent approval needed for school fees.",
    status: "Pending",
    currentBalance: 120000,
    transactions: [
      {
        date: "2025-02-05",
        type: "Disbursement",
        amount: 120000,
        description: "Education loan disbursement",
        status: "Approved",
        docNbr: "DOC-7-1",
        interestRate: 14,
        assignedRole: "MANG001", // Added assignedRole
      },
    ],
    roleAssigned: "MANG001", // Updated role
  },
  {
    LoanID: "8",
    Equity: 10,
    clientId: "CL008",
    bankAccount: "2223334445",
    loanAmount: 800000,
    loanType: "Car Loan",
    interestRate: 11,
    loanPurpose: "Car Purchase",
    interestAmount: 0, // Will be calculated later
    guarantors: [
      {
        name: "Grace Nwosu",
        email: "grace@example.com",
        phone: "09012345678",
        address: "35 Ajah Road, Lagos",
      },
    ],
    document: "loan_doc_008.pdf",
    memo: "Client requesting an extension for disbursement.",
    status: "Approved",
    currentBalance: 400000,
    transactions: [
      {
        date: "2025-02-20",
        type: "Disbursement",
        amount: 400000,
        description: "Car loan disbursement",
        status: "Approved",
        docNbr: "DOC-8-1",
        interestRate: 11,
        assignedRole: "ADMIN", // Added assignedRole
      },
    ],
    roleAssigned: "ADMIN", // Updated role
  },
];

export default dummyLoans;
