// "use client";
// import React, { useState } from "react";
// import jsPDF from "jspdf";
// import Layout from "@/app/components/Layout";
// import Select from "react-select";
// import dummyTransactions from "@/app/Account/Transaction/dummyDeposit";

// const DepositInterestExpense = () => {
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const filterByDateRange = (items) => {
//     return items.filter((item) => {
//       const itemDate = new Date(item.Date);
//       const isAfterStart = startDate ? itemDate >= new Date(startDate) : true;
//       const isBeforeEnd = endDate ? itemDate <= new Date(endDate) : true;
//       return isAfterStart && isBeforeEnd;
//     });
//   };

//   const filteredDeposits = filterByDateRange(dummyTransactions).filter(
//     (txn) => txn.TransactionType === "Deposit"
//   );

//   const calculateInterestExpense = () => {
//     // Calculate the total interest expense from all deposits within the date range
//     return filteredDeposits.reduce((totalExpense, txn) => {
//       return totalExpense + txn.interest;
//     }, 0);
//   };

//   const handleExportPDF = () => {
//     const doc = new jsPDF();
//     const content = document.getElementById("deposit-interest-expense-content");

//     doc.html(content, {
//       callback: function (doc) {
//         doc.save(`Deposit_Interest_Expense_Statement.pdf`);
//       },
//       x: 10,
//       y: 10,
//       width: 180,
//       windowWidth: 1000,
//     });
//   };

//   return (
//     <Layout>
//       <div className="w-full">
//         <div className="flex justify-between items-start">
//           <div>
//             <p className="text-4xl font-extrabold">Deposit Interest Expense</p>
//             <p className="text-sm text-gray-600">
//               View total interest expense for deposits made by clients.
//             </p>
//           </div>
//         </div>

//         <div className="mt-4 mb-5">
//           <div className="flex gap-4 mt-4 mb-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Start Date
//               </label>
//               <input
//                 type="date"
//                 value={startDate}
//                 onChange={(e) => setStartDate(e.target.value)}
//                 className="border border-gray-300 p-2 rounded"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 End Date
//               </label>
//               <input
//                 type="date"
//                 value={endDate}
//                 onChange={(e) => setEndDate(e.target.value)}
//                 className="border border-gray-300 p-2 rounded"
//               />
//             </div>
//           </div>
//         </div>

//         <div className="overflow-x-auto">
//           <div id="deposit-interest-expense-content">
//             <div className="flex items-center justify-between mb-4">
//               <p className="font-semibold text-lg text-[#4a5565]">
//                 Total Deposit Interest Expense
//               </p>
//               <button
//                 onClick={handleExportPDF}
//                 className="bg-[#3D873B] text-white px-4 py-2 rounded mt-4 cursor-pointer"
//               >
//                 Export to PDF
//               </button>
//             </div>
//             <div className="mb-4">
//               <div className="p-4 bg-[#f1f5f9] rounded shadow">
//                 <p className="font-semibold">Total Interest Expense</p>
//                 <p className="text-[#3D873B] font-bold">
//                   {new Intl.NumberFormat("en-NG", {
//                     style: "currency",
//                     currency: "NGN",
//                   }).format(calculateInterestExpense())}
//                 </p>
//               </div>
//             </div>

//             <div className="mb-4">
//               <table className="w-full table-auto divide-y divide-[#e5e7eb] shadow-lg rounded-md">
//                 <thead className="bg-[#f9fafb] text-[#6a7282] text-sm">
//                   <tr>
//                     <th className="text-left py-3 px-4">S/N</th>
//                     <th className="text-left py-3 px-4">Account Number</th>
//                     <th className="text-left py-3 px-4">Amount</th>
//                     <th className="text-left py-3 px-4">Interest</th>
//                   </tr>
//                 </thead>
//                 <tbody className="text-sm text-[#364153]">
//                   {filteredDeposits.length > 0 ? (
//                     filteredDeposits.map((txn, index) => (
//                       <tr key={txn.DocNbr}>
//                         <td className="py-3 px-4">{index + 1}</td>
//                         <td className="py-3 px-4">{txn.Accountnumber}</td>
//                         <td className="py-3 px-4">
//                           {new Intl.NumberFormat("en-NG", {
//                             style: "currency",
//                             currency: "NGN",
//                           }).format(txn.amount)}
//                         </td>
//                         <td className="py-3 px-4">
//                           {new Intl.NumberFormat("en-NG", {
//                             style: "currency",
//                             currency: "NGN",
//                           }).format(txn.interest)}
//                         </td>
//                       </tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan="4" className="py-3 px-4 text-center">
//                         No deposits found for the selected date range.
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default DepositInterestExpense;
