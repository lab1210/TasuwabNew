"use client";
import React from "react";
import { Wallet, ArrowDownLeft, ArrowUpRight, DollarSign } from "lucide-react";
import StatCard from "./StatCard";

const BankingMetrics = ({ periodLabel }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        icon={Wallet}
        title={`Transactions (${periodLabel})`}
        value={"34"}
        change="8%"
        changeType="positive"
      />
      <StatCard
        icon={ArrowDownLeft}
        title={`Deposits (${periodLabel})`}
        value="₦15M"
        change="12%"
        changeType="positive"
        color="green"
      />
      <StatCard
        icon={ArrowUpRight}
        title={`Withdrawals (${periodLabel})`}
        value="₦8M"
        change="5%"
        changeType="positive"
        color="purple"
      />
      <StatCard
        icon={DollarSign}
        title={`Net Flow (${periodLabel})`}
        value="₦7M"
        change="18%"
        changeType="positive"
        color="yellow"
      />
    </div>
  );
};

export default BankingMetrics;
