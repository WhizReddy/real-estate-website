'use client';

import { useState, useEffect } from 'react';
import { Calculator, Euro, Percent, Calendar, Info } from 'lucide-react';

interface MortgageCalculatorProps {
    price: number;
    className?: string;
}

export default function MortgageCalculator({ price, className = '' }: MortgageCalculatorProps) {
    const [downPaymentPercent, setDownPaymentPercent] = useState(20);
    const [interestRate, setInterestRate] = useState(4.5);
    const [loanTerm, setLoanTerm] = useState(25);
    const [monthlyPayment, setMonthlyPayment] = useState(0);
    const [totalPayment, setTotalPayment] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);

    const calculateMortgage = () => {
        const principal = price * (1 - downPaymentPercent / 100);
        const monthlyRate = interestRate / 100 / 12;
        const numberOfPayments = loanTerm * 12;

        if (monthlyRate === 0) {
            const payment = principal / numberOfPayments;
            setMonthlyPayment(payment);
            setTotalPayment(principal);
            setTotalInterest(0);
            return;
        }

        const x = Math.pow(1 + monthlyRate, numberOfPayments);
        const monthly = (principal * x * monthlyRate) / (x - 1);

        setMonthlyPayment(monthly);
        setTotalPayment(monthly * numberOfPayments);
        setTotalInterest((monthly * numberOfPayments) - principal);
    };

    useEffect(() => {
        calculateMortgage();
    }, [price, downPaymentPercent, interestRate, loanTerm]);

    const downPaymentAmount = price * (downPaymentPercent / 100);
    const loanAmount = price - downPaymentAmount;

    return (
        <div className={`bg-white rounded-2xl shadow-xl overflow-hidden border border-blue-100 ${className}`}>
            <div className="bg-linear-to-r from-blue-900 to-indigo-900 p-6 text-white text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <Calculator className="h-5 w-5 text-blue-300" />
                    <h3 className="text-xl font-bold">Kalkulatori i Hipotekës</h3>
                </div>
                <p className="text-blue-100/80 text-sm">Llogaritni këstin tuaj mujor</p>
            </div>

            <div className="p-6 space-y-6">
                {/* Down Payment */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                        <span className="flex items-center gap-2">
                            <Euro className="h-4 w-4 text-blue-600" />
                            Parapagesa
                        </span>
                        <span className="text-blue-600 font-bold">{downPaymentPercent}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={downPaymentPercent}
                        onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                        className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-500 font-medium italic">
                        <span>€0</span>
                        <span>€{downPaymentAmount.toLocaleString()}</span>
                    </div>
                </div>

                {/* Interest Rate */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                        <span className="flex items-center gap-2">
                            <Percent className="h-4 w-4 text-blue-600" />
                            Norma e Interesit
                        </span>
                        <span className="text-blue-600 font-bold">{interestRate}%</span>
                    </div>
                    <input
                        type="range"
                        min="0.1"
                        max="15"
                        step="0.1"
                        value={interestRate}
                        onChange={(e) => setInterestRate(Number(e.target.value))}
                        className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                </div>

                {/* Loan Term */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm font-semibold text-gray-700">
                        <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-blue-600" />
                            Kohëzgjatja
                        </span>
                        <span className="text-blue-600 font-bold">{loanTerm} vite</span>
                    </div>
                    <select
                        value={loanTerm}
                        onChange={(e) => setLoanTerm(Number(e.target.value))}
                        className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {[5, 10, 15, 20, 25, 30].map((year) => (
                            <option key={year} value={year}>
                                {year} Vite
                            </option>
                        ))}
                    </select>
                </div>

                {/* Results */}
                <div className="pt-6 border-t border-gray-100 space-y-4">
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                        <p className="text-sm font-medium text-blue-700 mb-1">Kësti Mujor i Parashikuar</p>
                        <h4 className="text-3xl font-black text-blue-900">
                            €{Math.round(monthlyPayment).toLocaleString()}
                        </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Shuma e Kredisë</p>
                            <p className="text-sm font-bold text-gray-900">€{loanAmount.toLocaleString()}</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-lg text-center border border-gray-100">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-500 mb-1">Interesi Total</p>
                            <p className="text-sm font-bold text-gray-900">€{Math.round(totalInterest).toLocaleString()}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-2 text-[10px] text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <Info className="h-3 w-3 mt-0.5 text-blue-500 flex-shrink-0" />
                        <p className="italic">Ky kalkulim është vetëm për qëllime ilustruese. Kontaktoni një agjent për detaje specifike mbi kreditimin bankar në Shqipëri.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
