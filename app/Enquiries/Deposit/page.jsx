// "use client";
// import React, { useState } from "react";
// import jsPDF from "jspdf";
// import dummyDeposits from "@/app/Account/Transaction/dummyDeposit";
// import Layout from "@/app/components/Layout";
// import Select from "react-select";
// import dummyClients from "@/app/Loan/DummyClient";

// const DepositEnquiry = () => {
//   const [selectedClientId, setSelectedClientId] = useState("");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   const clients = [...new Set(dummyDeposits.map((d) => d.Customer))];

//   const allClients = clients.map((clientId) => {
//     const client = dummyClients.find((c) => c.clientId === clientId);
//     const clientName = client
//       ? `${client.firstName} ${client.lastName} (${client.accountnumber})`
//       : `Client ${clientId}`;
//     return { value: clientId, label: clientName };
//   });

//   const filterByDateRange = (items) => {
//     return items.filter((item) => {
//       const itemDate = new Date(item.Date);
//       const isAfterStart = startDate ? itemDate >= new Date(startDate) : true;
//       const isBeforeEnd = endDate ? itemDate <= new Date(endDate) : true;
//       return isAfterStart && isBeforeEnd;
//     });
//   };

//   const allClientDeposits = dummyDeposits.filter(
//     (d) => d.Customer === selectedClientId
//   );

//   const openingDeposits = allClientDeposits.filter(
//     (d) =>
//       new Date(d.Date) < new Date(startDate) && d.TransactionType === "Deposit"
//   );
//   const openingWithdrawals = allClientDeposits.filter(
//     (d) =>
//       new Date(d.Date) < new Date(startDate) &&
//       d.TransactionType === "Withdrawal"
//   );

//   const sum = (arr) => arr.reduce((acc, item) => acc + Number(item.amount), 0);
//   const openingDepositAmount = sum(openingDeposits);
//   const openingWithdrawalAmount = sum(openingWithdrawals);
//   const openingBalance = openingDepositAmount - openingWithdrawalAmount;

//   const inRangeDeposits = filterByDateRange(
//     allClientDeposits.filter((d) => d.TransactionType === "Deposit")
//   );
//   const inRangeWithdrawals = filterByDateRange(
//     allClientDeposits.filter((d) => d.TransactionType === "Withdrawal")
//   );

//   const totalDepositsInRange = sum(inRangeDeposits);
//   const totalWithdrawalsInRange = sum(inRangeWithdrawals);
//   const closingBalance =
//     openingBalance + totalDepositsInRange - totalWithdrawalsInRange;

//   const handleExportPDF = () => {
//     const doc = new jsPDF();
//     const content = document.getElementById("statement-content");
//     doc.html(content, {
//       callback: function (doc) {
//         doc.save(`Client_${selectedClientId}_DepositEnquiry.pdf`);
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
//             <p className="text-4xl font-extrabold">Customer Enquiry</p>
//             <p className="text-sm text-gray-600">
//               View transactions for a selected client.
//             </p>
//           </div>
//         </div>

//         <div className="mt-4 mb-5">
//           <Select
//             id="clientId"
//             isSearchable
//             isClearable
//             options={allClients}
//             value={allClients.find(
//               (client) => client.value === selectedClientId
//             )}
//             onChange={(selectedOption) =>
//               setSelectedClientId(selectedOption ? selectedOption.value : "")
//             }
//             placeholder="Select Client"
//           />
//         </div>

//         <div className="flex gap-4 mt-4 mb-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Start Date
//             </label>
//             <input
//               type="date"
//               value={startDate}
//               onChange={(e) => setStartDate(e.target.value)}
//               className="border border-gray-300 p-2 rounded"
//             />
//           </div>
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               End Date
//             </label>
//             <input
//               type="date"
//               value={endDate}
//               onChange={(e) => setEndDate(e.target.value)}
//               className="border border-gray-300 p-2 rounded"
//             />
//           </div>
//         </div>

//         {selectedClientId && (
//           <div id="statement-content">
//             <div className="flex items-center justify-between mb-4">
//               <p className="font-semibold text-lg text-[#4a5565]">
//                 Statement for Client:{" "}
//                 <span className="text-[#3D873B] font-bold">
//                   {
//                     allClients.find(
//                       (client) => client.value === selectedClientId
//                     )?.label
//                   }
//                 </span>
//               </p>
//               <button
//                 onClick={handleExportPDF}
//                 className="bg-[#3D873B] text-white px-4 py-2 rounded mt-4 cursor-pointer"
//               >
//                 Export to PDF
//               </button>
//             </div>

//             <div className="mb-4">
//               <p className="text-lg font-bold text-[#4a5565] mb-2">
//                 Balance Summary
//               </p>
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-[#364153]">
//                 <div className="p-4 bg-[#f1f5f9] rounded shadow">
//                   <p className="font-semibold">Opening Balance</p>
//                   <p className="text-[#3D873B] font-bold">
//                     {new Intl.NumberFormat("en-NG", {
//                       style: "currency",
//                       currency: "NGN",
//                     }).format(openingBalance)}
//                   </p>
//                 </div>
//                 <div className="p-4 bg-[#f1f5f9] rounded shadow">
//                   <p className="font-semibold">Closing Balance</p>
//                   <p className="text-[#3D873B] font-bold">
//                     {new Intl.NumberFormat("en-NG", {
//                       style: "currency",
//                       currency: "NGN",
//                     }).format(closingBalance)}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="mb-4">
//               <p className="font-bold text-xl">Transactions</p>
//               {inRangeDeposits.length + inRangeWithdrawals.length > 0 ? (
//                 <table className="w-full table-auto divide-y divide-[#e5e7eb] shadow-lg rounded-md">
//                   <thead className="bg-[#f9fafb] text-[#6a7282] text-sm">
//                     <tr>
//                       <th className="text-left py-3 px-4">Date</th>
//                       <th className="text-left py-3 px-4">Amount</th>
//                       <th className="text-left py-3 px-4">Type</th>
//                       <th className="text-left py-3 px-4">Other Info</th>
//                     </tr>
//                   </thead>
//                   <tbody className="text-sm text-[#364153]">
//                     {[...inRangeDeposits, ...inRangeWithdrawals]
//                       .sort((a, b) => new Date(a.Date) - new Date(b.Date))
//                       .map((d, index) => (
//                         <tr key={index}>
//                           <td className="py-3 px-4">{d.Date}</td>
//                           <td className="py-3 px-4">
//                             {new Intl.NumberFormat("en-NG", {
//                               style: "currency",
//                               currency: "NGN",
//                             }).format(d.amount)}
//                           </td>
//                           <td className="py-3 px-4">{d.TransactionType}</td>
//                           <td className="py-3 px-4">{d.OtherInfo}</td>
//                         </tr>
//                       ))}
//                   </tbody>
//                 </table>
//               ) : (
//                 <p>No transactions found for selected date range.</p>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </Layout>
//   );
// };

// export default DepositEnquiry;
