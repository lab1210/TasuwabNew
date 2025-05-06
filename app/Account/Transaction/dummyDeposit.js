// Function to calculate interest on a deposit
const calculateInterest = (amount) => {
  const interestRate = 5; // Example interest rate (5%)
  return (amount * interestRate) / 100;
};
const dummyTransactions = [
  {
    DocNbr: "TXN001",
    Customer: "CL001",
    Accountnumber: "1234567890",
    TransactionType: "Deposit",
    amount: 50000,
    Branch: "1",
    Date: "2024-07-01",
    DocumentUrl: "https://example.com/docs/TXN001",
    OtherInfo: "Initial deposit",
    interest: calculateInterest(50000), // Calculate interest for this deposit
  },
  {
    DocNbr: "TXN002",
    Customer: "CL002",
    Accountnumber: "9876543210",
    TransactionType: "Withdrawal",
    amount: 20000,
    Branch: "1",
    Date: "2024-07-02",
    DocumentUrl: "https://example.com/docs/TXN002",
    OtherInfo: "ATM withdrawal",
    interest: 0, // No interest for withdrawals
  },
  {
    DocNbr: "TXN003",
    Customer: "CL003",
    Accountnumber: "1122334455",
    TransactionType: "Withdrawal",
    amount: 75000,
    Branch: "2",
    Date: "2024-07-03",
    DocumentUrl: "https://example.com/docs/TXN003",
    OtherInfo: "Cash withdrawal",
    interest: 0, // No interest for withdrawals
  },
  {
    DocNbr: "TXN004",
    Customer: "CL004",
    Accountnumber: "9988776655",
    TransactionType: "Deposit",
    amount: 30000,
    Branch: "2",
    Date: "2024-07-04",
    DocumentUrl: "https://example.com/docs/TXN004",
    OtherInfo: "Card deposit",
    interest: calculateInterest(30000), // Calculate interest for this deposit
  },
  {
    DocNbr: "TXN005",
    Customer: "CL005",
    Accountnumber: "4455667788",
    TransactionType: "Withdrawal",
    amount: 12000,
    Branch: "3",
    Date: "2024-07-05",
    DocumentUrl: "https://example.com/docs/TXN005",
    OtherInfo: "Bank transfer withdrawal",
    interest: 0, // No interest for withdrawals
  },
];

export default dummyTransactions;
