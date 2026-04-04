import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import axios from 'axios'
import { FaCarSide, FaEye, FaEyeSlash } from "react-icons/fa"
import { normalizeRole, saveAuthSession } from '../utils/auth'

export const Login = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: ''
    },
    mode: 'onSubmit'
  })

  const submitHandler = async (data) => {
    setLoading(true)
    try {
      const res = await axios.post("http://localhost:4444/user/login", data)

      if (res.status === 200) {
        toast.success("Login successful!")

        const rawUser = res.data.user || res.data.data?.user || res.data.data || {}
        const role = normalizeRole(res.data.role || rawUser.role)
        const fallbackName = String(data.email || "").split("@")[0] || "User"

        const safeUser = {
          ...rawUser,
          name: rawUser.name || rawUser.fullName || rawUser.username || rawUser.firstName || fallbackName,
          email: rawUser.email || data.email,
          profileImage: rawUser.profileImage || rawUser.profilePicture || rawUser.avatar || rawUser.photo || "",
        }

        saveAuthSession({
          role,
          token: res.data.token || res.data.data?.token,
          user: safeUser,
        })

        if (role === "admin") {
          navigate("/adminpanel")
        } else if (role === "seller" || role === "buyer" || role === "user") {
          navigate("/")
        } else {
          toast.error("Invalid Role")
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid credentials. Please try again.")
    } finally {
      setLoading(false)
    }
  }

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
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-text-muted">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
            Start for free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[440px]">
        <div className="bg-bg-surface px-6 py-8 sm:rounded-2xl sm:px-10 border border-border-subtle shadow-sm">
          <form className="space-y-5" onSubmit={handleSubmit(submitHandler)}>
            <div>
              <label className="block text-sm font-medium text-text-main">Email address</label>
              <div className="mt-1.5">
                <input
                  type="email"
                  spellCheck="false"
                  placeholder="you@example.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address'
                    }
                  })}
                  className={`input-field ${errors.email ? '!border-red-500 !ring-red-500' : ''}`}
                />
              </div>
              {errors.email && (
                 <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-text-main">Password</label>
                <div className="text-sm">
                  <a href="#" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>
              <div className="mt-1.5 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Must be at least 6 characters'
                    }
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
              {errors.password && (
                 <p className="text-red-500 text-sm mt-1.5 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-border-subtle bg-bg-surface text-primary-600 focus:ring-primary-600"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-text-muted select-none">
                Keep me signed in
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-base py-3 mt-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  )
}
