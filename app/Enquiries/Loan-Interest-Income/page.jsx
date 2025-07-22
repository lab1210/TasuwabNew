// "use client";
// import Layout from "@/app/components/Layout";
// import dummyLoans from "@/app/Loan/DummyLoan";
// import React, { useState } from "react";

// const LoanProfitIncomePage = () => {
//   const [selectedClient, setSelectedClient] = useState("");

//   // Filter loans by client if selected
//   const filteredLoans = selectedClient
//     ? dummyLoans.filter((loan) => loan.name === selectedClient)
//     : dummyLoans;

//   // Calculate profit for each loan with corrected logic
//   const loansWithProfit = filteredLoans.map((loan) => {
//     // Get the actual principal amount (what we financed)
//     const actualPrincipal =
//       loan.loanAmount === "NA" || !loan.loanAmount
//         ? Number(loan.costOfAssetFinancedByTasuwab || 0) // What we actually financed
//         : Number(loan.loanAmount);

//     // Get the total amount client will pay (including profit)
//     const totalAmountToPay =
//       loan.loanAmount === "NA" || !loan.loanAmount
//         ? Number(loan.minimumAssetPrice || 0) // Total amount for asset financing
//         : Number(loan.loanAmount) + Number(loan.profitEstimate || 0); // Principal + profit for business loans

//     // Calculate monthly installment amount (what client pays monthly)
//     const monthlyInstallment = totalAmountToPay / loan.InstallmentPeriod;

//     // Determine months paid and remaining
//     let monthsPaid = 0;
//     let monthsRemaining = loan.InstallmentPeriod;
//     let totalRepaid = 0;

//     if (loan.repayment) {
//       monthsRemaining = loan.repayment.MonthsRemaining || 0;
//       monthsPaid = loan.InstallmentPeriod - monthsRemaining;
//       totalRepaid = Number(loan.repayment.Repaidamount || 0);
//     }

//     // Calculate actual profit earned so far
//     // Profit = Total Repaid - (Principal Recovery based on months paid)
//     const principalRecovered =
//       actualPrincipal * (monthsPaid / loan.InstallmentPeriod);
//     const actualProfit = totalRepaid - principalRecovered;

//     // Expected total profit when loan is fully paid
//     const expectedTotalProfit = totalAmountToPay - actualPrincipal;

//     // Expected profit earned so far (proportional to months paid)
//     const expectedProfitEarned =
//       expectedTotalProfit * (monthsPaid / loan.InstallmentPeriod);

//     return {
//       ...loan,
//       actualPrincipal,
//       totalAmountToPay,
//       monthlyInstallment,
//       monthsPaid,
//       monthsRemaining,
//       totalRepaid,
//       principalRecovered,
//       actualProfit,
//       expectedTotalProfit,
//       expectedProfitEarned,
//       profitPercentage:
//         actualPrincipal > 0 ? (actualProfit / actualPrincipal) * 100 : 0,
//     };
//   });

//   // Sum total actual profit earned so far
//   const totalActualProfit = loansWithProfit.reduce(
//     (sum, loan) => sum + loan.actualProfit,
//     0
//   );

//   // Sum total expected profit when all loans are fully paid
//   const totalExpectedProfit = loansWithProfit.reduce(
//     (sum, loan) => sum + loan.expectedTotalProfit,
//     0
//   );

//   // Get unique clients for filtering
//   const uniqueClients = [...new Set(dummyLoans.map((loan) => loan.name))];

//   return (
//     <Layout className="max-w-6xl mx-auto p-6 bg-white rounded shadow">
//       <h2 className="text-2xl font-bold mb-6">Loan Profit Income</h2>

//       {/* Filter by Client */}
//       <div className="mb-6">
//         <label className="block font-semibold mb-2">Filter by Client</label>
//         <select
//           className="w-full border p-2 rounded"
//           value={selectedClient}
//           onChange={(e) => setSelectedClient(e.target.value)}
//         >
//           <option value="">-- All Clients --</option>
//           {uniqueClients.map((client) => (
//             <option key={client} value={client}>
//               {client}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Summary Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         <div className="bg-blue-50 p-4 rounded border">
//           <h3 className="font-semibold text-blue-800">Actual Profit Earned</h3>
//           <p className="text-2xl font-bold text-blue-600">
//             ₦{totalActualProfit.toLocaleString()}
//           </p>
//         </div>
//         <div className="bg-green-50 p-4 rounded border">
//           <h3 className="font-semibold text-green-800">
//             Expected Total Profit
//           </h3>
//           <p className="text-2xl font-bold text-green-600">
//             ₦{totalExpectedProfit.toLocaleString()}
//           </p>
//         </div>
//         <div className="bg-purple-50 p-4 rounded border">
//           <h3 className="font-semibold text-purple-800">Active Loans</h3>
//           <p className="text-2xl font-bold text-purple-600">
//             {loansWithProfit.filter((l) => l.status === "Active").length}
//           </p>
//         </div>
//       </div>

