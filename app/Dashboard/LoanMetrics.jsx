"use client";
import React from "react";
import { CreditCard, CheckCircle, DollarSign, Clock } from "lucide-react";
import StatCard from "./StatCard";

const LoanMetrics = ({ periodLabel }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={CreditCard}
        title={`Total Loans (${periodLabel})`}
        value={"18"}
        change="12%"
        changeType="positive"
      />
      <StatCard
        icon={CheckCircle}
        title={`Approved (${periodLabel})`}
        value={"10"}
        change="8%"
        changeType="positive"
        color="green"
      />
      <StatCard
        icon={DollarSign}
        title={`Total Amount (${periodLabel})`}
        value="₦20M"
        change="15%"
        changeType="positive"
        color="purple"
      />
      <StatCard
        icon={Clock}
        title={`Pending (${periodLabel})`}
        value={"5"}
        change="5%"
        changeType="negative"
        color="yellow"
      />
    </div>
  );
};

export default LoanMetrics;
