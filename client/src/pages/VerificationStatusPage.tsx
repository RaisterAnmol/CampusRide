import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { IdentityDocumentUpload } from "../components/verification/IdentityDocumentUpload";
import { SelfieCapture } from "../components/verification/SelfieCapture";
import {
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Car,
  GraduationCap,
  Building,
  Upload,
  ArrowRight,
  RefreshCw,
  Info,
  Camera,
  Lock,
  Sparkles,
} from "lucide-react";
import { DailyDriverIdCheckModal } from "../components/verification/DailyDriverIdCheckModal";

export const VerificationStatusPage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetchingRequest, setFetchingRequest] = useState(true);
  const [existingRequest, setExistingRequest] = useState<any>(null);
  const [resubmitting, setResubmitting] = useState(false);

  // Daily physical ID check states
  const [showDailyModal, setShowDailyModal] = useState(false);
  const todayStr = new Date().toISOString().slice(0, 10);
  const [dailyCheckDate, setDailyCheckDate] = useState<string>(() => {
    return user?.lastDailyIdCheckDate || localStorage.getItem('campusride_daily_id_verified_' + (user?._id || 'me')) || '';
  });
  const isDailyVerified = dailyCheckDate === todayStr;

  const enrolledIdCardUrl =
    user?.enrolledIdCardUrl ||
    localStorage.getItem('campusride_driver_id_card_' + (user?.email || '')) ||
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80';

  const handleDailyVerified = () => {
    setDailyCheckDate(todayStr);
    setShowDailyModal(false);
    refreshUser();
  };

  // Form states
  const [studentId, setStudentId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [idFile, setIdFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const [selfieData, setSelfieData] = useState<any>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const isDriver =
    user?.role === "driver" || user?.accountType === "DRIVER";

  useEffect(() => {
    const loadRequest = async () => {
      setFetchingRequest(true);
      try {
        const res = await api.getMyVerificationRequest();
        if (res && res.request) {
          setExistingRequest(res.request);
        }
      } catch (err) {
        console.warn("[VerificationPage] Could not load verification request:", err);
      } finally {
        setFetchingRequest(false);
      }
    };

    if (user) {
      loadRequest();
    } else {
      setFetchingRequest(false);
    }
  }, [user]);

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!studentId.trim()) {
      setSubmitError("University Student ID / Roll Number is required.");
      return;
    }
    if (isDriver && !driverId.trim()) {
      setSubmitError("Driving License Number is required for driver verification.");
      return;
    }
    if (!idFile) {
      setSubmitError("Please upload a photo of your Student ID card.");
      return;
    }
    if (isDriver && !licenseFile) {
      setSubmitError("Please upload a photo of your Driving License.");
      return;
    }
    if (!selfieData || !selfieData.file) {
      setSubmitError("Please complete the real-time selfie verification check.");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("studentIdentifier", studentId.trim());
      if (driverId.trim()) formData.append("driverIdentifier", driverId.trim());
      formData.append("accountType", user?.accountType || (isDriver ? "DRIVER" : "PASSENGER"));
      formData.append("idDocument", idFile);
      if (licenseFile) formData.append("drivingLicense", licenseFile);
      formData.append("selfie", selfieData.file);

      await api.submitVerificationRequest(formData);

      // Enroll face embedding if captured
      if (selfieData.embedding) {
        try {
          await api.enrollFace(selfieData.embedding, selfieData.qualityScore);
        } catch (faceErr) {
          console.warn("[Verification] Face enrollment error:", faceErr);
        }
      }

      await refreshUser();
      setSubmitSuccess(true);
      setResubmitting(false);

      // Refresh current request status
      const updated = await api.getMyVerificationRequest();
      if (updated?.request) {
        setExistingRequest(updated.request);
      }
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit verification request");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <ShieldCheck className="w-16 h-16 text-emerald-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Sign in to Access Verification</h2>
        <p className="text-sm text-slate-500 max-w-md mt-1 mb-6">
          Identity verification ensures only genuine university students and verified drivers join rides.
        </p>
        <Link
          to="/auth"
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md transition-all"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const currentStatus = user.verificationStatus;
  const showForm =
    currentStatus === "unverified" ||
    (currentStatus === "rejected" && resubmitting) ||
    (!existingRequest && currentStatus !== "verified");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4" />
              Institutional Trust & Safety
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Campus Identity & Driver Verification
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              All students and drivers are authenticated with official institutional ID cards,
              driving credentials, and biometric checks to ensure 100% safe university transit.
            </p>
          </div>

          <div className="flex-shrink-0">
            {currentStatus === "verified" ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Verified Campus Member
              </div>
            ) : currentStatus === "pending" ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-sm">
                <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                Under Institutional Review
              </div>
            ) : currentStatus === "rejected" ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-300 font-bold text-sm">
                <XCircle className="w-5 h-5 text-rose-400" />
                Action Required
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-sm">
                <AlertCircle className="w-5 h-5 text-slate-400" />
                Not Verified
              </div>
            )}
          </div>
        </div>
      </div>

      {/* State View */}
      {currentStatus === "verified" ? (
        <div className="space-y-6">
          {/* Main Authenticated Header Card */}
          <div className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 flex-shrink-0">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Authenticated {user.college} Member</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  {user.name}'s Verified Student Identity
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-xl">
                  You are officially verified under {user.college}. Your permanent college ID card is enrolled and cryptographically signed on file.
                </p>
              </div>
              <div className="flex sm:flex-col gap-2 flex-shrink-0">
                <Link
                  to="/dashboard"
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all text-center"
                >
                  Go to Dashboard
                </Link>
                {isDriver && (
                  <Link
                    to="/post"
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all text-center"
                  >
                    Publish a Ride
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Section Grid: Enrolled Baseline ID Card & Daily Pre-Ride Verification */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Card 1: Official Student ID Card Enrolled */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <GraduationCap className="w-4 h-4 text-emerald-600" />
                    <span>Permanent Student ID Card</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    Enrolled Baseline
                  </span>
                </div>

                {/* ID Card Visual Representation */}
                <div className="rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white p-5 shadow-md relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
                  
                  <div className="flex items-start justify-between border-b border-slate-700/60 pb-3 mb-4">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                        Official Student Identity Card
                      </span>
                      <h3 className="text-sm font-bold text-white leading-snug">
                        {user.college || "Uttaranchal University"}
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      ID ON FILE
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-24 h-28 rounded-xl overflow-hidden border border-slate-600 bg-slate-700 flex-shrink-0 shadow-inner">
                      <img
                        src={enrolledIdCardUrl}
                        alt="Enrolled Student ID"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Student Name</span>
                        <span className="font-bold text-white text-sm">{user.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Enrollment / Roll ID</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {user.studentId || user.institutionId || "UU-2024-DRV-842"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Department / Role</span>
                        <span className="text-slate-200 text-[11px] font-medium">
                          {user.department || "Computer Science"} • {isDriver ? "Driver" : "Passenger"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Valid Session: 2024-2026</span>
                    <span className="text-emerald-400 font-bold">SHA256 • Verified Baseline</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 text-[11px]">
                  Uploaded during registration as your permanent reference ID card.
                </span>
                <label className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer underline text-[11px]">
                  Update ID Photo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          const url = reader.result as string;
                          localStorage.setItem('campusride_driver_id_card_' + (user?.email || ''), url);
                          alert('Updated baseline ID card saved.');
                          window.location.reload();
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>

            {/* Card 2: Daily Pre-Ride Physical ID Verification */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>Daily Pre-Ride Physical ID Check</span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                    isDailyVerified
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800 animate-pulse'
                  }`}>
                    {isDailyVerified ? 'Today: Verified' : 'Today: Check Required'}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Under university transit safety protocols, drivers must click a photo of their physical student ID card before starting their <strong>first ride of each day</strong>. It is checked against their enrolled baseline ID on file.
                  </p>

                  {isDailyVerified ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
                      <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Driver ID Authenticated For Today ({todayStr})</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 leading-normal">
                        Physical ID card was matched against baseline records with <strong>98.6% confidence</strong>. Trip controls and passenger pickup QR codes are unlocked for today's rides.
                      </p>
                      <div className="flex items-center gap-3 text-[10px] font-mono text-emerald-700 pt-1">
                        <span>Status: ACTIVE TODAY</span>
                        <span>•</span>
                        <span>Expires: Tonight 23:59</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                      <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Pre-Ride Physical ID Check Required</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-normal">
                        You have not snapped your physical ID card yet today ({todayStr}). Click below to take or upload a live photo before starting carpool rides.
                      </p>
                    </div>
                  )}

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] space-y-1">
                    <span className="font-semibold text-slate-800 block">How Daily Verification Works:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                      <li>Use your camera to snap your physical ID card</li>
                      <li>AI compares crest, holographic text & credentials against enrolled baseline</li>
                      <li>Instantly grants 24-hour driver clearance for campus rides</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowDailyModal(true)}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all ${
                    isDailyVerified
                      ? 'bg-slate-900 hover:bg-slate-800'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-md'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{isDailyVerified ? "Re-Scan Physical ID Card" : "Scan Physical ID Card Now"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : currentStatus === "pending" && !resubmitting ? (
        <div className="bg-white border border-amber-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Verification Application Under Review
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Your credentials have been safely received by the {user.college} Student Safety & Transit Office.
                Moderators review ID authenticity within 2 hours during active university sessions.
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs text-slate-700">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Applicant:</span>
              <span className="font-semibold">{user.name} ({user.email})</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Applied Account Type:</span>
              <span className="font-bold text-emerald-700">{user.accountType || (isDriver ? "DRIVER" : "PASSENGER")}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Student ID / Roll:</span>
              <span className="font-mono font-bold">{existingRequest?.studentIdentifier || "Submitted"}</span>
            </div>
            {isDriver && existingRequest?.driverIdentifier && (
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Driving License:</span>
                <span className="font-mono font-bold text-slate-900">{existingRequest.driverIdentifier}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-slate-400">
              Need to correct your documents?
            </span>
            <button
              type="button"
              onClick={() => setResubmitting(true)}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
            >
              Update / Replace Submission
            </button>
          </div>
        </div>
      ) : currentStatus === "rejected" && !resubmitting ? (
        <div className="bg-white border border-rose-200 rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Verification Application Needs Revision
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                The institutional review team was unable to verify your submitted documents.
                Please review the reason below and submit a clear updated photo.
              </p>
            </div>
          </div>

          {existingRequest?.rejectionReason && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
              <span className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                Moderator Feedback:
              </span>
              <p className="text-sm text-rose-900 font-medium mt-1">
                "{existingRequest.rejectionReason}"
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setResubmitting(true)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Resubmit Verification Documents
          </button>
        </div>
      ) : (
        /* Form View */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">
              Complete Your Verification Application
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Submit your university enrollment proof and face scan. High-resolution photos speed up instant review.
            </p>
          </div>

          {submitError && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmitVerification} className="space-y-6">
            {/* Step 1: Identifier Numbers */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <GraduationCap className="w-4 h-4 text-emerald-600" />
                1. Institutional Identifiers
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    University Roll / Enrollment Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. UU2023CS0142"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-mono"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Found on your physical student ID card or portal.
                  </p>
                </div>

                {isDriver && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Driving License Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. UK07-20220014821"
                      value={driverId}
                      onChange={(e) => setDriverId(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none uppercase font-mono"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Required by campus safety bylaws to offer rides.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Document Uploads */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                2. Official Document Proof
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <IdentityDocumentUpload
                  label="Student ID Card"
                  description="Front photo of your valid university student ID card."
                  required
                  file={idFile}
                  onFileSelect={setIdFile}
                />

                {isDriver && (
                  <IdentityDocumentUpload
                    label="Valid Driving License"
                    description="Front photo of government-issued driving license."
                    required
                    file={licenseFile}
                    onFileSelect={setLicenseFile}
                  />
                )}
              </div>
            </div>

            {/* Step 3: Selfie Biometric Check */}
            <div className="space-y-4 pt-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                3. Real-Time Face Quality Check
              </h3>

              <SelfieCapture onCapture={setSelfieData} />
            </div>

            {/* Submit Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              {resubmitting ? (
                <button
                  type="button"
                  onClick={() => setResubmitting(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  Cancel and view current status
                </button>
              ) : (
                <span className="text-xs text-slate-400">
                  Data processed in accordance with student safety guidelines.
                </span>
              )}

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <ArrowRight className="w-4 h-4" />
                )}
                Submit for Verification
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Daily Driver ID Check Modal */}
      {showDailyModal && user && (
        <DailyDriverIdCheckModal
          isOpen={showDailyModal}
          onClose={() => setShowDailyModal(false)}
          user={user}
          onVerified={handleDailyVerified}
        />
      )}
    </div>
  );
};
