'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FiShield,
  FiTruck,
  FiUser,
  FiLock,
  FiMail,
  FiCheckCircle,
  FiAlertTriangle,
  FiCopy,
  FiCheck,
  FiLogOut,
  FiPlusCircle,
  FiBox,
  FiLayers,
  FiRefreshCw,
  FiArrowRight,
  FiExternalLink,
  FiDollarSign,
  FiPercent,
  FiActivity,
  FiTrash2,
  FiEdit2,
  FiLink,
  FiRotateCcw,
  FiZap,
  FiX,
} from 'react-icons/fi';
import {
  FaUserShield,
  FaHelmetSafety,
  FaCompassDrafting,
  FaCartShopping,
  FaAward,
  FaBoxesStacked,
  FaBuilding,
  FaSquarePlus,
} from 'react-icons/fa6';
import { HiOutlineBuildingOffice2 } from 'react-icons/hi2';

const API_BASE = 'http://localhost:5000/api/v1';

const PRESET_ACCOUNTS = [
  {
    role: 'ADMIN',
    label: 'Super Admin',
    email: 'admin@build8now.com',
    password: 'Password123!',
    desc: 'Full administrative control: Shipping profiles, loyalty rules & user provisioning',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    icon: FaUserShield,
  },
  {
    role: 'INFLUENCER',
    type: 'ARCHITECT',
    label: 'Ar. Rahul (Architect)',
    email: 'rahul.architect@build8now.com',
    password: 'Password123!',
    code: 'INF-RAHUL-MAIN',
    desc: 'Influencer partner: Earns 8% loyalty rewards on referred customer orders',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    icon: FaCompassDrafting,
  },
  {
    role: 'INFLUENCER',
    type: 'CONTRACTOR',
    label: 'Vikram (Contractor)',
    email: 'contractor.vikram@build8now.com',
    password: 'Password123!',
    code: 'INF-VIKRAM-CONT',
    desc: 'Influencer partner: Manages construction client referrals & bulk slabs',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    icon: FaHelmetSafety,
  },
  {
    role: 'CUSTOMER',
    label: 'Priya Sharma (Customer)',
    email: 'priya.sharma@gmail.com',
    password: 'Password123!',
    desc: 'Procures building materials; referred by Ar. Rahul',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    icon: FaCartShopping,
  },
];

