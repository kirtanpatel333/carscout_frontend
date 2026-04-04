import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { toast } from "react-toastify";
import { FaCarSide, FaEye, FaEyeSlash } from "react-icons/fa";

export const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({ mode: "onSubmit" });

  const submitHandler = async (data) => {
    setLoading(true);
    try {
      const res = await axios.post("http://localhost:4444/user/register", {
        firstname: data.firstname,
        lastname: data.lastname,
        email: data.email,
        password: data.password,
        role: data.role
      });
      if (res.status === 201) {
        toast.success("Registration successful! Please sign in.");
        reset();
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-base flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex justify-center items-center gap-2 text-2xl font-bold tracking-tight text-text-main group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600 text-white shadow-md transition group-hover:bg-primary-500">
            <FaCarSide className="text-xl" />
          </span>
          <span>CarScout</span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-text-main">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px]">
        <div className="bg-bg-surface px-6 py-8 sm:rounded-2xl sm:px-10 border border-border-subtle shadow-sm">
          <form onSubmit={handleSubmit(submitHandler)} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-main">First Name</label>
                <div className="mt-1.5">
                  <input
                    type="text"
                    spellCheck="false"
                    placeholder="John"
                    {...register("firstname", {
                      required: "Required",
                      minLength: { value: 2, message: "Too short" }
                    })}
                    className={`input-field ${errors.firstname ? '!border-red-500 !ring-red-500' : ''}`}
                  />
                </div>
                {errors.firstname && <p className="text-red-500 text-sm mt-1 font-medium">{errors.firstname.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-main">Last Name</label>
                <div className="mt-1.5">
                  <input
                    type="text"
                    spellCheck="false"
                    placeholder="Doe"
                    {...register("lastname", {
                      required: "Required",
                      minLength: { value: 2, message: "Too short" }
                    })}
                    className={`input-field ${errors.lastname ? '!border-red-500 !ring-red-500' : ''}`}
                  />
                </div>
                {errors.lastname && <p className="text-red-500 text-sm mt-1 font-medium">{errors.lastname.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main">Email address</label>
              <div className="mt-1.5">
                <input
                  type="email"
                  spellCheck="false"
                  placeholder="you@example.com"
                  {...register("email", { required: "Email is required" })}
                  className={`input-field ${errors.email ? '!border-red-500 !ring-red-500' : ''}`}
                />
              </div>
              {errors.email && <p className="text-red-500 text-sm mt-1 font-medium">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main">I am joining as a</label>
              <div className="mt-1.5 relative">
                <select
                  {...register("role", { required: "Please select an account role" })}
                  className={`input-field cursor-pointer ${errors.role ? '!border-red-500 !ring-red-500' : ''}`}
                  defaultValue=""
                >
                  <option value="" disabled hidden>Select account type</option>
                  <option value="buyer">Car Buyer (Browse & Buy)</option>
                  <option value="seller">Car Seller (List & Sell)</option>
                </select>
              </div>
              {errors.role && <p className="text-red-500 text-sm mt-1 font-medium">{errors.role.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-text-main">Password</label>
              <div className="mt-1.5 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password", {
                    required: "Password required",
                    minLength: { value: 6, message: "At least 6 characters" }
                  })}
                  className={`input-field pr-12 ${errors.password ? '!border-red-500 !ring-red-500' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-text-muted hover:text-text-main transition-colors"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm mt-1 font-medium">{errors.password.message}</p>}
            </div>

            <div className="flex items-start mt-4 mb-2">
              <div className="flex h-6 items-center">
                <input
                  id="terms"
                  type="checkbox"
                  {...register("terms", { required: "You must accept the terms" })}
                  className="h-4 w-4 rounded border-border-subtle bg-bg-surface text-primary-600 focus:ring-primary-600 cursor-pointer"
                />
              </div>
              <div className="ml-2 text-sm leading-6">
                <label htmlFor="terms" className="text-text-muted select-none cursor-pointer">
                  I agree to the <span className="font-medium text-text-main hover:text-primary-600 transition">Terms & Conditions</span>
                </label>
                {errors.terms && <p className="text-red-500 text-xs font-medium">{errors.terms.message}</p>}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base py-3 mt-2"
            >
              {loading ? "Creating account..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};