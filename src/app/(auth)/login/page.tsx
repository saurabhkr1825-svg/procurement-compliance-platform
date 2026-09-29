"use client"

import { useState } from "react"
import { Eye, EyeOff, ShieldCheck, User } from "lucide-react"
import { login } from "@/app/(auth)/actions"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div 
      style={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        position: "relative",
        backgroundImage: "url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2070&auto=format&fit=crop')",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {/* Overlay - Dark Translucent */}
      <div 
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(rgba(10,20,30,0.25), rgba(10,20,30,0.45))",
          backdropFilter: "blur(2px)"
        }}
      />

      {/* Glass Login Card */}
      <div 
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "420px",
          backgroundColor: "rgba(255,255,255,0.12)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.40)",
          borderRadius: "24px",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
          padding: "40px"
        }}
      >
        
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
            <div style={{
              display: "flex",
              height: "40px",
              width: "40px",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.15)",
              border: "1px solid rgba(255,255,255,0.3)"
            }}>
              <ShieldCheck style={{ height: "20px", width: "20px", color: "#ffffff" }} />
            </div>
          </div>
          <h1 style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#ffffff", margin: 0 }}>
            Bid Compliance Copilot
          </h1>
          <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", letterSpacing: "1px", textTransform: "uppercase", margin: "4px 0 0 0" }}>
            Tender-aware • Evidence-linked • Officer-controlled
          </p>
        </div>

        {/* Welcome Text */}
        <div style={{ marginBottom: "32px", textAlign: "center" }}>
          <h2 style={{ fontSize: "30px", fontWeight: "700", color: "#ffffff", margin: 0, letterSpacing: "-0.5px" }}>
            Welcome back
          </h2>
          <p style={{ marginTop: "8px", fontSize: "14px", color: "rgba(255,255,255,0.75)" }}>
            Sign in to continue your procurement review.
          </p>
        </div>

        {/* Form */}
        <form action={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {error && (
            <div style={{ 
              padding: "12px", 
              fontSize: "14px", 
              color: "#ffcccc", 
              backgroundColor: "rgba(255,0,0,0.2)", 
              border: "1px solid rgba(255,0,0,0.4)", 
              borderRadius: "8px" 
            }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {/* Email Field */}
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "14px", top: "14px", color: "rgba(255,255,255,0.6)" }}>
                <User size={20} />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                style={{
                  width: "100%",
                  height: "50px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.30)",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  padding: "0 16px 0 44px",
                  fontSize: "15px",
                  color: "#ffffff",
                  outline: "none",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.8)"
                  e.target.style.backgroundColor = "rgba(255,255,255,0.12)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.30)"
                  e.target.style.backgroundColor = "rgba(255,255,255,0.08)"
                }}
              />
            </div>

            {/* Password Field */}
            <div style={{ position: "relative" }}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                required
                style={{
                  width: "100%",
                  height: "50px",
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.30)",
                  backgroundColor: "rgba(255,255,255,0.08)",
                  padding: "0 44px 0 16px",
                  fontSize: "15px",
                  color: "#ffffff",
                  outline: "none",
                  boxSizing: "border-box"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.8)"
                  e.target.style.backgroundColor = "rgba(255,255,255,0.12)"
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(255,255,255,0.30)"
                  e.target.style.backgroundColor = "rgba(255,255,255,0.08)"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "14px",
                  top: "14px",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  color: "rgba(255,255,255,0.6)"
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Form Actions (Remember / Forgot) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
              <input 
                type="checkbox" 
                name="remember"
                style={{
                  margin: 0,
                  width: "16px",
                  height: "16px",
                  cursor: "pointer"
                }}
              />
              <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.75)" }}>
                Remember me
              </span>
            </label>
            <a href="#" style={{ fontSize: "13px", color: "#ffffff", textDecoration: "none" }}>
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              height: "50px",
              borderRadius: "12px",
              background: "linear-gradient(to right, #2563eb, #0d9488)",
              border: "none",
              color: "#ffffff",
              fontSize: "16px",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "opacity 0.2s"
            }}
            onMouseOver={(e) => { if(!loading) e.currentTarget.style.opacity = "0.9" }}
            onMouseOut={(e) => { if(!loading) e.currentTarget.style.opacity = "1" }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>

          <div style={{ textAlign: "center", marginTop: "16px" }}>
            <span style={{ fontSize: "14px", color: "rgba(255,255,255,0.75)" }}>
              Don&apos;t have an account?{" "}
            </span>
            <a href="/signup" style={{ fontSize: "14px", color: "#ffffff", fontWeight: "600", textDecoration: "none" }}>
              Sign Up
            </a>
          </div>
        </form>

        {/* Footer */}
        <div style={{ marginTop: "32px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.55)", margin: 0 }}>
            Authorized procurement workspace
          </p>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        input::placeholder { color: rgba(255,255,255,0.6) !important; }
      `}} />
    </div>
  )
}