export default function RootEnterprisePortal() {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [authTab, setAuthTab] = useState('login'); // 'login' | 'register'
  const [copiedCode, setCopiedCode] = useState(false);

  // Inline form-specific error (shown inside the auth card)
  const [formError, setFormError] = useState('');
  // Auth-required toast (shown when unauthenticated user clicks a protected link)
  const [authRequiredMsg, setAuthRequiredMsg] = useState('');

  // Auto-dismiss success toast after 4 seconds
  useEffect(() => {
    if (!successMsg) return;
    const timer = setTimeout(() => {
      setSuccessMsg('');
    }, 4000);
    return () => clearTimeout(timer);
  }, [successMsg]);

  // Auto-dismiss global error toast after 5 seconds
  useEffect(() => {
    if (!errorMsg) return;
    const timer = setTimeout(() => {
      setErrorMsg('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [errorMsg]);

  // Auto-dismiss inline form error after 6 seconds
  useEffect(() => {
    if (!formError) return;
    const timer = setTimeout(() => {
      setFormError('');
    }, 6000);
    return () => clearTimeout(timer);
  }, [formError]);

  // Auto-dismiss auth-required notice after 5 seconds
  useEffect(() => {
    if (!authRequiredMsg) return;
    const timer = setTimeout(() => {
      setAuthRequiredMsg('');
    }, 5000);
    return () => clearTimeout(timer);
  }, [authRequiredMsg]);

  // Admin Active Tab
  const [adminTab, setAdminTab] = useState('shipping'); // 'shipping' | 'influencers' | 'loyalty' | 'orders' | 'assign'

  // Admin: Shipping Profile Edit (UPDATE)
  const [editingProfile, setEditingProfile] = useState(null); // profile object being edited
  const [editProfileName, setEditProfileName] = useState('');
  const [editProfileStrategy, setEditProfileStrategy] = useState('SUM');
  const [editProfileMinCharge, setEditProfileMinCharge] = useState('');
  const [editProfileMaxCharge, setEditProfileMaxCharge] = useState('');

  // Login Form
  const [loginEmail, setLoginEmail] = useState('admin@build8now.com');
  const [loginPassword, setLoginPassword] = useState('Password123!');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('CUSTOMER');
  const [regInfluencerType, setRegInfluencerType] = useState('ARCHITECT');
  const [regCustomCode, setRegCustomCode] = useState('');
  const [regReferralCode, setRegReferralCode] = useState('INF-RAHUL-MAIN');
  const [regPhone, setRegPhone] = useState('');

  // Admin Provision Influencer Form
  const [newInfName, setNewInfName] = useState('');
  const [newInfEmail, setNewInfEmail] = useState('');
  const [newInfPassword, setNewInfPassword] = useState('Password@123');
  const [newInfType, setNewInfType] = useState('ARCHITECT');
  const [newInfCode, setNewInfCode] = useState('');

  // Admin Create Shipping Profile Form + Rules
  const [newProfileName, setNewProfileName] = useState('');
  const [newProfileStrategy, setNewProfileStrategy] = useState('SUM');
  const [newProfileMinCharge, setNewProfileMinCharge] = useState(100);
  const [newProfileMaxCharge, setNewProfileMaxCharge] = useState(25000);
  const [newRuleType, setNewRuleType] = useState('WEIGHT_SLAB');
  const [newRuleMinUnit, setNewRuleMinUnit] = useState(0);
  const [newRuleMaxUnit, setNewRuleMaxUnit] = useState(50);
  const [newRuleBaseRate, setNewRuleBaseRate] = useState(50);
  const [newRulePerUnitRate, setNewRulePerUnitRate] = useState(2);

  // Admin Create Loyalty Rule Form
  const [newLoyaltyName, setNewLoyaltyName] = useState('');
  const [newLoyaltyTier, setNewLoyaltyTier] = useState('PRODUCT');
  const [newLoyaltyTargetId, setNewLoyaltyTargetId] = useState('prod-cement-1');
  const [newLoyaltyPercentage, setNewLoyaltyPercentage] = useState(8);
  const [newLoyaltyPrecedence, setNewLoyaltyPrecedence] = useState(30);

  // Admin Assign Product Form
  const [assignProductId, setAssignProductId] = useState('');
  const [assignProfileId, setAssignProfileId] = useState('');

  // Admin Refund Simulator
  const [refundOrderId, setRefundOrderId] = useState('');
  const [refundAmount, setRefundAmount] = useState(1000);

  // Data Stores
  const [shippingProfiles, setShippingProfiles] = useState([]);
  const [influencersList, setInfluencersList] = useState([]);
  const [loyaltyRules, setLoyaltyRules] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [productsList, setProductsList] = useState([]);
  const [myLedger, setMyLedger] = useState([]);
  const [myInfluencerData, setMyInfluencerData] = useState(null);

  // Customer Shipping Calculator
  const [calcWeight, setCalcWeight] = useState(50);
  const [calcLength, setCalcLength] = useState(60);
  const [calcWidth, setCalcWidth] = useState(40);
  const [calcHeight, setCalcHeight] = useState(15);
  const [calcDistance, setCalcDistance] = useState(25);
  const [calcQuantity, setCalcQuantity] = useState(10);
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  // Security Matrix Inspector
  const [securityOutput, setSecurityOutput] = useState(null);
  const [securityLoading, setSecurityLoading] = useState(false);

  // Check saved session and protected route notice on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('notice') === 'protected_route') {
          setAuthRequiredMsg('🔒 Authentication Required: You attempted to access a protected workspace. Please sign in below with your role credentials (Admin, Influencer, or Customer).');
        }
      }
      const savedToken = localStorage.getItem('build8now_token');
      const savedUser = localStorage.getItem('build8now_user');
      if (savedToken && savedUser) {
        setToken(savedToken);
        const parsed = JSON.parse(savedUser);
        setCurrentUser(parsed);
        loadDashboardData(savedToken, parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLogin = async (email, password) => {
    setLoading(true);
    setErrorMsg('');
    setFormError('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const d = await res.json();
      if (!res.ok) {
        const msg = d.error?.message === 'Invalid email or password'
          ? 'Invalid email or password. Please verify your credentials and try again.'
          : (d.error?.message || 'Authentication failed. Please verify your email and password.');
        throw new Error(msg);
      }

      setToken(d.data.token);
      setCurrentUser(d.data.user);
      localStorage.setItem('build8now_token', d.data.token);
      localStorage.setItem('build8now_user', JSON.stringify(d.data.user));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('build8now_auth_change'));
      }
      setSuccessMsg(`Welcome back, ${d.data.user.name} (${d.data.user.role})`);
      setAuthRequiredMsg('');
      setFormError('');
      loadDashboardData(d.data.token, d.data.user);
    } catch (err) {
      setFormError(err.message);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setFormError('');
    setSuccessMsg('');
    try {
      const nameRegex = /^[a-zA-Z\s\.\-']+$/;
      if (!nameRegex.test(regName.trim())) {
        throw new Error(
          'Customer name can only contain alphabetic letters, spaces, dots, and hyphens (numbers and digits are strictly disallowed).'
        );
      }

      const payload = {
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        role: regRole,
      };

      if (regRole === 'INFLUENCER') {
        payload.influencerType = regInfluencerType;
        if (regCustomCode.trim()) payload.customReferralCode = regCustomCode.trim().toUpperCase();
      } else if (regRole === 'CUSTOMER') {
        if (regPhone.trim()) payload.phone = regPhone.trim();
        if (regReferralCode.trim()) payload.referralCode = regReferralCode.trim().toUpperCase();
      }

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) {
        let msg = d.error?.message || 'Registration failed';
        if (d.error?.details && Array.isArray(d.error.details) && d.error.details.length > 0) {
          msg = d.error.details.map((item) => item.message).join(' | ');
        }
        throw new Error(msg);
      }

      setToken(d.data.token);
      setCurrentUser(d.data.user);
      localStorage.setItem('build8now_token', d.data.token);
      localStorage.setItem('build8now_user', JSON.stringify(d.data.user));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('build8now_auth_change'));
      }
      setSuccessMsg(`Account created! Logged in as ${d.data.user.role}`);
      setAuthRequiredMsg('');
      setFormError('');
      loadDashboardData(d.data.token, d.data.user);
    } catch (err) {
      setFormError(err.message);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken('');
    setShippingProfiles([]);
    setInfluencersList([]);
    setLoyaltyRules([]);
    setAllOrders([]);
    setProductsList([]);
    setMyLedger([]);
    setMyInfluencerData(null);
    setSecurityOutput(null);
    localStorage.removeItem('build8now_token');
    localStorage.removeItem('build8now_user');
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('build8now_auth_change'));
    }
    setSuccessMsg('Signed out successfully.');
  };

  const loadDashboardData = async (authToken, user) => {
    if (!authToken || !user) return;

    if (user.role === 'ADMIN') {
      try {
        const [profRes, infRes, rulesRes, ordersRes, prodRes] = await Promise.all([
          fetch(`${API_BASE}/shipping/profiles`, { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch(`${API_BASE}/influencers`, { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch(`${API_BASE}/loyalty/rules`, { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch(`${API_BASE}/orders`, { headers: { Authorization: `Bearer ${authToken}` } }),
          fetch(`${API_BASE}/products`),
        ]);

        const [profData, infData, rulesData, ordersData, prodData] = await Promise.all([
          profRes.json(),
          infRes.json(),
          rulesRes.json(),
          ordersRes.json(),
          prodRes.json(),
        ]);

        // All APIs return data as a direct array (not wrapped in {items:[]})
        if (profData.success) {
          const profiles = Array.isArray(profData.data) ? profData.data : [];
          setShippingProfiles(profiles);
          if (profiles.length > 0) setAssignProfileId(profiles[0].id);
        }
        if (infData.success) setInfluencersList(Array.isArray(infData.data) ? infData.data : []);
        if (rulesData.success) setLoyaltyRules(Array.isArray(rulesData.data) ? rulesData.data : []);
        if (ordersData.success) {
          const orders = Array.isArray(ordersData.data) ? ordersData.data : [];
          setAllOrders(orders);
          if (orders.length > 0) setRefundOrderId(orders[0].id);
        }
        if (prodData.success) {
          const products = Array.isArray(prodData.data) ? prodData.data : [];
          setProductsList(products);
          if (products.length > 0) setAssignProductId(products[0].id);
        }
      } catch {
        // ignore
      }
    } else if (user.role === 'INFLUENCER' && user.influencer?.id) {
      try {
        const [infRes, ledgerRes] = await Promise.all([
          fetch(`${API_BASE}/influencers/${user.influencer.id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          fetch(`${API_BASE}/loyalty/ledger/${user.influencer.id}`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
        ]);

        const [infData, ledgerData] = await Promise.all([infRes.json(), ledgerRes.json()]);
        if (infData.success) setMyInfluencerData(infData.data);
        // Ledger also returns data as a direct array
        if (ledgerData.success) setMyLedger(Array.isArray(ledgerData.data) ? ledgerData.data : []);
      } catch {
        // ignore
      }
    } else if (user.role === 'CUSTOMER') {
      try {
        const [ordersRes, prodRes] = await Promise.all([
          fetch(`${API_BASE}/orders`, {
            headers: { Authorization: `Bearer ${authToken}` },
          }),
          fetch(`${API_BASE}/products`),
        ]);
        const [ordersData, prodData] = await Promise.all([ordersRes.json(), prodRes.json()]);
        if (ordersData.success) setAllOrders(Array.isArray(ordersData.data) ? ordersData.data : []);
        // Load products so the freight calculator can use a real product UUID
        if (prodData.success) {
          const products = Array.isArray(prodData.data) ? prodData.data : [];
          setProductsList(products);
        }
      } catch {
        // ignore
      }
    }
  };


  // 1. Admin CRUD: Create Shipping Profile with Rules
  const handleCreateShippingProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/shipping/profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newProfileName,
          combinationStrategy: newProfileStrategy,
          minCharge: Number(newProfileMinCharge),
          maxCharge: Number(newProfileMaxCharge),
          rules: [
            {
              ruleType: newRuleType,
              minUnit: Number(newRuleMinUnit),
              maxUnit: Number(newRuleMaxUnit),
              baseRate: Number(newRuleBaseRate),
              perUnitRate: Number(newRulePerUnitRate),
              isActive: true,
            },
          ],
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message || 'Failed to create profile');

      setSuccessMsg(`Shipping Profile '${newProfileName}' created with rule successfully!`);
      setNewProfileName('');
      loadDashboardData(token, currentUser);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2. Admin CRUD: Deactivate Shipping Profile
  const handleDeactivateProfile = async (id, name) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/shipping/profiles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message || 'Failed to deactivate profile');

      setSuccessMsg(`Shipping profile '${name}' deactivated successfully.`);
      loadDashboardData(token, currentUser);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 2b. Admin CRUD: Update Shipping Profile (PUT /shipping/profiles/:id)
  const handleUpdateShippingProfile = async (e) => {
    e.preventDefault();
    if (!editingProfile) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const payload = {
        name: editProfileName.trim(),
        combinationStrategy: editProfileStrategy,
      };
      if (editProfileMinCharge !== '' && editProfileMinCharge !== null) {
        payload.minCharge = Number(editProfileMinCharge);
      }
      if (editProfileMaxCharge !== '' && editProfileMaxCharge !== null) {
        payload.maxCharge = Number(editProfileMaxCharge);
      }

      const res = await fetch(`${API_BASE}/shipping/profiles/${editingProfile.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message || 'Failed to update shipping profile');

      setSuccessMsg(`Shipping Profile '${editProfileName}' updated successfully (PUT /api/v1/shipping/profiles/${editingProfile.id.substring(0, 8)}...)!`);
      setEditingProfile(null);
      loadDashboardData(token, currentUser);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 3. Admin CRUD: Assign Profile to Product
  const handleAssignProfileToProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/shipping/assign-product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: assignProductId,
          shippingProfileId: assignProfileId,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message || 'Failed to assign profile to product');

      setSuccessMsg('Shipping Profile successfully assigned to product!');
      loadDashboardData(token, currentUser);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Admin CRUD: Create Loyalty Rule
  const handleCreateLoyaltyRule = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/loyalty/rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newLoyaltyName,
          tierLevel: newLoyaltyTier,
          targetId: newLoyaltyTier === 'PRODUCT' ? newLoyaltyTargetId : undefined,
          pointPercentage: Number(newLoyaltyPercentage),
          precedence: Number(newLoyaltyPrecedence),
          isActive: true,
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message || 'Failed to create loyalty rule');

      setSuccessMsg(`Loyalty Rule '${newLoyaltyName}' created successfully!`);
      setNewLoyaltyName('');
      loadDashboardData(token, currentUser);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. Admin CRUD: Deactivate Loyalty Rule
  const handleDeactivateLoyaltyRule = async (id, name) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/loyalty/rules/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message || 'Failed to deactivate loyalty rule');

      setSuccessMsg(`Loyalty Rule '${name}' deactivated successfully.`);
      loadDashboardData(token, currentUser);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 6. Admin Action: Provision Influencer
  const handleAdminCreateInfluencer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const nameRegex = /^[a-zA-Z\s\.\-']+$/;
      if (!nameRegex.test(newInfName.trim())) {
        throw new Error(
          'Influencer partner name can only contain alphabetic letters, spaces, dots, and hyphens (numbers and digits are strictly disallowed).'
        );
      }

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newInfName.trim(),
          email: newInfEmail.trim(),
          password: newInfPassword,
          role: 'INFLUENCER',
          influencerType: newInfType,
          customReferralCode: newInfCode.trim() ? newInfCode.trim().toUpperCase() : undefined,
        }),
      });
      const d = await res.json();
      if (!res.ok) {
        throw new Error(d.error?.message || 'Failed to provision influencer');
      }

      setSuccessMsg(`Influencer '${newInfName}' provisioned with Code '${d.data.user.influencer?.referralCode}'!`);
      setNewInfName('');
      setNewInfEmail('');
      setNewInfCode('');
      loadDashboardData(token, currentUser);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 7. Admin Action: Trigger Partial Refund / Points Reversal
  const handleTriggerRefund = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await fetch(`${API_BASE}/loyalty/process-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: refundOrderId,
          refundAmount: Number(refundAmount),
          reason: 'Customer initiated construction quantity reduction',
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message || 'Refund processing failed');

      setSuccessMsg(
        `Refund of ₹${refundAmount} processed! Reversed ${d.data.pointsDeducted} points proportionally. New balance: ${d.data.newBalance} pts.`
      );
      loadDashboardData(token, currentUser);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Shipping Calculation API Call
  const handleCalculateShipping = async () => {
    setCalcLoading(true);
    setCalcResult(null);
    try {
      // Use the UltraTech Cement product if available, otherwise first product
      const cementProduct = productsList.find((p) => p.slug === 'ultratech-super-cement-50kg') || productsList[0];
      if (!cementProduct) {
        setErrorMsg('No products found. Please ensure the backend is running and seeded.');
        return;
      }
      const res = await fetch(`${API_BASE}/shipping/calculate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: cementProduct.id,
          weightKg: Number(calcWeight),
          lengthCm: Number(calcLength),
          widthCm: Number(calcWidth),
          heightCm: Number(calcHeight),
          distanceKm: Number(calcDistance),
          quantity: Number(calcQuantity),
        }),
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error?.message || 'Calculation error');
      setCalcResult(d.data);
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setCalcLoading(false);
    }
  };


  // Run RBAC Security Guard Test
  const runSecurityTest = async (testCase) => {
    setSecurityLoading(true);
    setSecurityOutput(null);
    try {
      let headers = { 'Content-Type': 'application/json' };
      if (testCase.withToken) {
        headers['Authorization'] = `Bearer ${token || 'unauthenticated'}`;
      }

      const res = await fetch(`${API_BASE}${testCase.endpoint}`, {
        method: testCase.method,
        headers,
        body: testCase.body ? JSON.stringify(testCase.body) : undefined,
      });

      const d = await res.json();
      setSecurityOutput({
        title: testCase.title,
        status: res.status,
        statusText: res.statusText,
        expected: testCase.expected,
        explanation: testCase.explanation,
        data: d,
      });
    } catch (err) {
      setSecurityOutput({
        title: testCase.title,
        status: 500,
        statusText: 'Network Error',
        explanation: 'Backend server is offline or unreachable on Port 5000',
        data: { error: err.message },
      });
    } finally {
      setSecurityLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#0a0e17] text-slate-100 ${
        !currentUser
          ? 'flex flex-col items-center justify-center py-12 px-4 sm:px-6'
          : 'py-8 px-4 sm:px-6 lg:px-8'
      }`}
    >
      <div className={!currentUser ? 'w-full max-w-xl mx-auto' : 'max-w-7xl mx-auto space-y-8'}>
        {/* ------------------------------------------------------------- */}
        {/* 1. UNAUTHENTICATED STATE: SIGN IN & REGISTRATION PORTAL       */}
        {/* ------------------------------------------------------------- */}
        {!currentUser ? (
          <div className="w-full space-y-6">
            {/* Header Hero */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
                <FiShield className="w-3.5 h-3.5" /> Enterprise RBAC Authentication
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                {authTab === 'login' ? 'Sign In to Build8Now' : 'Create Build8Now Account'}
              </h1>
              <p className="text-slate-400 text-xs sm:text-sm">
                {authTab === 'login'
                  ? 'Access your role-specific dashboard for logistics, partner rewards, or procurement'
                  : 'Register a new Customer or Influencer Partner profile'}
              </p>
            </div>

            {/* Main Auth Card */}
            <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
              {/* Protected Route Banner if navigated without token */}
              {authRequiredMsg && (
                <div className="p-4 rounded-2xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-200 text-xs sm:text-sm flex items-start gap-3 shadow-lg">
                  <FiLock className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold text-amber-300 block mb-0.5">Authentication Required</span>
                    <span className="text-xs text-amber-200/90 leading-relaxed block">{authRequiredMsg}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAuthRequiredMsg('')}
                    className="text-xs font-mono text-amber-400 hover:text-white px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 transition shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Form-specific Inline Error Alert (High-visibility, right above form inputs) */}
              {formError && (
                <div className="p-4 rounded-2xl bg-rose-500/15 border-2 border-rose-500/40 text-rose-200 text-xs sm:text-sm flex items-start gap-3 shadow-xl backdrop-blur-md">
                  <FiAlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-bold text-rose-300 block mb-0.5">
                      {authTab === 'login' ? 'Invalid Credentials' : 'Input Validation Error'}
                    </span>
                    <span className="text-xs text-rose-200/95 leading-relaxed block font-medium">{formError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFormError('');
                      setErrorMsg('');
                    }}
                    className="text-xs font-mono text-rose-400 hover:text-white px-2 py-0.5 rounded bg-rose-500/20 hover:bg-rose-500/30 transition shrink-0"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* 1-Click Quick Demo Role Fill Bar */}
              {authTab === 'login' && (
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FiZap className="w-3.5 h-3.5 text-orange-400" />
                      1-Click Test Accounts
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Instant Sign In</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {PRESET_ACCOUNTS.map((acc, idx) => {
                      const Icon = acc.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setLoginEmail(acc.email);
                            setLoginPassword(acc.password);
                            handleLogin(acc.email, acc.password);
                          }}
                          disabled={loading}
                          className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-orange-500/50 text-left transition flex flex-col justify-between group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-white text-[11px] group-hover:text-orange-400 truncate">
                              {acc.label.split(' ')[0]}
                            </span>
                            <Icon className="w-3 h-3 text-slate-500 group-hover:text-orange-400 shrink-0" />
                          </div>
                          <span className="text-[9px] text-slate-400 font-mono mt-1 truncate">
                            {acc.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab Navigation (Sign In / Register) */}
              <div className="flex border-b border-slate-800 pb-3 gap-6">
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('login');
                    setFormError('');
                    setErrorMsg('');
                  }}
                  className={`pb-2 text-sm font-bold transition-all relative ${
                    authTab === 'login' ? 'text-orange-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In With Credentials
                  {authTab === 'login' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"></div>}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthTab('register');
                    setFormError('');
                    setErrorMsg('');
                  }}
                  className={`pb-2 text-sm font-bold transition-all relative ${
                    authTab === 'register' ? 'text-orange-400' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Register New Account
                  {authTab === 'register' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"></div>
                  )}
                </button>
              </div>

              {/* Login Form */}
              {authTab === 'login' ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLogin(loginEmail, loginPassword);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                    <div className="relative">
                      <FiMail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                        placeholder="admin@build8now.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                    <div className="relative">
                      <FiLock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiLock className="w-4 h-4" />}
                    Sign In to Portal
                  </button>

                  <div className="pt-2 text-center border-t border-slate-800/80">
                    <p className="text-xs text-slate-400">
                      Don&apos;t have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('register');
                          setFormError('');
                          setErrorMsg('');
                        }}
                        className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2"
                      >
                        Register New Account
                      </button>
                    </p>
                  </div>
                </form>
              ) : (
                /* Registration Form with Simple Role Selection */
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                        placeholder="e.g. Deepak Sharma"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">Letters, dots & hyphens only</span>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                        placeholder="deepak@build8now.com"
                      />
                      <span className="text-[10px] text-slate-500 mt-1 block">Authentic domain with MX records</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
                    <input
                      type="password"
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500"
                      placeholder="Min 6 characters"
                    />
                  </div>

                  {/* Simple Role Selector (Customer & Influencer) */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-2">Select Account Role</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRegRole('CUSTOMER')}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                          regRole === 'CUSTOMER'
                            ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <FaCartShopping className="w-4 h-4 text-emerald-400" />
                        <span>Customer (Buyer)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegRole('INFLUENCER')}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                          regRole === 'INFLUENCER'
                            ? 'bg-blue-500/15 border-blue-500/50 text-blue-300 shadow-sm'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <FaCompassDrafting className="w-4 h-4 text-blue-400" />
                        <span>Influencer Partner</span>
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2 italic text-center">
                      * Super Admin access is pre-seeded in the database. Use Quick Login on the Sign In tab.
                    </p>
                  </div>

                  {/* Influencer Specific Fields */}
                  {regRole === 'INFLUENCER' && (
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider block">
                        Influencer Partner Configuration
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Partner Type</label>
                          <select
                            value={regInfluencerType}
                            onChange={(e) => setRegInfluencerType(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            <option value="ARCHITECT">Architect</option>
                            <option value="CONTRACTOR">Contractor</option>
                            <option value="INTERIOR_DESIGNER">Interior Designer</option>
                            <option value="BUILDER">Builder</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Custom Referral Code</label>
                          <input
                            type="text"
                            value={regCustomCode}
                            onChange={(e) => setRegCustomCode(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono"
                            placeholder="INF-DEEPAK-ARCH"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Customer Specific Fields */}
                  {regRole === 'CUSTOMER' && (
                    <div className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                        Customer Referral Code Linking (Optional)
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Referred By Code</label>
                          <input
                            type="text"
                            value={regReferralCode}
                            onChange={(e) => setRegReferralCode(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono"
                            placeholder="INF-RAHUL-MAIN"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-slate-400 mb-1">Phone Number</label>
                          <input
                            type="text"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            placeholder="+91 9876543210"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-sm"
                  >
                    {loading ? <FiRefreshCw className="w-4 h-4 animate-spin" /> : <FiPlusCircle className="w-4 h-4" />}
                    Create Account & Sign In
                  </button>

                  <div className="pt-2 text-center border-t border-slate-800/80">
                    <p className="text-xs text-slate-400">
                      Already have an account?{' '}
                      <button
                        type="button"
                        onClick={() => {
                          setAuthTab('login');
                          setFormError('');
                          setErrorMsg('');
                        }}
                        className="text-orange-400 hover:text-orange-300 font-semibold underline underline-offset-2"
                      >
                        Sign In
                      </button>
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* ------------------------------------------------------------- */
          /* 2. AUTHENTICATED STATE: ROLE-SPECIFIC WORKSPACE               */
          /* ------------------------------------------------------------- */
          <div className="space-y-8">
            {/* Active User Session Bar */}
            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6 backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-orange-600/20">
                  {currentUser.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-bold text-white">{currentUser.name}</h2>
                    <span
                      className={`text-xs font-bold px-3 py-0.5 rounded-full border ${
                        currentUser.role === 'ADMIN'
                          ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                          : currentUser.role === 'INFLUENCER'
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}
                    >
                      {currentUser.role}
                      {currentUser.influencer?.type ? ` · ${currentUser.influencer.type}` : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-2">
                    <span>{currentUser.email}</span>
                    <span>•</span>
                    <span>User ID: {currentUser.id.substring(0, 8)}...</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 font-semibold"
                >
                  <FiLogOut className="w-4 h-4 text-rose-400" />
                  Sign Out
                </button>
              </div>
            </div>

            {/* ----------------------------------------------------------- */}
            {/* A. ADMIN CONSOLE WORKSPACE (FULL CRUD MANAGEMENT)          */}
            {/* ----------------------------------------------------------- */}
            {currentUser.role === 'ADMIN' && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <FaUserShield className="w-6 h-6 text-purple-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Super Admin Management Console</h3>
                      <p className="text-xs text-slate-400">
                        Full CRUD: Manage shipping profiles, product associations, loyalty rules, and partner accounts
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs flex-wrap">
                    <button
                      onClick={() => setAdminTab('shipping')}
                      className={`px-3 py-1.5 rounded-xl transition ${
                        adminTab === 'shipping'
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      Shipping Profiles ({shippingProfiles.length})
                    </button>
                    <button
                      onClick={() => setAdminTab('assign')}
                      className={`px-3 py-1.5 rounded-xl transition ${
                        adminTab === 'assign'
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      Assign Product
                    </button>
                    <button
                      onClick={() => setAdminTab('influencers')}
                      className={`px-3 py-1.5 rounded-xl transition ${
                        adminTab === 'influencers'
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      Influencers ({influencersList.length})
                    </button>
                    <button
                      onClick={() => setAdminTab('loyalty')}
                      className={`px-3 py-1.5 rounded-xl transition ${
                        adminTab === 'loyalty'
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      Loyalty Rules ({loyaltyRules.length})
                    </button>
                    <button
                      onClick={() => setAdminTab('orders')}
                      className={`px-3 py-1.5 rounded-xl transition ${
                        adminTab === 'orders'
                          ? 'bg-purple-600 text-white font-bold'
                          : 'bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      Orders & Refunds ({allOrders.length})
                    </button>
                  </div>
                </div>

                {/* 1. Sub-Tab: Shipping Profiles CRUD */}
                {adminTab === 'shipping' && (
                  <div className="space-y-6">
                    {/* Create Profile with Rules Form */}
                    <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FaSquarePlus className="w-4 h-4 text-purple-400" />
                        Create New Shipping Profile & Add Initial Rule
                      </h4>
                      <form onSubmit={handleCreateShippingProfile} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Profile Name</label>
                            <input
                              type="text"
                              required
                              value={newProfileName}
                              onChange={(e) => setNewProfileName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                              placeholder="e.g. Ultra Heavy Freight"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Combination Strategy</label>
                            <select
                              value={newProfileStrategy}
                              onChange={(e) => setNewProfileStrategy(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            >
                              <option value="SUM">SUM (Cumulative Rules)</option>
                              <option value="MAX">MAX (Highest Match Only)</option>
                              <option value="TIERED_SLAB">TIERED_SLAB (Incremental Slabs)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Min Charge (₹)</label>
                            <input
                              type="number"
                              required
                              value={newProfileMinCharge}
                              onChange={(e) => setNewProfileMinCharge(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[11px] text-slate-400 mb-1">Max Cap (₹)</label>
                            <input
                              type="number"
                              required
                              value={newProfileMaxCharge}
                              onChange={(e) => setNewProfileMaxCharge(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            />
                          </div>
                        </div>

                        {/* Attached Rule Inputs */}
                        <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Rule Type</label>
                            <select
                              value={newRuleType}
                              onChange={(e) => setNewRuleType(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                            >
                              <option value="WEIGHT_SLAB">WEIGHT_SLAB</option>
                              <option value="PER_KM_DISTANCE">PER_KM_DISTANCE</option>
                              <option value="VOLUMETRIC">VOLUMETRIC</option>
                              <option value="AREA_SURFACE">AREA_SURFACE</option>
                              <option value="FIXED_FEE">FIXED_FEE</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Min Unit</label>
                            <input
                              type="number"
                              value={newRuleMinUnit}
                              onChange={(e) => setNewRuleMinUnit(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Max Unit</label>
                            <input
                              type="number"
                              value={newRuleMaxUnit}
                              onChange={(e) => setNewRuleMaxUnit(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-400 mb-1">Base Rate (₹)</label>
                            <input
                              type="number"
                              value={newRuleBaseRate}
                              onChange={(e) => setNewRuleBaseRate(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1.5 text-xs text-white"
                            />
                          </div>
                          <div>
                            <button
                              type="submit"
                              disabled={loading}
                              className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow"
                            >
                              <FiPlusCircle className="w-3.5 h-3.5" />
                              Save Profile
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Profiles List with Full CRUD Controls (Edit, Deactivate, View) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shippingProfiles.map((prof) => (
                        <div
                          key={prof.id}
                          className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-3 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-white text-sm">{prof.name}</h5>
                            <span className="text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                              Strategy: {prof.combinationStrategy || prof.rulesCombination}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            Min: ₹{prof.minCharge || 0} • Max Cap: ₹{prof.maxCharge || 'None'} • Rules:{' '}
                            {prof.rules?.length || 0}
                          </p>

                          {prof.rules && prof.rules.length > 0 && (
                            <div className="space-y-1">
                              {prof.rules.map((r) => (
                                <div
                                  key={r.id}
                                  className="text-[11px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded flex justify-between"
                                >
                                  <span>{r.ruleType}</span>
                                  <span>
                                    {r.minUnit}-{r.maxUnit || '∞'} units @ ₹{r.baseRate} + ₹{r.perUnitRate}/unit
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}

                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-3 border-t border-slate-900">
                            <span className={prof.isActive ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                              {prof.isActive ? '● Active' : '○ Deactivated'}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingProfile(prof);
                                  setEditProfileName(prof.name);
                                  setEditProfileStrategy(prof.combinationStrategy || 'SUM');
                                  setEditProfileMinCharge(prof.minCharge ?? '');
                                  setEditProfileMaxCharge(prof.maxCharge ?? '');
                                }}
                                className="text-purple-400 hover:text-purple-300 flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 transition"
                              >
                                <FiEdit2 className="w-3.5 h-3.5" /> Edit
                              </button>
                              {prof.isActive && (
                                <button
                                  type="button"
                                  onClick={() => handleDeactivateProfile(prof.id, prof.name)}
                                  className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition"
                                >
                                  <FiTrash2 className="w-3.5 h-3.5" /> Deactivate
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Sub-Tab: Assign Profile to Product */}
                {adminTab === 'assign' && (
                  <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-6 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <FiLink className="w-5 h-5 text-purple-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Assign Shipping Profile to Product</h4>
                        <p className="text-xs text-slate-400">
                          Link a catalog product to a logistics shipping profile for automated freight calculations
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleAssignProfileToProduct} className="space-y-4">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Select Catalog Product</label>
                        <select
                          value={assignProductId}
                          onChange={(e) => setAssignProductId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                        >
                          {productsList.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name} (SKU: {p.sku}) — Current: {p.shippingProfile?.name || 'None'}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Select Target Shipping Profile</label>
                        <select
                          value={assignProfileId}
                          onChange={(e) => setAssignProfileId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white"
                        >
                          {shippingProfiles.map((prof) => (
                            <option key={prof.id} value={prof.id}>
                              {prof.name} (Strategy: {prof.rulesCombination || prof.combinationStrategy})
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={loading}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-2 shadow"
                      >
                        <FiLink className="w-4 h-4" />
                        Assign Profile to Product
                      </button>
                    </form>
                  </div>
                )}

                {/* 3. Sub-Tab: Influencers CRUD */}
                {adminTab === 'influencers' && (
                  <div className="space-y-6">
                    {/* Provision Influencer Form */}
                    <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FaCompassDrafting className="w-4 h-4 text-blue-400" />
                        Provision Verified Partner Account (Architect / Contractor)
                      </h4>
                      <form
                        onSubmit={handleAdminCreateInfluencer}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
                      >
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Partner Name</label>
                          <input
                            type="text"
                            required
                            value={newInfName}
                            onChange={(e) => setNewInfName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            placeholder="e.g. Ar. Deepak Mehta"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Email</label>
                          <input
                            type="email"
                            required
                            value={newInfEmail}
                            onChange={(e) => setNewInfEmail(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            placeholder="deepak@archstudio.in"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Partner Type</label>
                          <select
                            value={newInfType}
                            onChange={(e) => setNewInfType(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            <option value="ARCHITECT">Architect</option>
                            <option value="CONTRACTOR">Contractor</option>
                            <option value="INTERIOR_DESIGNER">Interior Designer</option>
                            <option value="BUILDER">Builder</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Referral Code</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newInfCode}
                              onChange={(e) => setNewInfCode(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono uppercase"
                              placeholder="INF-DEEPAK-ARCH"
                            />
                            <button
                              type="submit"
                              disabled={loading}
                              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs shrink-0 transition"
                            >
                              Provision
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>

                    {/* Influencers Table */}
                    <div className="overflow-x-auto bg-slate-950/60 rounded-2xl border border-slate-800">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-900 text-slate-400 uppercase text-[11px]">
                          <tr>
                            <th className="p-3">Partner Name</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Referral Code</th>
                            <th className="p-3">Points Balance</th>
                            <th className="p-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {influencersList.map((inf) => (
                            <tr key={inf.id} className="hover:bg-slate-900/50">
                              <td className="p-3 font-semibold text-white">{inf.user?.name || 'Partner'}</td>
                              <td className="p-3 text-slate-300 font-mono text-[11px]">{inf.type}</td>
                              <td className="p-3 font-mono font-bold text-orange-400">{inf.referralCode}</td>
                              <td className="p-3 font-mono font-bold text-emerald-400">{inf.pointsBalance} pts</td>
                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                  Verified
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* 4. Sub-Tab: Loyalty Rules CRUD */}
                {adminTab === 'loyalty' && (
                  <div className="space-y-6">
                    {/* Create Loyalty Rule Form */}
                    <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FaAward className="w-4 h-4 text-orange-400" />
                        Create Configurable Loyalty Precedence Rule
                      </h4>
                      <form
                        onSubmit={handleCreateLoyaltyRule}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4"
                      >
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Rule Name</label>
                          <input
                            type="text"
                            required
                            value={newLoyaltyName}
                            onChange={(e) => setNewLoyaltyName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                            placeholder="e.g. Steel 5% Reward"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Tier Level</label>
                          <select
                            value={newLoyaltyTier}
                            onChange={(e) => setNewLoyaltyTier(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            <option value="PRODUCT">PRODUCT (Tier 1)</option>
                            <option value="CATEGORY">CATEGORY (Tier 2)</option>
                            <option value="CART_VALUE">CART_VALUE (Tier 3)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Reward Percentage (%)</label>
                          <input
                            type="number"
                            step="0.5"
                            required
                            value={newLoyaltyPercentage}
                            onChange={(e) => setNewLoyaltyPercentage(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Precedence Priority</label>
                          <input
                            type="number"
                            required
                            value={newLoyaltyPrecedence}
                            onChange={(e) => setNewLoyaltyPrecedence(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded-xl text-xs transition"
                          >
                            Save Rule
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Rules Grid with Deactivate */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {loyaltyRules.map((rule) => (
                        <div
                          key={rule.id}
                          className="bg-slate-950/60 border border-slate-800 p-5 rounded-2xl space-y-3 relative group"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400">
                              Priority {rule.precedence}: {rule.tierLevel}
                            </span>
                            <span className="text-xs font-bold text-orange-400 font-mono">
                              {rule.pointPercentage}% Pts
                            </span>
                          </div>
                          <h5 className="font-bold text-white text-xs">{rule.name}</h5>
                          <p className="text-[11px] text-slate-400">{rule.description}</p>
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-3 border-t border-slate-900">
                            <span className={rule.isActive ? 'text-emerald-400' : 'text-rose-400 font-bold'}>
                              {rule.isActive ? '● Active' : '○ Deactivated'}
                            </span>
                            {rule.isActive && (
                              <button
                                onClick={() => handleDeactivateLoyaltyRule(rule.id, rule.name)}
                                className="text-rose-400 hover:text-rose-300 flex items-center gap-1 text-xs"
                              >
                                <FiTrash2 className="w-3.5 h-3.5" /> Deactivate
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 5. Sub-Tab: Orders & Partial Refund Reversals */}
                {adminTab === 'orders' && (
                  <div className="space-y-6">
                    {/* Partial Refund Reversal Simulator Form */}
                    <div className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-4">
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <FiRotateCcw className="w-4 h-4 text-rose-400" />
                        Execute Proportional Refund & Points Reversal (Task 2 Requirement)
                      </h4>
                      <p className="text-xs text-slate-400">
                        Select an order and enter a refund amount. The system will reverse points proportionally and record
                        the debit in the append-only ledger without corrupting balance integrity.
                      </p>

                      <form onSubmit={handleTriggerRefund} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Select Order ID</label>
                          <select
                            value={refundOrderId}
                            onChange={(e) => setRefundOrderId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          >
                            {allOrders.map((o) => (
                              <option key={o.id} value={o.id}>
                                #{o.id.substring(0, 8)} — ₹{o.grandTotal} (Customer: {o.customer?.user?.name})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">Refund Amount (₹)</label>
                          <input
                            type="number"
                            required
                            value={refundAmount}
                            onChange={(e) => setRefundAmount(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                          />
                        </div>
                        <div className="flex items-end">
                          <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-rose-600 hover:bg-rose-500 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 shadow"
                          >
                            <FiRotateCcw className="w-3.5 h-3.5" />
                            Process Refund Reversal
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Orders List */}
                    <div className="space-y-3">
                      {allOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-orange-400">
                                #{ord.id.substring(0, 8)}
                              </span>
                              <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded">
                                Status: {ord.status}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">
                                Customer: {ord.customer?.user?.name}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Items: {ord.items?.length || 0} line items • Shipping: ₹{ord.shippingTotal} • Influencer:{' '}
                              {ord.influencer?.user?.name || 'None'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-400 block">Total Value</span>
                            <span className="text-lg font-bold text-white font-mono">₹{ord.grandTotal}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ----------------------------------------------------------- */}
            {/* B. INFLUENCER / PARTNER WORKSPACE                          */}
            {/* ----------------------------------------------------------- */}
            {currentUser.role === 'INFLUENCER' && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <FaCompassDrafting className="w-6 h-6 text-blue-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Partner Rewards & Referral Portal</h3>
                      <p className="text-xs text-slate-400">
                        Type: {currentUser.influencer?.type || 'ARCHITECT'} • Track your referral code and live points ledger
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Available Points Balance</span>
                    <span className="text-3xl font-extrabold text-orange-400 font-mono">
                      {myInfluencerData ? `${myInfluencerData.pointsBalance} pts` : 'Loading...'}
                    </span>
                  </div>
                </div>

                {/* Referral Code Share Box */}
                <div className="bg-slate-950/80 border border-blue-500/20 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      Your Official Referral Code
                    </span>
                    <div className="text-xl font-mono font-bold text-white mt-0.5">
                      {currentUser.influencer?.referralCode || 'INF-RAHUL-ARCH'}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Share this code with your clients. Every qualifying cement or material purchase automatically accrues
                      reward points to your ledger.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(currentUser.influencer?.referralCode || '');
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition flex items-center gap-2 self-start sm:self-auto"
                  >
                    <FiCopy className="w-4 h-4" />
                    {copiedCode ? 'Copied Code' : 'Copy Code'}
                  </button>
                </div>

                {/* Ledger History Stream */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Append-Only Loyalty Ledger Stream ({myLedger.length} events)
                  </h4>
                  {myLedger.length === 0 ? (
                    <div className="text-center py-8 bg-slate-950/40 rounded-2xl text-slate-500 text-xs">
                      No points transactions recorded yet.
                    </div>
                  ) : (
                    <div className="overflow-x-auto bg-slate-950/60 rounded-2xl border border-slate-800">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-900 text-slate-400 uppercase text-[11px]">
                          <tr>
                            <th className="p-3">Event Type</th>
                            <th className="p-3">Points Delta</th>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Description</th>
                            <th className="p-3">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-900">
                          {myLedger.map((entry) => (
                            <tr key={entry.id} className="hover:bg-slate-900/50">
                              <td className="p-3 font-bold">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-[10px] ${
                                    entry.eventType === 'ORDER_ACCRUAL'
                                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}
                                >
                                  {entry.eventType}
                                </span>
                              </td>
                              <td
                                className={`p-3 font-mono font-bold ${
                                  entry.points >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                }`}
                              >
                                {entry.points >= 0 ? `+${entry.points}` : entry.points} pts
                              </td>
                              <td className="p-3 font-mono text-slate-400">{entry.orderId?.substring(0, 8)}...</td>
                              <td className="p-3 text-slate-300">{entry.description}</td>
                              <td className="p-3 text-slate-500 font-mono">
                                {new Date(entry.createdAt).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------- */}
            {/* C. CUSTOMER PROCUREMENT WORKSPACE                          */}
            {/* ----------------------------------------------------------- */}
            {currentUser.role === 'CUSTOMER' && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-4 gap-4">
                  <div className="flex items-center gap-3">
                    <FaCartShopping className="w-6 h-6 text-emerald-400" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Customer Material Procurement Hub</h3>
                      <p className="text-xs text-slate-400">
                        Calculate dynamic freight charges and manage material purchase orders
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/products/ultratech-super-cement-50kg"
                    className="text-xs bg-orange-600 hover:bg-orange-500 text-white font-semibold px-4 py-2 rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <FiBox className="w-4 h-4" />
                    Browse Catalog
                  </Link>
                </div>

                {/* Interactive Dynamic Logistics Calculator */}
                <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <FiTruck className="w-4 h-4 text-orange-400" />
                      Dynamic Multi-Criteria Freight Calculator
                    </h4>
                    <span className="text-[10px] font-mono text-slate-400">Live Backend API Engine</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Unit Wt (kg)</label>
                      <input
                        type="number"
                        value={calcWeight}
                        onChange={(e) => setCalcWeight(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Length (cm)</label>
                      <input
                        type="number"
                        value={calcLength}
                        onChange={(e) => setCalcLength(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Width (cm)</label>
                      <input
                        type="number"
                        value={calcWidth}
                        onChange={(e) => setCalcWidth(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Height (cm)</label>
                      <input
                        type="number"
                        value={calcHeight}
                        onChange={(e) => setCalcHeight(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Distance (km)</label>
                      <input
                        type="number"
                        value={calcDistance}
                        onChange={(e) => setCalcDistance(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Quantity</label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          value={calcQuantity}
                          onChange={(e) => setCalcQuantity(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                        />
                        <button
                          onClick={handleCalculateShipping}
                          disabled={calcLoading}
                          className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-2 rounded-xl text-xs shrink-0 transition"
                        >
                          {calcLoading ? '...' : 'Calc'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Calculation Result */}
                  {calcResult && (
                    <div className="mt-4 p-4 bg-slate-900 border border-orange-500/20 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-[11px] text-slate-400 block font-mono">
                          Strategy: {calcResult.rulesCombination} • Billable Wt: {calcResult.billableWeightKg} kg • Vol Wt:{' '}
                          {calcResult.volumetricWeightKg} kg
                        </span>
                        <span className="text-xs text-slate-300 mt-0.5 block">
                          Applied Rules: {calcResult.appliedRules?.length || 0} logistics rules calculated
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] text-slate-400 block">Computed Shipping Total</span>
                        <span className="text-2xl font-black text-orange-400 font-mono">
                          ₹{calcResult.finalShippingCharge}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Orders History */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    My Orders ({allOrders.length})
                  </h4>
                  {allOrders.length === 0 ? (
                    <div className="text-center py-8 bg-slate-950/40 rounded-2xl text-slate-500 text-xs">
                      No purchase orders placed yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {allOrders.map((ord) => (
                        <div
                          key={ord.id}
                          className="bg-slate-950/60 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold text-orange-400">#{ord.id.substring(0, 8)}</span>
                              <span className="text-[10px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded">
                                Status: {ord.status}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Items: {ord.items?.length || 0} line items • Shipping: ₹{ord.shippingTotal}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="text-xs text-slate-400 block">Grand Total</span>
                            <span className="text-lg font-bold text-white font-mono">₹{ord.grandTotal}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ----------------------------------------------------------- */}
            {/* D. LIVE RBAC & ABAC SECURITY MATRIX INSPECTOR               */}
            {/* ----------------------------------------------------------- */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 backdrop-blur-xl">
              <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <FiShield className="w-5 h-5 text-purple-400" />
                  <h3 className="text-base font-bold text-white">Live Role & Security Boundary Inspector</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">Verifies 200 OK vs 401 / 403 Forbidden</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  onClick={() =>
                    runSecurityTest({
                      title: 'Admin Route Access: POST /shipping/profiles',
                      endpoint: '/shipping/profiles',
                      method: 'POST',
                      withToken: true,
                      body: {
                        name: 'Security Test Profile',
                        rulesCombination: 'SUM',
                        minCharge: 50,
                      },
                      expected: '200/201 if ADMIN, 403 Forbidden if CUSTOMER/INFLUENCER',
                      explanation:
                        'Ensures unprivileged roles cannot create or modify logistics profiles.',
                    })
                  }
                  disabled={securityLoading}
                  className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 p-3.5 rounded-2xl text-left transition"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-purple-400">
                    <span>POST /shipping/profiles</span>
                    <span className="text-[10px] bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.5 rounded">
                      Admin Only
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Tests role-based authorization check.</p>
                </button>

                <button
                  onClick={() =>
                    runSecurityTest({
                      title: 'ABAC IDOR Defense: Access Foreign Influencer Ledger',
                      endpoint: '/loyalty/ledger/foreign-influencer-id-99999',
                      method: 'GET',
                      withToken: true,
                      expected: '403 Forbidden (Object-Level Access Denied)',
                      explanation:
                        'Even with a valid JWT, users cannot access or view another user’s ledger ID.',
                    })
                  }
                  disabled={securityLoading}
                  className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 p-3.5 rounded-2xl text-left transition"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-blue-400">
                    <span>GET /loyalty/ledger/:foreignId</span>
                    <span className="text-[10px] bg-blue-500/10 border border-blue-500/30 px-1.5 py-0.5 rounded">
                      IDOR Guard
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Tests object-level ownership check.</p>
                </button>

                <button
                  onClick={() =>
                    runSecurityTest({
                      title: 'Unauthenticated Request: GET /orders without Token',
                      endpoint: '/orders',
                      method: 'GET',
                      withToken: false,
                      expected: '401 Unauthorized',
                      explanation:
                        'Rejects requests lacking valid Authorization Bearer header.',
                    })
                  }
                  disabled={securityLoading}
                  className="bg-slate-950/80 hover:bg-slate-900 border border-slate-800 p-3.5 rounded-2xl text-left transition"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-rose-400">
                    <span>GET /orders (No Token)</span>
                    <span className="text-[10px] bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded">
                      401 Test
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">Tests missing token rejection.</p>
                </button>
              </div>

              {/* Security Test Output Display */}
              {securityOutput && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span
                      className={`font-mono text-xs font-bold px-2.5 py-1 rounded ${
                        securityOutput.status >= 200 && securityOutput.status < 300
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : securityOutput.status === 401 || securityOutput.status === 403
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      HTTP {securityOutput.status} {securityOutput.statusText}
                    </span>
                    <span className="text-xs text-white font-semibold">{securityOutput.title}</span>
                  </div>
                  <p className="text-xs text-slate-400">{securityOutput.explanation}</p>
                  <pre className="bg-slate-900 text-slate-300 p-3 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800">
                    {JSON.stringify(securityOutput.data, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Global Centered Modal for Editing Shipping Profile (PUT) */}
      {editingProfile && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
          onClick={() => setEditingProfile(null)}
        >
          <div
            className="bg-slate-900 border-2 border-purple-500/70 p-6 sm:p-8 rounded-3xl max-w-2xl w-full space-y-6 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <FiEdit2 className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    Update Shipping Profile
                  </h4>
                  <p className="text-xs text-purple-300 font-mono mt-0.5">
                    Profile: {editingProfile.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-950 border border-slate-800 transition"
              >
                <FiX className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdateShippingProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Profile Name</label>
                  <input
                    type="text"
                    required
                    value={editProfileName}
                    onChange={(e) => setEditProfileName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Combination Strategy</label>
                  <select
                    value={editProfileStrategy}
                    onChange={(e) => setEditProfileStrategy(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="SUM">SUM (Cumulative Rules)</option>
                    <option value="MAX">MAX (Highest Match Only)</option>
                    <option value="TIERED_SLAB">TIERED_SLAB (Incremental Slabs)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Min Charge (₹)</label>
                  <input
                    type="number"
                    value={editProfileMinCharge}
                    onChange={(e) => setEditProfileMinCharge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Cap (₹)</label>
                  <input
                    type="number"
                    value={editProfileMaxCharge}
                    onChange={(e) => setEditProfileMaxCharge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProfile(null)}
                  className="px-4 py-2.5 rounded-xl text-xs text-slate-400 hover:text-white bg-slate-950 border border-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
                >
                  <FiCheck className="w-4 h-4" /> Save Changes (PUT)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Global Floating Toast Notifications (Zero Layout Shift & Auto-dismissing) */}
      <div className="fixed top-6 right-6 z-[120] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-4 sm:px-0">
        {successMsg && (
          <div className="pointer-events-auto bg-slate-900/95 border-2 border-emerald-500/80 text-emerald-200 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 animate-slideIn">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <FiCheckCircle className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Action Completed</p>
                <p className="text-xs text-emerald-300/90 mt-0.5 leading-relaxed">{successMsg}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSuccessMsg('')}
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition shrink-0"
              title="Close"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="pointer-events-auto bg-slate-900/95 border-2 border-rose-500/80 text-rose-200 p-4 rounded-2xl shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 animate-slideIn">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <FiAlertTriangle className="w-4 h-4 text-rose-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Notice / Error</p>
                <p className="text-xs text-rose-300/90 mt-0.5 leading-relaxed">{errorMsg}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg('')}
              className="text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition shrink-0"
              title="Close"
            >
              <FiX className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
