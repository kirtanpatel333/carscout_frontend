import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaCamera, FaUserCircle } from "react-icons/fa";
import UserNavbar from "../components/UserNavbar";
import { getAuthProfile, isAuthenticated, updateAuthProfile } from "../utils/auth";

const createForm = (profile = {}) => ({
  name:         profile.name         || "",
  email:        profile.email        || "",
  mobile:       profile.mobile       || "",
  address:      profile.address      || "",
  city:         profile.city         || "",
  area:         profile.area         || "",
  pinCode:      profile.pinCode      || "",
  profileImage: profile.image        || "",
});

const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(() => getAuthProfile());
  const [form, setForm]       = useState(() => createForm(getAuthProfile()));
  const [errors, setErrors]   = useState({});

  useEffect(() => {
    if (!isAuthenticated()) navigate("/login");
  }, [navigate]);

  useEffect(() => {
    setProfile(getAuthProfile());
    setForm(createForm(getAuthProfile()));
  }, []);

  const initials = useMemo(() => {
    const words = String(form.name || "").trim().split(/\s+/).filter(Boolean);
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return "PR";
  }, [form.name]);

  const completePercent = useMemo(() => {
    const fields = [form.name, form.email, form.mobile, form.address, form.city, form.area, form.pinCode];
    const done = fields.filter((v) => String(v || "").trim()).length;
    return Math.round((done / fields.length) * 100);
  }, [form]);

  const onInput = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "mobile" || name === "pinCode" ? value.replace(/\D/g, "") : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const onImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))  { setErrors((p) => ({ ...p, profileImage: "Please upload an image file" })); return; }
    if (file.size > 2 * 1024 * 1024)     { setErrors((p) => ({ ...p, profileImage: "Image must be under 2MB" }));         return; }

    const reader = new FileReader();
    reader.onload = () => {
      setForm((prev) => ({ ...prev, profileImage: String(reader.result || "") }));
      setErrors((prev) => ({ ...prev, profileImage: "" }));
    };
    reader.onerror = () => setErrors((prev) => ({ ...prev, profileImage: "Unable to read image" }));
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())                  e.name    = "Full name is required";
    if (!form.email.trim())                 e.email   = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) e.email = "Enter a valid email";
    if (!form.mobile.trim())                e.mobile  = "Mobile number is required";
    else if (form.mobile.trim().length !== 10) e.mobile = "Must be 10 digits";
    if (!form.address.trim())               e.address = "Address is required";
    if (!form.city.trim())                  e.city    = "City is required";
    if (!form.area.trim())                  e.area    = "Area is required";
    if (!form.pinCode.trim())               e.pinCode = "Pin code is required";
    else if (form.pinCode.trim().length !== 6) e.pinCode = "Must be 6 digits";
    return e;
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) { toast.error("Please fix the form errors."); return; }

    const updated = updateAuthProfile(form);
    if (!updated) { toast.error("Unable to save. Please log in again."); navigate("/login"); return; }

    const nextProfile = getAuthProfile();
    setProfile(nextProfile);
    setForm(createForm(nextProfile));
    toast.success("Profile updated successfully!");
  };

  const FieldError = ({ name }) =>
    errors[name] ? <p className="mt-1.5 text-xs font-medium text-red-500">{errors[name]}</p> : null;

  const labelClass = "block text-sm font-medium text-text-main mb-1.5";
  const inputClass = (name) => `input-field ${errors[name] ? "!border-red-500 !ring-red-500" : ""}`;

  return (
    <div className="min-h-screen bg-bg-base">
      <UserNavbar />

      <main className="mx-auto max-w-3xl px-6 py-10">
        {/* Profile Header Card */}
        <div className="card-styled mb-8">
          <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative group flex-shrink-0">
              <label htmlFor="photo-upload" className="cursor-pointer block">
                {form.profileImage ? (
                  <img 
                    src={form.profileImage}
                    alt="Profile"
                    className="h-24 w-24 rounded-full object-cover border-4 border-bg-surface shadow-md"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary-600 flex items-center justify-center text-3xl font-black text-white border-4 border-bg-surface shadow-md">
                    {initials}
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <FaCamera className="text-white text-xl" />
                </div>
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={onImageUpload}
                className="sr-only"
              />
              {errors.profileImage && <p className="mt-1 text-xs text-red-500 text-center">{errors.profileImage}</p>}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-black text-text-main">{profile.name || "Your Profile"}</h1>
              <p className="text-text-muted mt-1">{profile.email || "No email set"}</p>
              <p className="text-xs text-text-muted mt-0.5 capitalize">{profile.role || "user"}</p>

              {/* Completion bar */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-semibold text-text-muted mb-1.5">
                  <span>Profile completeness</span>
                  <span className={completePercent === 100 ? "text-green-500" : "text-primary-600"}>{completePercent}%</span>
                </div>
                <div className="h-2 rounded-full bg-border-subtle overflow-hidden">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${completePercent === 100 ? "bg-green-500" : "bg-primary-600"}`}
                    style={{ width: `${completePercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="card-styled">
          <div className="px-6 py-5 border-b border-border-subtle">
            <h2 className="text-lg font-bold text-text-main">Personal Information</h2>
            <p className="text-sm text-text-muted mt-0.5">Your profile data is saved locally in your session.</p>
          </div>

          <form onSubmit={onSubmit} className="p-6 space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Full Name</label>
                <input name="name" value={form.name} onChange={onInput} placeholder="John Doe" className={inputClass("name")} />
                <FieldError name="name" />
              </div>

              <div>
                <label className={labelClass}>Email</label>
                <input name="email" type="email" value={form.email} onChange={onInput} placeholder="you@example.com" className={inputClass("email")} />
                <FieldError name="email" />
              </div>

              <div>
                <label className={labelClass}>Mobile</label>
                <input name="mobile" value={form.mobile} onChange={onInput} maxLength={10} placeholder="10-digit number" className={inputClass("mobile")} />
                <FieldError name="mobile" />
              </div>

              <div>
                <label className={labelClass}>Pin Code</label>
                <input name="pinCode" value={form.pinCode} onChange={onInput} maxLength={6} placeholder="6-digit pin code" className={inputClass("pinCode")} />
                <FieldError name="pinCode" />
              </div>
            </div>

            <div>
              <label className={labelClass}>Address</label>
              <textarea
                name="address"
                value={form.address}
                onChange={onInput}
                rows={2}
                placeholder="House no, street, landmark"
                className={inputClass("address") + " resize-none"}
              />
              <FieldError name="address" />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className={labelClass}>City</label>
                <input name="city" value={form.city} onChange={onInput} placeholder="Mumbai" className={inputClass("city")} />
                <FieldError name="city" />
              </div>

              <div>
                <label className={labelClass}>Area / Locality</label>
                <input name="area" value={form.area} onChange={onInput} placeholder="Bandra West" className={inputClass("area")} />
                <FieldError name="area" />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => { setForm(createForm(profile)); setErrors({}); }}
                className="btn-secondary py-2"
              >
                Discard Changes
              </button>
              <button type="submit" className="btn-primary py-2">
                Save Profile
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;
