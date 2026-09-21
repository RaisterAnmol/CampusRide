import React, { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import {
  ShieldCheck,
  Mail,
  Lock,
  User,
  GraduationCap,
  Building2,
  Phone,
  Car,
  Users,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  Sparkles,
  Key,
  X,
  Upload,
  Loader2,
} from "lucide-react";

type AccountTypeOption = "PASSENGER" | "WOMEN_PASSENGER" | "DRIVER" | "ADMIN";

export const AuthPage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isRegisterRoute =
    location.pathname === "/register" ||
    location.pathname === "/signup" ||
    searchParams.get("mode") === "register" ||
    searchParams.get("tab") === "register";

  const [isRegister, setIsRegister] = useState(isRegisterRoute);

  useEffect(() => {
    if (
      location.pathname === "/register" ||
      location.pathname === "/signup" ||
      searchParams.get("mode") === "register"
    ) {
      setIsRegister(true);
    } else if (location.pathname === "/login" || location.pathname === "/signin") {
      setIsRegister(false);
    }
  }, [location.pathname, location.search]);

  const [accountType, setAccountType] = useState<AccountTypeOption>("PASSENGER");

  // Shared credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("CampusRide2025!");

  // Registration fields
  const [name, setName] = useState("");
  const [college, setCollege] = useState("Uttaranchal University");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [course, setCourse] = useState("B.Tech CSE");
  const [year, setYear] = useState(3);
  const [gender, setGender] = useState<"male" | "female" | "other">("male");
  const [phone, setPhone] = useState("+91 98765 43210");

  // Driver-specific fields
  const [driverIdentifier, setDriverIdentifier] = useState("");
  const [vehicleType, setVehicleType] = useState<"car" | "bike">("car");
  const [vehicleModel, setVehicleModel] = useState("Honda City");
  const [plateLast4, setPlateLast4] = useState("4821");
  const [capacity, setCapacity] = useState(3);
  const [idCardFile, setIdCardFile] = useState<File | null>(null);
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null);

  const handleIdCardFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdCardFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setIdCardPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUseSampleIdCard = () => {
    const sampleCard = "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80";
    setIdCardPreview(sampleCard);
  };

  // Admin-specific fields
  const [adminToken, setAdminToken] = useState("");

  // Forgot password modal
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState<"REQUEST" | "RESET">("REQUEST");
  const [forgotMsg, setForgotMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register, switchDemoUser } = useAuth();
  const navigate = useNavigate();

  const handleAccountTypeChange = (type: AccountTypeOption) => {
    setAccountType(type);
    if (type === "WOMEN_PASSENGER") {
      setGender("female");
    } else if (type === "DRIVER" && gender === "female") {
      // keep female if already female
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        const payload: any = {
          name,
          email,
          password,
          college,
          department,
          course,
          year,
          gender: accountType === "WOMEN_PASSENGER" ? "female" : gender,
          phone,
          accountType,
        };

        if (accountType === "DRIVER") {
          payload.driverIdentifier = driverIdentifier;
          payload.enrolledIdCardUrl = idCardPreview || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80";
          payload.vehicle = {
            type: vehicleType,
            model: vehicleModel,
            capacity,
            plateLast4,
          };
          localStorage.setItem("campusride_driver_id_card_" + email.toLowerCase().trim(), payload.enrolledIdCardUrl);
        }

        if (accountType === "ADMIN") {
          payload.adminToken = adminToken;
        }

        await register(payload);
        // After registration, redirect to /verification for immediate badge completion
        navigate("/verification");
      } else {
        await login(email, password);
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed. Please check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPersona = async (
    persona: "aditya" | "rahul" | "priya" | "admin" | "moderator",
  ) => {
    setError("");
    setLoading(true);
    try {
      await switchDemoUser(persona);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to switch demo persona");
    } finally {
      setLoading(false);
    }
  };

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    setForgotLoading(true);
    try {
      const res = await api.forgotPassword(forgotEmail);
      setForgotMsg({ text: res.message || "Reset instructions generated.", isError: false });
      setForgotStep("RESET");
    } catch (err: any) {
      setForgotMsg({ text: err.message || "Failed to send reset email.", isError: true });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCompleteReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    setForgotLoading(true);
    try {
      const res = await api.resetPassword(resetToken, newPassword);
      setForgotMsg({ text: res.message || "Password successfully reset! You can now log in.", isError: false });
      setTimeout(() => {
        setIsForgotOpen(false);
        setPassword(newPassword);
        setEmail(forgotEmail);
      }, 1500);
    } catch (err: any) {
      setForgotMsg({ text: err.message || "Failed to reset password.", isError: true });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-[90vh] flex items-center justify-center p-4 sm:p-6 bg-slate-900/10">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header Hero */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              Verified University Transit Network
            </div>
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full border border-slate-700">
              Dehradun Academic Hub
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white mt-2">
            {isRegister ? "Create Your CampusRide Account" : "Sign In to CampusRide"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Safe, verified campus carpooling between colleges, hostels, and transit hubs.
          </p>

          {/* Switcher Tab */}
          <div className="flex gap-2 mt-6 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700">
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                setError("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                !isRegister
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                setError("");
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                isRegister
                  ? "bg-emerald-500 text-slate-950 shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Quick Testing Persona Cards */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 px-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              1-Click Testing Profiles:
            </span>
            <span className="text-[10px] text-slate-400 font-mono">Live DB credentials</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              type="button"
              onClick={() => handleDemoPersona("aditya")}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-left transition-all shadow-sm group"
            >
              <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-600">
                🚗 Aditya K.
              </span>
              <span className="text-[10px] text-slate-400 block truncate">Driver • Verified</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoPersona("rahul")}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-left transition-all shadow-sm group"
            >
              <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-600">
                🎒 Rahul S.
              </span>
              <span className="text-[10px] text-slate-400 block truncate">Passenger • UU</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoPersona("priya")}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-left transition-all shadow-sm group"
            >
              <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-600">
                🛡️ Priya S.
              </span>
              <span className="text-[10px] text-slate-400 block truncate">Women Network</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoPersona("admin")}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-left transition-all shadow-sm group"
            >
              <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-600">
                🏛️ Admin
              </span>
              <span className="text-[10px] text-slate-400 block truncate">Campus SOC</span>
            </button>

            <button
              type="button"
              onClick={() => handleDemoPersona("moderator")}
              className="p-2 rounded-xl bg-white border border-slate-200 hover:border-emerald-500 text-left transition-all shadow-sm group"
            >
              <span className="text-xs font-bold text-slate-800 block group-hover:text-emerald-600">
                ⚖️ Moderator
              </span>
              <span className="text-[10px] text-slate-400 block truncate">Safety Review</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isRegister && (
            <>
              {/* Account Type Card Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Select Account Type
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    onClick={() => handleAccountTypeChange("PASSENGER")}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      accountType === "PASSENGER"
                        ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">Student Passenger</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        Default
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Book seats with verified campus batchmates and split travel costs.
                    </p>
                  </div>

                  <div
                    onClick={() => handleAccountTypeChange("WOMEN_PASSENGER")}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      accountType === "WOMEN_PASSENGER"
                        ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">Women-Only Passenger</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                        Safe Hub
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Exclusive access to women drivers and women-only carpools.
                    </p>
                  </div>

                  <div
                    onClick={() => handleAccountTypeChange("DRIVER")}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      accountType === "DRIVER"
                        ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">Student Driver</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                        DL Required
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Offer campus carpool seats, offset fuel expenses, and earn driver badges.
                    </p>
                  </div>

                  <div
                    onClick={() => handleAccountTypeChange("ADMIN")}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                      accountType === "ADMIN"
                        ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10"
                        : "border-slate-200 hover:border-slate-300 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-slate-900">Campus Admin</span>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                        Invite Only
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Institutional verification review, SOC emergency queue, and route management.
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Aditya Kumar"
                      className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      College / University
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        value={college}
                        onChange={(e) => setCollege(e.target.value)}
                        placeholder="e.g. Uttaranchal University"
                        className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Academic Year
                    </label>
                    <div className="relative">
                      <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <select
                        value={year}
                        onChange={(e) => setYear(Number(e.target.value))}
                        className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
                      >
                        <option value={1}>1st Year</option>
                        <option value={2}>2nd Year</option>
                        <option value={3}>3rd Year</option>
                        <option value={4}>4th Year</option>
                        <option value={5}>Postgraduate</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="e.g. Computer Science & Engg"
                      className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Course / Degree
                    </label>
                    <input
                      type="text"
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      placeholder="e.g. B.Tech CSE"
                      className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={accountType === "WOMEN_PASSENGER" ? "female" : gender}
                      disabled={accountType === "WOMEN_PASSENGER"}
                      onChange={(e) => setGender(e.target.value as any)}
                      className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white disabled:bg-slate-100"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91..."
                        className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Driver Section */}
                {accountType === "DRIVER" && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-900 uppercase">
                      <Car className="w-4 h-4 text-amber-700" />
                      Driver & Vehicle Registration
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Driving License Number *
                        </label>
                        <input
                          type="text"
                          required
                          value={driverIdentifier}
                          onChange={(e) => setDriverIdentifier(e.target.value)}
                          placeholder="e.g. UK07-20220014821"
                          className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Vehicle Type
                        </label>
                        <select
                          value={vehicleType}
                          onChange={(e) => setVehicleType(e.target.value as any)}
                          className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
                        >
                          <option value="car">Car (Sedan/Hatchback/SUV)</option>
                          <option value="bike">Motorcycle / Scooter</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Vehicle Model
                        </label>
                        <input
                          type="text"
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          placeholder="e.g. Honda City"
                          className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Plate Last 4
                        </label>
                        <input
                          type="text"
                          value={plateLast4}
                          onChange={(e) => setPlateLast4(e.target.value)}
                          placeholder="4821"
                          maxLength={4}
                          className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono uppercase"
                        />
                      </div>
                    </div>

                    {/* Student ID Card (Baseline Reference for Daily Verification) */}
                    <div className="pt-3 border-t border-amber-200/80">
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                          <GraduationCap className="w-4 h-4 text-amber-700" />
                          <span>Student College ID Card (Mandatory Baseline) *</span>
                        </label>
                        <span className="text-[10px] font-bold text-amber-800 uppercase px-2 py-0.5 rounded bg-amber-100 border border-amber-300">
                          Required
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-800/90 mb-2.5">
                        Upload or snap a photo of your College ID. Every day before your first ride, you will authenticate against this card to protect campus commuters.
                      </p>

                      {idCardPreview ? (
                        <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-500 bg-slate-950 p-2 shadow-inner">
                          <img
                            src={idCardPreview}
                            alt="Student ID Card Preview"
                            className="w-full h-36 object-contain rounded-xl bg-slate-900"
                          />
                          <div className="absolute top-3 right-3 flex items-center gap-1.5">
                            <span className="px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center gap-1 shadow">
                              <CheckCircle2 className="w-3 h-3" />
                              Baseline ID Saved
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setIdCardFile(null);
                                setIdCardPreview(null);
                              }}
                              className="p-1 rounded-full bg-red-600 text-white hover:bg-red-700 shadow cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <label className="flex flex-col items-center justify-center p-3.5 border-2 border-dashed border-amber-300 hover:border-amber-500 rounded-xl cursor-pointer bg-white transition-all text-center">
                            <Upload className="w-5 h-5 text-amber-600 mb-1" />
                            <span className="text-xs font-bold text-slate-800">Upload ID Card Photo</span>
                            <span className="text-[10px] text-slate-400">PNG, JPG or WEBP</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleIdCardFileSelect}
                            />
                          </label>

                          <button
                            type="button"
                            onClick={handleUseSampleIdCard}
                            className="flex flex-col items-center justify-center p-3.5 border border-amber-300 hover:border-emerald-500 rounded-xl bg-amber-100/60 hover:bg-emerald-50 transition-all text-center cursor-pointer"
                          >
                            <Sparkles className="w-5 h-5 text-emerald-600 mb-1" />
                            <span className="text-xs font-bold text-slate-800">Use Sample University ID</span>
                            <span className="text-[10px] text-emerald-700">1-Click Official Student Card</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Secret Section */}
                {accountType === "ADMIN" && (
                  <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase">
                      <KeyRound className="w-4 h-4 text-purple-700" />
                      Institutional Secret Key
                    </div>
                    <p className="text-[11px] text-purple-800">
                      Enter the authorization token issued to your university campus administration office.
                    </p>
                    <input
                      type="password"
                      required
                      value={adminToken}
                      onChange={(e) => setAdminToken(e.target.value)}
                      placeholder="Enter Admin Invite Secret..."
                      className="w-full text-sm px-3 py-2 rounded-xl border border-purple-300 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                  </div>
                )}
              </div>
            </>
          )}

          {/* Email & Password */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                College / Institutional Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. aditya.kumar@college.edu"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">Password</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setIsForgotOpen(true);
                    }}
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isRegister ? (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              "Sign In to CampusRide"
            )}
          </button>
        </form>
      </div>

      {/* Forgot Password Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <button
              onClick={() => setIsForgotOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-600 mb-2">
              <Key className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-wider">Account Recovery</span>
            </div>

            <h3 className="text-lg font-bold text-slate-900">Reset Your Password</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Enter your registered student email to receive a recovery token.
            </p>

            {forgotMsg && (
              <div
                className={`p-3 rounded-xl text-xs mb-4 ${
                  forgotMsg.isError
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {forgotMsg.text}
              </div>
            )}

            {forgotStep === "REQUEST" ? (
              <form onSubmit={handleSendResetLink} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Email
                  </label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="student@college.edu"
                    className="w-full text-sm px-3 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Send Reset Code"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleCompleteReset} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Reset Token / Code
                  </label>
                  <input
                    type="text"
                    required
                    value={resetToken}
                    onChange={(e) => setResetToken(e.target.value)}
                    placeholder="Paste 6-character code or token..."
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Secure Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters..."
                    className="w-full text-sm px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {forgotLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save New Password"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