//       {/* Loan Profit Table */}
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse border border-gray-300">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="border border-gray-300 px-3 py-2 text-left">
//                 Loan ID
//               </th>
//               <th className="border border-gray-300 px-3 py-2 text-left">
//                 Client
//               </th>
//               <th className="border border-gray-300 px-3 py-2 text-right">
//                 Principal (₦)
//               </th>
//               <th className="border border-gray-300 px-3 py-2 text-center">
//                 Progress
//               </th>
//               <th className="border border-gray-300 px-3 py-2 text-right">
//                 Amount Repaid (₦)
//               </th>
//               <th className="border border-gray-300 px-3 py-2 text-right">
//                 Actual Profit (₦)
//               </th>
//               <th className="border border-gray-300 px-3 py-2 text-right">
//                 Expected Total Profit (₦)
//               </th>
//               <th className="border border-gray-300 px-3 py-2 text-right">
//                 Profit %
//               </th>
//               <th className="border border-gray-300 px-3 py-2 text-left">
//                 Status
//               </th>
//             </tr>
//           </thead>
//           <tbody>
//             {loansWithProfit.map((loan) => (
//               <tr key={loan.loanId} className="hover:bg-gray-50">
//                 <td className="border border-gray-300 px-3 py-2">
//                   {loan.loanId}
//                 </td>
//                 <td className="border border-gray-300 px-3 py-2">
//                   {loan.name}
//                 </td>
//                 <td className="border border-gray-300 px-3 py-2 text-right">
//                   {loan.actualPrincipal.toLocaleString()}
//                 </td>
//                 <td className="border border-gray-300 px-3 py-2 text-center">
//                   {loan.monthsPaid}/{loan.InstallmentPeriod} months
//                   <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
//                     <div
//                       className="bg-green-600 h-2 rounded-full"
//                       style={{
//                         width: `${
//                           (loan.monthsPaid / loan.InstallmentPeriod) * 100
//                         }%`,
//                       }}
//                     ></div>
//                   </div>
//                 </td>
//                 <td className="border border-gray-300 px-3 py-2 text-right">
//                   {loan.totalRepaid.toLocaleString()}
//                 </td>
//                 <td
//                   className={`border border-gray-300 px-3 py-2 text-right font-semibold ${
//                     loan.actualProfit < 0 ? "text-red-600" : "text-green-600"
//                   }`}
//                 >
//                   {loan.actualProfit.toLocaleString()}
//                 </td>
//                 <td className="border border-gray-300 px-3 py-2 text-right text-gray-600">
//                   {loan.expectedTotalProfit.toLocaleString()}
//                 </td>
//                 <td
//                   className={`border border-gray-300 px-3 py-2 text-right ${
//                     loan.profitPercentage < 0
//                       ? "text-red-600"
//                       : "text-green-600"
//                   }`}
//                 >
//                   {loan.profitPercentage.toFixed(1)}%
//                 </td>
//                 <td className="border border-gray-300 px-3 py-2">
//                   <span
//                     className={`px-2 py-1 rounded text-xs ${
//                       loan.status === "Approved"
//                         ? "bg-green-100 text-green-800"
//                         : loan.status === "Active"
//                         ? "bg-blue-100 text-blue-800"
//                         : "bg-gray-100 text-gray-800"
//                     }`}
//                   >
//                     {loan.status}
//                   </span>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Detailed Summary */}
//       <div className="mt-6 bg-gray-50 p-4 rounded">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <h3 className="font-semibold mb-2">Current Performance</h3>
//             <p>
//               Total Actual Profit Earned:{" "}
//               <span className="font-bold text-green-600">
//                 ₦{totalActualProfit.toLocaleString()}
//               </span>
//             </p>
//             <p>
//               Number of Active Loans:{" "}
//               <span className="font-bold">
//                 {loansWithProfit.filter((l) => l.status === "Active").length}
//               </span>
//             </p>
//           </div>
//           <div>
//             <h3 className="font-semibold mb-2">Projected Performance</h3>
//             <p>
//               Total Expected Profit:{" "}
//               <span className="font-bold text-blue-600">
//                 ₦{totalExpectedProfit.toLocaleString()}
//               </span>
//             </p>
//             <p>
//               Remaining Profit Potential:{" "}
//               <span className="font-bold text-purple-600">
//                 ₦{(totalExpectedProfit - totalActualProfit).toLocaleString()}
//               </span>
//             </p>
//           </div>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default LoanProfitIncomePage;
