"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, FileBadge2, UploadCloud, XCircle } from "lucide-react";
import { useAuth } from "@/app/providers";
import { adminService, SellerApplication } from "@/lib/admin-service";

export default function SellerApplyPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const userId = user?.user_id;
  const userRole = user?.role;
  const [application, setApplication] = useState<SellerApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const localPreviewUrlRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    phoneNumber: "",
    nationalIdNumber: "",
    nationalIdImageUrl: "",
  });

  useEffect(() => {
    if (!isLoading && !userId) {
      router.push("/signin?redirect=%2Fseller%2Fapply");
      return;
    }

    if (userRole === "SELLER" || userRole === "ADMIN") {
      router.push(userRole === "ADMIN" ? "/admin/dashboard" : "/dashboard");
      return;
    }

    if (userId) {
      void loadApplication();
    }
  }, [userId, userRole, isLoading]);

  const loadApplication = async () => {
    try {
      setLoading(true);
      const existing = await adminService.getMySellerApplication();
      setApplication(existing);
      if (existing) {
        setForm({
          fullName: existing.fullName || user?.first_name || "",
          phoneNumber: existing.phoneNumber || user?.phone_number || "",
          nationalIdNumber: existing.nationalIdNumber || "",
          nationalIdImageUrl: existing.nationalIdImageUrl || "",
        });
        setPreviewUrl(existing.nationalIdImageUrl || "");
      } else {
        setForm((prev) => ({
          ...prev,
          fullName: prev.fullName || user?.first_name || "",
          phoneNumber: prev.phoneNumber || user?.phone_number || "",
        }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load seller application");
    } finally {
      setLoading(false);
    }
  };


  const statusTone = useMemo(() => {
    if (!application) return "bg-blue-100 text-blue-700";
    if (application.status === "APPROVED") return "bg-green-100 text-green-700";
    if (application.status === "REJECTED") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  }, [application]);

  const statusLabel = application?.status || "NOT SUBMITTED";

  const handleFileChange = (file: File | null) => {
    setSelectedFile(file);

    if (localPreviewUrlRef.current) {
      URL.revokeObjectURL(localPreviewUrlRef.current);
      localPreviewUrlRef.current = null;
    }

    if (file) {
      const objectUrl = URL.createObjectURL(file);
      localPreviewUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
      return;
    }

    setPreviewUrl(form.nationalIdImageUrl || application?.nationalIdImageUrl || "");
  };

  useEffect(() => {
    return () => {
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
      }
    };
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);

    try {
      let imageUrl = form.nationalIdImageUrl;
      if (selectedFile) {
        imageUrl = await adminService.uploadSellerDocument(selectedFile);
      }

      if (!imageUrl) {
        throw new Error("National ID image is required");
      }

      const saved = await adminService.submitSellerApplication({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        nationalIdNumber: form.nationalIdNumber.trim(),
        nationalIdImageUrl: imageUrl,
      });
      setApplication(saved);
      setForm((prev) => ({ ...prev, nationalIdImageUrl: imageUrl }));
      if (localPreviewUrlRef.current) {
        URL.revokeObjectURL(localPreviewUrlRef.current);
        localPreviewUrlRef.current = null;
      }
      setPreviewUrl(imageUrl);
      setSelectedFile(null);
      setSuccess(saved.status === "APPROVED"
        ? "Application approved. Please sign out and sign back in to start selling."
        : "Seller application submitted successfully. Admin review is now pending.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit seller application");
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading || loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading seller application...</div>;
  }

  if (!user || user.role === "SELLER" || user.role === "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Apply to Become a Seller</h1>
          <p className="text-lg text-gray-600">Submit your verification details. An admin must approve your application before you can post products.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input
                  value={form.phoneNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, phoneNumber: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">National ID Number</label>
                <input
                  value={form.nationalIdNumber}
                  onChange={(e) => setForm((prev) => ({ ...prev, nationalIdNumber: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">National ID Image Copy</label>
                <label className="flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 px-6 py-8 text-gray-600 cursor-pointer hover:border-green-500 hover:text-green-700 transition">
                  <UploadCloud className="w-5 h-5" />
                  <span>{selectedFile ? selectedFile.name : "Choose image file"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                  />
                </label>
              </div>


              {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">{error}</div>}
              {success && <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-green-700">{success}</div>}

              <button
                type="submit"
                disabled={submitting || application?.status === "PENDING"}
                className="w-full rounded-full bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : application?.status === "REJECTED" ? "Resubmit Application" : "Submit Application"}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-fit">
            <div className="flex items-center gap-3 mb-4">
              <FileBadge2 className="w-6 h-6 text-green-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Application Status</h2>
                <span className={`inline-flex mt-2 rounded-full px-3 py-1 text-xs font-semibold ${statusTone}`}>{statusLabel}</span>
              </div>
            </div>

            {!application && (
              <p className="text-sm text-gray-600">You have not submitted a seller application yet.</p>
            )}

            {application?.status === "PENDING" && (
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2"><FileBadge2 className="w-4 h-4 mt-0.5 text-amber-600" /><span>Your application is pending admin review.</span></div>
                <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-gray-400" /><span>Submitted on {application.submittedAt ? new Date(application.submittedAt).toLocaleString() : 'N/A'}.</span></div>
              </div>
            )}

            {application?.status === "APPROVED" && (
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" /><span>Your seller application has been approved.</span></div>
                <div className="rounded-xl bg-green-50 border border-green-200 p-3 text-green-700">Sign out and sign back in if you do not immediately see seller features.</div>
              </div>
            )}

            {application?.status === "REJECTED" && (
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2"><XCircle className="w-4 h-4 mt-0.5 text-red-600" /><span>Your previous application was rejected.</span></div>
                {application.rejectionReason && <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-red-700">Reason: {application.rejectionReason}</div>}
                <p>You can update your details and submit again.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
