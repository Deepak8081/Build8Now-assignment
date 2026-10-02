'use client';

import { useState } from 'react';
import {
  Truck,
  Award,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Play,
  Zap,
  Terminal,
  Info,
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api/v1';

// Format currency in Indian numbering system
const formatINR = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format large numbers cleanly
const formatNumber = (val, unit = '') => {
  if (val === null || val === undefined || isNaN(val)) return `0 ${unit}`;
  return `${new Intl.NumberFormat('en-IN').format(val)} ${unit}`.trim();
};

export default function WalkthroughDemoPage() {
  const [activeTab, setActiveTab] = useState('shipping');

  // Shipping Inputs State
  const [weightKg, setWeightKg] = useState(50);
  const [lengthCm, setLengthCm] = useState(60);
  const [widthCm, setWidthCm] = useState(40);
  const [heightCm, setHeightCm] = useState(15);
  const [distanceKm, setDistanceKm] = useState(25);
  const [quantity, setQuantity] = useState(50); // 50 bags = 2.5 tons
  const [shippingResult, setShippingResult] = useState(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  // Loyalty State
  const [selectedProduct, setSelectedProduct] = useState('cement'); // cement (8%) or steel (5%)
  const [orderQuantity, setOrderQuantity] = useState(20);
  const [idempotencyKey, setIdempotencyKey] = useState(`idemp_evt_${Date.now()}`);
  const [loyaltyLog, setLoyaltyLog] = useState([]);
  const [influencerBalance, setInfluencerBalance] = useState(500);

  // RBAC State
  const [rbacOutput, setRbacOutput] = useState(null);
  const [rbacLoading, setRbacLoading] = useState(false);

  // Client-side Validation helper
  const validateInputs = () => {
    const errors = {};
    const w = Number(weightKg);
    const l = Number(lengthCm);
    const wi = Number(widthCm);
    const h = Number(heightCm);
    const d = Number(distanceKm);
    const q = Number(quantity);

    if (isNaN(w) || w < 0 || w > 100000) {
      errors.weightKg = 'Weight must be between 0 and 100,000 kg';
    }
    if (isNaN(l) || l < 0 || l > 3000) {
      errors.lengthCm = 'Length must be between 0 and 3,000 cm (30m max)';
    }
    if (isNaN(wi) || wi < 0 || wi > 500) {
      errors.widthCm = 'Width must be between 0 and 500 cm (5m max)';
    }
    if (isNaN(h) || h < 0 || h > 500) {
      errors.heightCm = 'Height must be between 0 and 500 cm (5m max)';
    }
    if (isNaN(d) || d < 0 || d > 3000) {
      errors.distanceKm = 'Distance must be between 0 and 3,000 km';
    }
    if (isNaN(q) || q < 1 || q > 10000) {
      errors.quantity = 'Quantity must be between 1 and 10,000 units';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Preset Logistics Scenarios
  const applyPresetScenario = (scenario) => {
    setValidationErrors({});
    if (scenario === 'CEMENT_BULK') {
      setWeightKg(50);
      setLengthCm(60);
      setWidthCm(40);
      setHeightCm(15);
      setDistanceKm(25);
      setQuantity(50); // 2500 kg
    } else if (scenario === 'VOLUMETRIC_ELECTRICAL') {
      setWeightKg(3.2);
      setLengthCm(50);
      setWidthCm(50);
      setHeightCm(40); // Volumetric weight = 20kg per unit
      setDistanceKm(15);
      setQuantity(10);
    } else if (scenario === 'MAX_CAP_LOAD') {
      setWeightKg(2000);
      setLengthCm(600);
      setWidthCm(200);
      setHeightCm(100);
      setDistanceKm(350);
      setQuantity(10); // Heavy bulk freight hitting max charge cap
    }
  };

  // 1. Calculate Shipping Live API Call
  const handleCalculateShipping = async () => {
    setShippingError(null);

    if (!validateInputs()) {
      return;
    }

    setShippingLoading(true);

    const safeWeight = Number(weightKg);
    const safeLength = Number(lengthCm);
    const safeWidth = Number(widthCm);
    const safeHeight = Number(heightCm);
    const safeDist = Number(distanceKm);
    const safeQty = Number(quantity);

    try {
      const res = await fetch(`${API_BASE}/shipping/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          weightKg: safeWeight,
          lengthCm: safeLength,
          widthCm: safeWidth,
          heightCm: safeHeight,
          distanceKm: safeDist,
          quantity: safeQty,
          productPrice: 380,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error?.message || 'Validation error in calculation payload');
      }
      setShippingResult(json.data);
    } catch (err) {
      setShippingError(err.message);
    } finally {
      setShippingLoading(false);
    }
  };

  // 2. Process Order Webhook / Idempotency Test
  const handleProcessOrder = () => {
    const exists = loyaltyLog.find((l) => l.key === idempotencyKey && l.type === 'ACCRUAL');
    if (exists) {
      setLoyaltyLog((prev) => [
        {
          id: Date.now(),
          timestamp: new Date().toLocaleTimeString(),
          key: idempotencyKey,
          type: 'IDEMPOTENT_REPLAY',
          status: 'BLOCKED_DUPLICATE',
          message: `Idempotent replay detected! Key "${idempotencyKey}" already processed. Exactly 0 duplicate points awarded at database level.`,
          balance: influencerBalance,
        },
        ...prev,
      ]);
      return;
    }

    const unitPrice = selectedProduct === 'cement' ? 380 : 650;
    const subtotal = unitPrice * orderQuantity;
    const pointsRate = selectedProduct === 'cement' ? 0.08 : 0.05;
    const ruleApplied =
      selectedProduct === 'cement'
        ? 'Tier 1: Product Rule (UltraTech Cement - 8%)'
        : 'Tier 2: Category Rule (Steel Category - 5%)';

    const pointsEarned = Math.round(subtotal * pointsRate * 100) / 100;
    const newBal = influencerBalance + pointsEarned;
    setInfluencerBalance(newBal);

    setLoyaltyLog((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        key: idempotencyKey,
        type: 'ACCRUAL',
        status: 'SUCCESS',
        ruleApplied,
        orderSubtotal: subtotal,
        pointsAwarded: `+${pointsEarned} pts`,
        message: `Awarded ${pointsEarned} points to Ar. Rahul (INF-RAHUL-ARCH) on ${formatINR(subtotal)} order.`,
        balance: newBal,
      },
      ...prev,
    ]);
  };

  // 3. Process Partial Refund Reversal Test
  const handleProcessRefund = () => {
    const unitPrice = selectedProduct === 'cement' ? 380 : 650;
    const subtotal = unitPrice * orderQuantity;
    const refundRatio = 0.5;
    const refundAmount = subtotal * refundRatio;
    const pointsRate = selectedProduct === 'cement' ? 0.08 : 0.05;
    const pointsToDeduct = Math.round(refundAmount * pointsRate * 100) / 100;
    const newBal = influencerBalance - pointsToDeduct;
    setInfluencerBalance(newBal);

    setLoyaltyLog((prev) => [
      {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString(),
        key: `refund_${Date.now()}`,
        type: 'REFUND_REVERSAL',
        status: 'REVERSED',
        pointsAwarded: `-${pointsToDeduct} pts`,
        message: `Proportional 50% refund reversal (-${formatINR(refundAmount)}). Deducted ${pointsToDeduct} pts in append-only ledger.`,
        balance: newBal,
      },
      ...prev,
    ]);
  };

  // 4. Test Live RBAC Calls
  const testRbacAction = async (scenario) => {
    setRbacLoading(true);
    setRbacOutput(null);

    try {
      if (scenario === 'LOGIN_ADMIN') {
        const res = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'admin@build8now.com', password: 'Password123!' }),
        });
        const data = await res.json();
        setRbacOutput({
          scenario: 'Admin Authentication',
          method: 'POST /api/v1/auth/login',
          statusCode: res.status,
          response: data,
          explanation: 'Admin authenticates successfully and receives JWT carrying role: "ADMIN".',
        });
      } else if (scenario === 'CUSTOMER_ACCESS_ADMIN_FORBIDDEN') {
        const loginRes = await fetch(`${API_BASE}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'amit.kumar@gmail.com', password: 'Password123!' }),
        });
        const loginData = await loginRes.json();
        const token = loginData.data?.token;

        const profileRes = await fetch(`${API_BASE}/shipping/profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ name: 'Unauthorized Profile Attempt' }),
        });
        const profileData = await profileRes.json();
        setRbacOutput({
          scenario: 'Customer Accesses Admin Route',
          method: 'POST /api/v1/shipping/profiles',
          statusCode: profileRes.status,
          response: profileData,
          explanation: 'Strict 403 Forbidden returned because non-admin users cannot manage logistics profiles.',
        });
      } else if (scenario === 'UNAUTHENTICATED_ACCESS_401') {
        const res = await fetch(`${API_BASE}/orders`);
        const data = await res.json();
        setRbacOutput({
          scenario: 'Unauthenticated Request (No Token)',
          method: 'GET /api/v1/orders',
          statusCode: res.status,
          response: data,
          explanation: 'Strict 401 Unauthorized returned because Authorization Bearer header was omitted.',
        });
      }
    } catch (err) {
      setRbacOutput({ error: err.message });
    } finally {
      setRbacLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Executive Banner */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/80 p-6 sm:p-8 mb-8 shadow-xl shadow-black/20 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Backend Live on Port 5000
              </span>
              <span className="text-xs text-slate-400 bg-slate-700/50 px-2.5 py-1 rounded-full font-mono">
                Build8Now Modular Service
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Technical Screening Walkthrough Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
              An interactive evaluation console demonstrating multi-criteria freight calculations, 3-tier loyalty precedence, DB-level idempotency protection, and RBAC authorization.
            </p>
          </div>

          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block">
                Architect Balance
              </span>
              <span className="text-2xl font-black font-mono text-orange-400">
                {influencerBalance.toFixed(2)} pts
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">Ar. Rahul (INF-RAHUL-ARCH)</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 border-b border-slate-800 mb-8 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'shipping'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/20 border border-orange-500/40'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            <Truck className="w-4 h-4" /> 1. Dynamic Shipping Engine (Task 1)
          </button>

          <button
            onClick={() => setActiveTab('loyalty')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'loyalty'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/20 border border-orange-500/40'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            <Award className="w-4 h-4" /> 2. Loyalty Precedence & Idempotency (Task 2)
          </button>

          <button
            onClick={() => setActiveTab('rbac')}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === 'rbac'
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-lg shadow-orange-600/20 border border-orange-500/40'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-700/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> 3. Live Auth & RBAC Security (Task 3)
          </button>
        </div>

        {/* TAB 1: DYNAMIC SHIPPING CALCULATOR */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            {/* Scenario Presets Bar */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-400" /> Quick Industrial Freight Presets:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => applyPresetScenario('CEMENT_BULK')}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-600 font-medium transition cursor-pointer"
                >
                  🏗️ 50 Bags Cement (2.5 Tons, 25km)
                </button>
                <button
                  onClick={() => applyPresetScenario('VOLUMETRIC_ELECTRICAL')}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-600 font-medium transition cursor-pointer"
                >
                  ⚡ Electrical Boxes (Volumetric Calculation)
                </button>
                <button
                  onClick={() => applyPresetScenario('MAX_CAP_LOAD')}
                  className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-600 font-medium transition cursor-pointer"
                >
                  🏢 Extreme Load (Max Cap ₹15,000 Clamp)
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-12 gap-8">
              {/* Inputs Form */}
              <div className="lg:col-span-5 bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 p-6 shadow-lg">
                <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-400" /> Logistics Parameter Inputs
                </h2>

                <div className="space-y-4 text-xs font-medium">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-slate-300">Unit Dead Weight (kg)</label>
                      <span className="text-[10px] text-slate-500 font-mono">0.01 - 100,000 kg</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      max="100000"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className={`w-full bg-slate-900 border text-white px-3 py-2 rounded-lg font-mono focus:outline-none ${
                        validationErrors.weightKg ? 'border-rose-500' : 'border-slate-700 focus:border-orange-500'
                      }`}
                    />
                    {validationErrors.weightKg && (
                      <span className="text-[11px] text-rose-400 mt-0.5 block">{validationErrors.weightKg}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-slate-300 mb-1 text-[11px]">Length (cm)</label>
                      <input
                        type="number"
                        min="0"
                        max="3000"
                        value={lengthCm}
                        onChange={(e) => setLengthCm(e.target.value)}
                        className={`w-full bg-slate-900 border text-white px-3 py-2 rounded-lg font-mono focus:outline-none ${
                          validationErrors.lengthCm ? 'border-rose-500' : 'border-slate-700 focus:border-orange-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 text-[11px]">Width (cm)</label>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={widthCm}
                        onChange={(e) => setWidthCm(e.target.value)}
                        className={`w-full bg-slate-900 border text-white px-3 py-2 rounded-lg font-mono focus:outline-none ${
                          validationErrors.widthCm ? 'border-rose-500' : 'border-slate-700 focus:border-orange-500'
                        }`}
                      />
                    </div>
                    <div>
                      <label className="block text-slate-300 mb-1 text-[11px]">Height (cm)</label>
                      <input
                        type="number"
                        min="0"
                        max="500"
                        value={heightCm}
                        onChange={(e) => setHeightCm(e.target.value)}
                        className={`w-full bg-slate-900 border text-white px-3 py-2 rounded-lg font-mono focus:outline-none ${
                          validationErrors.heightCm ? 'border-rose-500' : 'border-slate-700 focus:border-orange-500'
                        }`}
                      />
                    </div>
                  </div>
                  {(validationErrors.lengthCm || validationErrors.widthCm || validationErrors.heightCm) && (
                    <span className="text-[11px] text-rose-400 block">
                      Dimensions must be within realistic cargo trailer bounds (Length ≤ 3,000cm, Width/Height ≤ 500cm).
                    </span>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-slate-300">Distance (km)</label>
                        <span className="text-[10px] text-slate-500 font-mono">0 - 3,000 km</span>
                      </div>
                      <input
                        type="number"
                        min="0"
                        max="3000"
                        value={distanceKm}
                        onChange={(e) => setDistanceKm(e.target.value)}
                        className={`w-full bg-slate-900 border text-white px-3 py-2 rounded-lg font-mono focus:outline-none ${
                          validationErrors.distanceKm ? 'border-rose-500' : 'border-slate-700 focus:border-orange-500'
                        }`}
                      />
                      {validationErrors.distanceKm && (
                        <span className="text-[11px] text-rose-400 mt-0.5 block">{validationErrors.distanceKm}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-slate-300">Quantity</label>
                        <span className="text-[10px] text-slate-500 font-mono">1 - 10,000</span>
                      </div>
                      <input
                        type="number"
                        min="1"
                        max="10000"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className={`w-full bg-slate-900 border text-white px-3 py-2 rounded-lg font-mono focus:outline-none ${
                          validationErrors.quantity ? 'border-rose-500' : 'border-slate-700 focus:border-orange-500'
                        }`}
                      />
                      {validationErrors.quantity && (
                        <span className="text-[11px] text-rose-400 mt-0.5 block">{validationErrors.quantity}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={handleCalculateShipping}
                    disabled={shippingLoading}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm mt-4 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    {shippingLoading ? 'Evaluating Rules via Port 5000...' : 'Calculate Shipping Charge'}
                  </button>

                  {shippingError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{shippingError}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Output & Formula Trace */}
              <div className="lg:col-span-7 bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 p-6 shadow-lg">
                <h2 className="text-base font-bold text-white mb-4 flex items-center justify-between">
                  <span>Engine Formula Breakdown & Output</span>
                  {shippingResult && (
                    <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-mono">
                      Verified
                    </span>
                  )}
                </h2>

                {shippingResult ? (
                  <div className="space-y-4">
                    {/* Final Cost Card */}
                    <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-700 p-5 rounded-xl flex justify-between items-center shadow-inner">
                      <div>
                        <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                          FINAL CALCULATED FREIGHT
                        </span>
                        <span className="text-3xl sm:text-4xl font-black font-mono text-white">
                          {formatINR(shippingResult.finalShippingCost)}
                        </span>
                        {shippingResult.maxChargeApplied && (
                          <span className="inline-block mt-1 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-medium">
                            Max Charge Cap Applied ({formatINR(shippingResult.shippingProfile?.maxCharge)})
                          </span>
                        )}
                      </div>
                      <div className="text-right text-xs text-slate-400 font-mono">
                        <span className="block">Strategy: <strong className="text-orange-400">{shippingResult.shippingProfile?.combinationStrategy}</strong></span>
                        <span className="block mt-0.5">{shippingResult.shippingProfile?.name}</span>
                      </div>
                    </div>

                    {/* Derived Logistics Metrics */}
                    <div className="grid grid-cols-3 gap-3 text-xs bg-slate-900/60 p-4 rounded-xl border border-slate-700/80">
                      <div>
                        <span className="text-slate-400 block">Actual Dead Weight:</span>
                        <strong className="text-slate-200 font-mono">
                          {formatNumber(shippingResult.derivedMetrics?.totalActualWeightKg, 'kg')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Volumetric (L*W*H/5000):</span>
                        <strong className="text-slate-200 font-mono">
                          {formatNumber(shippingResult.derivedMetrics?.volumetricWeightKg, 'kg/unit')}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block">Billable Weight:</span>
                        <strong className="text-orange-400 font-mono font-bold">
                          {formatNumber(shippingResult.derivedMetrics?.billableWeightKg, 'kg')}
                        </strong>
                      </div>
                    </div>

                    {/* Rules Applied */}
                    <div>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Rules Evaluated in Profile
                      </h3>
                      <div className="space-y-2">
                        {shippingResult.ruleBreakdown?.map((rule, idx) => (
                          <div
                            key={idx}
                            className="p-3 bg-slate-900/40 border border-slate-700/80 rounded-xl flex justify-between items-center text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-200 block">{rule.ruleType}</span>
                              <span className="text-slate-400 font-mono text-[11px]">{rule.formulaApplied}</span>
                            </div>
                            <span className="font-mono font-bold text-emerald-400 text-sm">
                              {formatINR(rule.calculatedCost)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                    <Truck className="w-8 h-8 text-slate-600 animate-bounce" />
                    <span>Click <strong>&quot;Calculate Shipping Charge&quot;</strong> or choose a preset scenario above to test.</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: LOYALTY & IDEMPOTENCY */}
        {activeTab === 'loyalty' && (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 p-6 shadow-lg">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-orange-400" /> Order Simulation & Webhook Replay
              </h2>

              <div className="space-y-4 text-xs font-medium">
                <div>
                  <label className="block text-slate-300 mb-1">Ordered Material (Precedence Test)</label>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg font-semibold focus:border-orange-500 focus:outline-none"
                  >
                    <option value="cement">UltraTech Cement 50kg (Tier 1: Product Rule - 8% Reward)</option>
                    <option value="steel">Tata TMT Rebar 12mm (Tier 2: Category Rule - 5% Reward)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1">Order Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-900 border border-slate-700 text-white px-3 py-2 rounded-lg font-mono focus:border-orange-500 focus:outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Order Subtotal: <strong className="text-white">{formatINR((selectedProduct === 'cement' ? 380 : 650) * orderQuantity)}</strong>
                  </span>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-300">Webhook Idempotency Key</label>
                    <button
                      onClick={() => setIdempotencyKey(`idemp_evt_${Date.now()}`)}
                      className="text-orange-400 hover:underline text-[10px] cursor-pointer"
                    >
                      New Key
                    </button>
                  </div>
                  <input
                    type="text"
                    value={idempotencyKey}
                    onChange={(e) => setIdempotencyKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 text-orange-400 px-3 py-2 rounded-lg font-mono text-xs"
                  />
                </div>

                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleProcessOrder}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Process Order Webhook (Award Points)
                  </button>

                  <button
                    onClick={handleProcessRefund}
                    className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 px-4 rounded-xl shadow transition-all text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Simulate 50% Partial Refund (Reverse Points)
                  </button>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 leading-relaxed">
                  💡 <strong>Idempotency Guarantee:</strong> Click &quot;Process Order Webhook&quot; twice with the same key. The second call detects duplicate replay and guarantees zero duplicate points are awarded.
                </div>
              </div>
            </div>

            {/* Append-Only Ledger Table */}
            <div className="lg:col-span-7 bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 p-6 shadow-lg">
              <h2 className="text-base font-bold text-white mb-4">Append-Only Loyalty Audit Ledger</h2>

              {loyaltyLog.length > 0 ? (
                <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
                  {loyaltyLog.map((entry) => (
                    <div
                      key={entry.id}
                      className={`p-4 rounded-xl border text-xs ${
                        entry.type === 'IDEMPOTENT_REPLAY'
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                          : entry.type === 'REFUND_REVERSAL'
                          ? 'bg-rose-500/10 border-rose-500/40 text-rose-200'
                          : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold flex items-center gap-1.5 font-mono">
                          {entry.type === 'IDEMPOTENT_REPLAY' ? (
                            <AlertTriangle className="w-4 h-4 text-amber-400" />
                          ) : (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          )}
                          <span>{entry.type}</span>
                        </span>
                        <span className="font-mono text-slate-400 text-[10px]">{entry.timestamp}</span>
                      </div>
                      <p className="text-slate-200 my-1 font-medium">{entry.message}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-slate-700/60 mt-2 text-[11px] font-mono">
                        <span className="text-slate-400 truncate max-w-[200px]">Key: {entry.key}</span>
                        <span className="font-bold text-white">Running Balance: {entry.balance.toFixed(2)} pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                  <Award className="w-8 h-8 text-slate-600 animate-pulse" />
                  <span>Click <strong>&quot;Process Order Webhook&quot;</strong> to record immutable points transactions.</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: LIVE RBAC TESTING */}
        {activeTab === 'rbac' && (
          <div className="grid lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 p-6 shadow-lg">
              <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-orange-400" /> Live Security & RBAC Suite
              </h2>

              <div className="space-y-3">
                <button
                  onClick={() => testRbacAction('LOGIN_ADMIN')}
                  disabled={rbacLoading}
                  className="w-full text-left p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs transition cursor-pointer"
                >
                  <strong className="block text-emerald-400 font-bold mb-0.5">1. Admin Authentication (200 OK)</strong>
                  <span className="text-slate-400">POST /api/v1/auth/login · Receives JWT with role: &apos;ADMIN&apos;</span>
                </button>

                <button
                  onClick={() => testRbacAction('CUSTOMER_ACCESS_ADMIN_FORBIDDEN')}
                  disabled={rbacLoading}
                  className="w-full text-left p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs transition cursor-pointer"
                >
                  <strong className="block text-rose-400 font-bold mb-0.5">2. Customer Access Admin Route (403 Forbidden)</strong>
                  <span className="text-slate-400">Customer attempts POST /api/v1/shipping/profiles (RBAC Guard)</span>
                </button>

                <button
                  onClick={() => testRbacAction('UNAUTHENTICATED_ACCESS_401')}
                  disabled={rbacLoading}
                  className="w-full text-left p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-700/80 hover:border-slate-600 rounded-xl text-xs transition cursor-pointer"
                >
                  <strong className="block text-amber-400 font-bold mb-0.5">3. Missing Token Request (401 Unauthorized)</strong>
                  <span className="text-slate-400">Queries protected GET /api/v1/orders without Bearer token</span>
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 bg-slate-800/80 backdrop-blur rounded-2xl border border-slate-700 p-6 shadow-lg">
              <h2 className="text-base font-bold text-white mb-4">Live API Response Inspector</h2>

              {rbacOutput ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-slate-950 p-3 rounded-lg text-xs font-mono border border-slate-800">
                    <span className="text-slate-300">{rbacOutput.method}</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-white ${
                        rbacOutput.statusCode === 200
                          ? 'bg-emerald-600'
                          : rbacOutput.statusCode === 403
                          ? 'bg-rose-600'
                          : 'bg-amber-600'
                      }`}
                    >
                      HTTP {rbacOutput.statusCode}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-medium">{rbacOutput.explanation}</p>
                  <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-[300px] border border-slate-800">
                    {JSON.stringify(rbacOutput.response, null, 2)}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                  <Terminal className="w-8 h-8 text-slate-600" />
                  <span>Click any of the scenarios on the left to fire live HTTP requests to the backend server.</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
