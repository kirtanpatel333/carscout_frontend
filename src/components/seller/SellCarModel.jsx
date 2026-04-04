import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaTimes, FaChevronLeft, FaChevronRight, FaCheck } from "react-icons/fa";
import { toast } from "react-toastify";
import { sellCarApi } from "../../services/sellCarApi";

const initialForm = {
  brand: "",
  model: "",
  city: "",
  year: "",
  owner: "",
  mileage: "",
  fuelType: "",
  transmission: "",
  price: "",
  description: "",
};

const stepConfig = [
  { key: "brand",        label: "Brand",        title: "What's the brand?" },
  { key: "model",        label: "Model",        title: "Which model?" },
  { key: "city",         label: "City",         title: "Registration city" },
  { key: "year",         label: "Year",         title: "Year of manufacture" },
  { key: "owner",        label: "Owner",        title: "Ownership history" },
  { key: "mileage",      label: "Mileage",      title: "Approximate mileage" },
  { key: "fuelType",     label: "Fuel",         title: "Fuel type" },
  { key: "transmission", label: "Gearbox",      title: "Transmission type" },
  { key: "price",        label: "Price",        title: "Set your asking price" },
];

const options = {
  brand:        ["Maruti Suzuki", "Hyundai", "Honda", "Tata", "Mahindra", "BMW", "Audi", "Toyota"],
  city:         ["Ahmedabad", "Mumbai", "Delhi", "Bangalore", "Pune", "Hyderabad", "Chennai"],
  owner:        ["1st Owner", "2nd Owner", "3rd Owner", "4th Owner"],
  mileage:      ["0 – 10k km", "10k – 20k km", "20k – 30k km", "30k – 40k km", "40k – 50k km", "50k – 60k km", "60k – 70k km"],
  fuelType:     ["Petrol", "Diesel", "Electric", "CNG"],
  transmission: ["Manual", "Automatic"],
};

const modelByBrand = {
  "Maruti Suzuki": ["Swift", "Baleno", "Brezza", "Dzire"],
  Hyundai:         ["i20", "Creta", "Venue", "Verna"],
  Honda:           ["City", "Amaze", "Elevate"],
  Tata:            ["Nexon", "Harrier", "Altroz", "Punch"],
  Mahindra:        ["XUV300", "XUV700", "Scorpio", "Thar"],
  BMW:             ["3 Series", "5 Series", "X1", "X3"],
  Audi:            ["A4", "A6", "Q3", "Q5"],
  Toyota:          ["Innova", "Fortuner", "Glanza", "Hyryder"],
};

const yearOptions = Array.from({ length: 15 }, (_, i) =>
  String(new Date().getFullYear() - i)
);

