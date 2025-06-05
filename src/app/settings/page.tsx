"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface User {
  _id?: string;
  name?: string;
  fullName?: string;
  username?: string;
  email: string;
  avatar?: string;
  plantCareReminders?: boolean;
  newArticlesNotifications?: boolean;
}

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [avatar, setAvatar] = useState("");
  const [newPassword, setNewPassword] = useState(""); // This seems to be a temporary field before opening modal
  const [plantCareReminders, setPlantCareReminders] = useState(false);
  const [newArticlesNotifications, setNewArticlesNotifications] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalEmail, setModalEmail] = useState("");
  const [modalOldPassword, setModalOldPassword] = useState("");
  const [modalNewPassword, setModalNewPassword] = useState("");
  const [modalConfirmPassword, setModalConfirmPassword] = useState("");
  const [activeTab, setActiveTab] = useState("account");

  const fetchUserData = useCallback(async (email: string) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/user?email=${encodeURIComponent(email)}`);
      const data = await res.json();
      if (res.status === 404) {
        setError("User not found. Please ensure your email is registered.");
        return;
      }
      if (data.user) {
        setUser(data.user);
        setFullName(data.user.fullName || data.user.name || "");
        setNewEmail(data.user.email || ""); // Initialize newEmail with current email
        setAvatar(data.user.avatar || "");
        setPlantCareReminders(data.user.plantCareReminders || false);
        setNewArticlesNotifications(data.user.newArticlesNotifications || false);
      } else {
        setError(data.error || "Failed to load user data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to fetch user data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      router.replace("/auth");
      return;
    }
    if (session?.user?.email) {
      fetchUserData(session.user.email);
    }
  }, [status, session?.user?.email, fetchUserData, router]);

  if (status === "loading" || isLoading) {
    return <div className="p-4 md:p-8">Loading your settings…</div>;
  }

  if (status === "unauthenticated") {
    // This case should be handled by useEffect redirect, but as a fallback:
    return <div className="p-4 md:p-8">Please sign in to access settings</div>;
  }

  if (!user) {
    return <div className="p-4 md:p-8">Error loading user data: {error}</div>;
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setError("");
    setSuccess("");
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("avatar", file);
    formData.append("email", session?.user?.email || "");
    try {
      const res = await fetch("/api/user/avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (data.avatar) {
        setAvatar(data.avatar);
        setSuccess("Avatar updated successfully");
      } else {
        setError(data.error || "Failed to upload avatar");
      }
    } catch (err) {
      console.error("Error uploading avatar:", err);
      setError("Failed to upload avatar");
    }
  };

  const handleAvatarDelete = async () => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/user/avatar", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email }),
      });
      const data = await res.json();
      if (data.success) {
        setAvatar("");
        setSuccess("Avatar deleted successfully");
      } else {
        setError(data.error || "Failed to delete avatar");
      }
    } catch (err) {
      console.error("Error deleting avatar:", err);
      setError("Failed to delete avatar");
    }
  };

  const handleFullNameUpdate = async () => {
    if (!fullName.trim()) {
      setError("Full name cannot be empty");
      return;
    }
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/user/name", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email, fullName }),
      });
      const data = await res.json();
      if (data.success) setSuccess("Full name updated successfully");
      else setError(data.error || "Failed to update full name");
    } catch (err) {
      console.error("Error updating full name:", err);
      setError("Failed to update full name");
    }
  };

  const handleEmailUpdate = async () => {
    if (!modalEmail.trim()) {
      setError("Email cannot be empty");
      return;
    }
    if (modalEmail === session?.user?.email) {
      setError("New email must be different from the current email");
      return;
    }
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/user/email", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentEmail: session?.user?.email, newEmail: modalEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Email updated successfully. Please sign in again.");
        setShowEmailModal(false);
        setTimeout(() => router.replace("/auth"), 2000);
      } else {
        setError(data.error || "Failed to update email");
      }
    } catch (err) {
      console.error("Error updating email:", err);
      setError("Failed to update email");
    }
  };

  const handlePasswordChange = async () => {
    if (!modalOldPassword.trim()) {
      setError("Old password is required");
      return;
    }
    if (modalNewPassword.length < 6) {
      setError("New password must be at least 6 characters long");
      return;
    }
    if (modalNewPassword !== modalConfirmPassword) {
      setError("New password and confirm password do not match");
      return;
    }
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email, oldPassword: modalOldPassword, newPassword: modalNewPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Password updated successfully");
        setModalOldPassword("");
        setModalNewPassword("");
        setModalConfirmPassword("");
        setNewPassword(""); // Clear the temporary field on main page as well
        setShowPasswordModal(false);
      } else {
        setError(data.error || "Failed to update password");
      }
    } catch (err) {
      console.error("Error updating password:", err);
      setError("Failed to update password");
    }
  };

  const handleNotificationUpdate = async (type: "plantCare" | "newArticles", value: boolean) => {
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/user/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          plantCareReminders: type === "plantCare" ? value : plantCareReminders,
          newArticlesNotifications: type === "newArticles" ? value : newArticlesNotifications,
        }),
      });
      const data = await res.json();
      if (data.success) {
        type === "plantCare" ? setPlantCareReminders(value) : setNewArticlesNotifications(value);
        setSuccess("Notification settings updated successfully");
      } else {
        setError(data.error || "Failed to update notifications");
      }
    } catch (err) {
      console.error("Error updating notifications:", err);
      setError("Failed to update notification settings");
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) return;
    setError("");
    setSuccess("");
    try {
      const res = await fetch("/api/user", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: session?.user?.email }),
      });
      const data = await res.json();
      if (data.success) {
        router.replace("/auth");
      } else {
        setError(data.error || "Failed to delete account");
      }
    } catch (err) {
      console.error("Error deleting account:", err);
      setError("Failed to delete account");
    }
  };

  const subscriptionPlans = [
    { title: "90 DAYS ACCESS + 3-DAY TRIAL", price: "59.995", renewable: true },
    { title: "7 DAYS ACCESS + 3-DAY TRIAL", price: "9.995", renewable: true },
    { title: "EXCLUSIVE 30 DAYS ACCESS + 3-DAY TRIAL", price: "39.995", renewable: true },
  ];

  const handleGetTrial = (planTitle: string) => {
    console.log(`Initiating trial for: ${planTitle}`);
    setSuccess(`Trial initiated for ${planTitle}. (Demo)`);
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-white">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white shadow-md md:border-r md:border-gray-200">
        <div className="p-4 md:p-6">
          <h2 className="text-xl font-bold mb-6">Settings</h2>
          <ul>
            <li className="mb-4">
              <button
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold ${
                  activeTab === "account" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("account")}
              >
                Account settings
              </button>
            </li>
            <li>
              <button
                className={`w-full text-left px-4 py-2 rounded-lg font-semibold ${
                  activeTab === "subscription" ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveTab("subscription")}
              >
                Subscription info
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 md:p-8">
        {activeTab === "account" ? (
          <>
            <h1 className="text-2xl font-bold mb-6">Account settings</h1>

            {error && <div className="text-red-500 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">{error}</div>}
            {success && <div className="text-green-600 mb-4 p-3 bg-green-50 border border-green-200 rounded-md">{success}</div>}

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Images</h3>
              <h4 className="text-lg font-semibold mb-4">Avatar</h4>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                  {avatar ? (
                    <img src={avatar} alt="User Avatar" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-gray-500 text-xs text-center">No Avatar</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <button
                    className="w-full sm:w-auto px-4 py-2 border border-green-500 text-green-500 rounded-full hover:bg-green-50"
                    onClick={() => document.getElementById("avatar-upload")?.click()}
                  >
                    Upload Photo
                  </button>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarUpload}
                  />
                  <button
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-600 rounded-full hover:bg-gray-50"
                    onClick={handleAvatarDelete}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Profile Information</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullNameInput" className="block text-lg font-semibold mb-1">Full name</label>
                  <input
                    id="fullNameInput"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    onBlur={handleFullNameUpdate}
                    placeholder="Enter your full name (e.g. Sam Brown)"
                    className="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-lg font-semibold mb-1">Username</label>
                  <p className="text-gray-600">{user?.username || user?.name || user?.email?.split('@')[0]}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Account Preferences</h3>
              <div className="space-y-6">
                <div>
                  <label htmlFor="emailInput" className="block text-lg font-semibold mb-1">Email Address</label>
                  <input
                    id="emailInput"
                    type="email"
                    value={newEmail} // This field shows current email, modalEmail is for new one
                    readOnly // User should change it via modal
                    className="w-full max-w-md p-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                   <button
                    onClick={() => {
                      setModalEmail(newEmail); // Pre-fill modal with current email
                      setShowEmailModal(true);
                    }}
                    className="mt-2 w-full sm:w-auto px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                  >
                    Change Email
                  </button>
                  <p className="text-sm text-gray-500 mt-1">
                    You will need to verify your new email address.
                  </p>
                </div>
                <div>
                  <label htmlFor="passwordInput" className="block text-lg font-semibold mb-1">Password</label>
                  <input
                    id="passwordInput"
                    type="password"
                    value={newPassword} // This field is for display or prefill, actual change in modal
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New password (at least 6 characters)"
                    className="w-full max-w-md p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                   <button
                    onClick={() => {
                      setModalOldPassword("");
                      setModalNewPassword(newPassword); // Pre-fill new password from the input if user typed something
                      setModalConfirmPassword("");
                      setShowPasswordModal(true);
                    }}
                    className="mt-2 w-full sm:w-auto px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="plantCareReminders" className="text-lg font-semibold">Plant care reminders</label>
                  <input
                    id="plantCareReminders"
                    type="checkbox"
                    checked={plantCareReminders}
                    onChange={(e) => handleNotificationUpdate("plantCare", e.target.checked)}
                    className="w-5 h-5 shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                </div>
                <div className="flex items-center justify-between gap-4">
                  <label htmlFor="newArticlesNotifications" className="text-lg font-semibold">New articles notifications</label>
                  <input
                    id="newArticlesNotifications"
                    type="checkbox"
                    checked={newArticlesNotifications}
                    onChange={(e) => handleNotificationUpdate("newArticles", e.target.checked)}
                    className="w-5 h-5 shrink-0 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Delete Account</h3>
              <p className="text-gray-600 mb-4">
                Note that deleting an account does not cancel the subscription! You can change this in your{" "}
                <button
                  onClick={() => setActiveTab("subscription")}
                  className="text-blue-500 hover:underline font-semibold"
                >
                  subscription settings
                </button>
                .
              </p>
              <button
                onClick={handleDeleteAccount}
                className="w-full sm:w-auto px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Delete Account
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold mb-6">Subscription info</h1>

            {error && <div className="text-red-500 mb-4 p-3 bg-red-50 border border-red-200 rounded-md">{error}</div>}
            {success && <div className="text-green-600 mb-4 p-3 bg-green-50 border border-green-200 rounded-md">{success}</div>}
            
            <div className="mb-8">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Available Plans</h3>
              <div className="space-y-6">
                {subscriptionPlans.map((plan, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 border border-gray-200 rounded-lg shadow-sm"
                  >
                    <div className="flex-grow">
                      <h4 className="text-lg font-semibold">{plan.title}</h4>
                      <p className="text-gray-600">
                        ${plan.price} {plan.renewable && "/ auto-renewable"}
                      </p>
                    </div>
                    <button
                      className="w-full sm:w-auto px-6 py-2 bg-teal-500 text-white rounded-full hover:bg-teal-600 shrink-0"
                      onClick={() => handleGetTrial(plan.title)}
                    >
                      Get Trial
                    </button>
                  </div>
                ))}
              </div>
            </div>
             {/* You can add more subscription related info here, e.g., current plan, billing history, cancel subscription button */}
             {/*
             <div className="mt-8 p-4 border border-gray-200 rounded-lg">
                <h4 className="text-lg font-semibold mb-2">Your Current Plan</h4>
                <p className="text-gray-700">You are currently on the <strong>Free Plan</strong>.</p>
                <p className="text-gray-500 text-sm mt-1">Upgrade to access exclusive features and content.</p>
             </div>
             */}
          </>
        )}
      </div>

      {/* Email Update Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex">
            <div className="absolute inset-y-0 left-0 w-24 bg-blue-50 rounded-l-2xl hidden sm:flex items-center justify-center">
              <svg className="w-12 h-12 text-blue-300" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M20 5H4C2.89543 5 2 5.89543 2 7V17C2 18.1046 2.89543 19 4 19H20C21.1046 19 22 18.1046 22 17V7C22 5.89543 21.1046 5 20 5ZM20 7L12 12L4 7H20ZM4 17V9L12 14L20 9V17H4Z"/></svg>
            </div>
            <div className="p-6 sm:pl-28 flex-1">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowEmailModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <h2 className="text-xl font-bold mb-2">Update your email</h2>
              <p className="text-sm text-gray-600 mb-4">
                Enter your new email address below. We will send a verification link to your new email.
              </p>
              <label htmlFor="modalEmailInput" className="block text-sm font-medium mb-1">
                New Email<span className="text-red-500">*</span>
              </label>
              <input
                id="modalEmailInput"
                type="email"
                value={modalEmail}
                onChange={(e) => setModalEmail(e.target.value)}
                placeholder="Enter your new email"
                className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                onClick={handleEmailUpdate}
                className="w-full py-2.5 bg-teal-500 text-white rounded-full hover:bg-teal-600 font-semibold"
              >
                Change email
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4 z-50">
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md flex">
            <div className="absolute inset-y-0 left-0 w-24 bg-blue-50 rounded-l-2xl hidden sm:flex items-center justify-center">
             <svg className="w-12 h-12 text-blue-300" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" clipRule="evenodd" d="M12 1C8.68629 1 6 3.68629 6 7V8H5C3.89543 8 3 8.89543 3 10V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V10C21 8.89543 20.1046 8 19 8H18V7C18 3.68629 15.3137 1 12 1ZM12 3C14.2091 3 16 4.79086 16 7V8H8V7C8 4.79086 9.79086 3 12 3ZM5 10H19V19H5V10Z"/></svg>
            </div>
            <div className="p-6 sm:pl-28 flex-1">
              <button
                className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPasswordModal(false)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
              <h2 className="text-xl font-bold mb-2">Update your password</h2>
              <p className="text-sm text-gray-600 mb-4">
                Ensure your new password is at least 6 characters long.
              </p>
              <label className="block text-sm font-medium mb-1">
                Old Password<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={modalOldPassword}
                onChange={(e) => setModalOldPassword(e.target.value)}
                placeholder="Enter your old password"
                className="w-full p-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <label className="block text-sm font-medium mb-1">
                New Password<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={modalNewPassword}
                onChange={(e) => setModalNewPassword(e.target.value)}
                placeholder="Enter your new password"
                className="w-full p-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <label className="block text-sm font-medium mb-1">
                Confirm Password<span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                value={modalConfirmPassword}
                onChange={(e) => setModalConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
                className="w-full p-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                onClick={handlePasswordChange}
                className="w-full py-2.5 bg-teal-500 text-white rounded-full hover:bg-teal-600 font-semibold"
              >
                Change password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}