const OptionButton = ({ label, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative rounded-xl border px-4 py-3 text-sm font-semibold transition-all text-left overflow-hidden ${
      selected
        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 shadow-sm"
        : "border-border-subtle bg-bg-base dark:bg-zinc-900 text-text-main hover:border-primary-400 hover:bg-primary-50/50 dark:hover:bg-zinc-800"
    }`}
  >
    {selected && (
      <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-white text-xs">
        <FaCheck />
      </span>
    )}
    {label}
  </button>
);

const SellCarModel = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);

  const selectedStep = stepConfig[step];

  const modelOptions = useMemo(
    () => (form.brand ? modelByBrand[form.brand] || [] : []),
    [form.brand]
  );

  const selectValue = (key, value) => {
    setForm((prev) => {
      if (key === "brand") return { ...prev, brand: value, model: "" };
      return { ...prev, [key]: value };
    });
    if (step < stepConfig.length - 1) {
      setStep((prev) => prev + 1);
    }
  };

  const closeAndReset = () => {
    setStep(0);
    setForm(initialForm);
    setSubmitting(false);
    onClose();
  };

  const canSubmit =
    form.brand && form.model && form.city && form.year &&
    form.owner && form.mileage && form.fuelType && form.transmission && form.price;

  const submitListing = async () => {
    if (!canSubmit || submitting) return;

    const parsedYear  = Number(form.year);
    const parsedPrice = Number(form.price);

    if (!Number.isFinite(parsedYear)  || parsedYear  <= 0) { toast.error("Year must be valid");       return; }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) { toast.error("Price must be greater than 0"); return; }

    setSubmitting(true);
    try {
      const response = await sellCarApi({
        brand: form.brand, model: form.model, city: form.city,
        year: String(parsedYear), owner: form.owner, mileage: form.mileage,
        fuelType: form.fuelType, transmission: form.transmission,
        price: String(parsedPrice),
        description: form.description || `${form.brand} ${form.model} in ${form.city}, ${form.owner}, approx ${form.mileage}`,
      });
      toast.success(response?.message || "Car listed successfully!");
      if (typeof onSuccess === "function") onSuccess();
      closeAndReset();
    } catch (err) {
      setSubmitting(false);
    }
  };

  const renderStepBody = () => {
    const key = selectedStep.key;

    if (key === "model") {
      if (!form.brand) return <p className="text-text-muted text-sm">Select a brand first to see models.</p>;
      return (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {modelOptions.map((item) => (
            <OptionButton key={item} label={item} selected={form.model === item} onClick={() => selectValue("model", item)} />
          ))}
        </div>
      );
    }

    if (key === "year") {
      return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
          {yearOptions.map((item) => (
            <OptionButton key={item} label={item} selected={form.year === item} onClick={() => selectValue("year", item)} />
          ))}
        </div>
      );
    }

    if (key === "price") {
      return (
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Expected Price (INR)</label>
            <input
              type="number"
              value={form.price}
              onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
              placeholder="e.g. 650000"
              className="input-field text-lg font-bold"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-muted mb-1.5">Additional details (optional)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Describe condition, modifications, or anything relevant..."
              className="input-field resize-none"
              rows={4}
            />
          </div>
          <button
            type="button"
            onClick={submitListing}
            disabled={!canSubmit || submitting}
            className="btn-primary w-full py-3 text-base mt-2"
          >
            {submitting ? "Submitting listing..." : "Submit Listing"}
          </button>
        </div>
      );
    }

    const stepOptions =
      key === "brand"        ? options.brand :
      key === "city"         ? options.city  :
      key === "owner"        ? options.owner :
      key === "mileage"      ? options.mileage :
      key === "fuelType"     ? options.fuelType :
      options.transmission;

    return (
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
        {stepOptions.map((item) => (
          <OptionButton
            key={item}
            label={item}
            selected={form[key] === item}
            onClick={() => selectValue(key, item)}
          />
        ))}
      </div>
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl bg-bg-surface border border-border-subtle shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-subtle">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-text-muted">List Your Car</p>
                <h2 className="text-lg font-bold text-text-main mt-0.5">{selectedStep.title}</h2>
              </div>
              <button
                type="button"
                onClick={closeAndReset}
                className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Step Progress Pills */}
            <div className="flex flex-wrap gap-2 px-6 py-3 border-b border-border-subtle bg-bg-base dark:bg-zinc-900/50">
              {stepConfig.map((stepItem, idx) => {
                const value = form[stepItem.key];
                const isActive = idx === step;
                const isDone = !!value;
                return (
                  <button
                    key={stepItem.key}
                    type="button"
                    onClick={() => setStep(idx)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                      isActive
                        ? "bg-primary-600 text-white"
                        : isDone
                        ? "bg-zinc-200 dark:bg-zinc-700 text-text-main"
                        : "bg-border-subtle text-text-muted"
                    }`}
                  >
                    {value || stepItem.label}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepBody()}
              </motion.div>
            </div>

            {/* Footer Navigation */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border-subtle">
              <button
                type="button"
                onClick={() => setStep((p) => Math.max(0, p - 1))}
                disabled={step === 0}
                className="btn-secondary gap-2 disabled:opacity-30 py-2"
              >
                <FaChevronLeft className="text-xs" /> Back
              </button>
              <p className="text-sm font-semibold text-text-muted">Step {step + 1} / {stepConfig.length}</p>
              {selectedStep.key !== "price" && (
                <button
                  type="button"
                  onClick={() => setStep((p) => Math.min(stepConfig.length - 1, p + 1))}
                  className="btn-secondary gap-2 py-2"
                >
                  Skip <FaChevronRight className="text-xs" />
                </button>
              )}
              {selectedStep.key === "price" && <div className="w-24" />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SellCarModel;
