'use client';

import { useState } from 'react';

import { useSignupForm } from './SignupForm.hooks';

export function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);

  const { email, password, loading, formError, fieldErrors, handleEmailChange, handlePasswordChange, handleSubmit } =
    useSignupForm();

  return (
    <form onSubmit={handleSubmit}>
      {formError && <div className="alert alert-danger">{formError}</div>}

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
          value={email}
          placeholder="you@example.com"
          onChange={handleEmailChange}
          required
        />
        {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Password</label>
        <div className={`input-group ${fieldErrors.password ? 'has-validation' : ''}`}>
          <input
            type={showPassword ? 'text' : 'password'}
            className={`form-control ${fieldErrors.password ? 'is-invalid' : ''}`}
            value={password}
            onChange={handlePasswordChange}
            required
            aria-describedby="password-toggle"
          />

          <button
            type="button"
            className="btn btn-outline-secondary"
            id="password-toggle"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} />
          </button>

          {fieldErrors.password && <div className="invalid-feedback d-block">{fieldErrors.password}</div>}
        </div>
      </div>

      <button className="btn btn-primary w-100" disabled={loading}>
        {loading ? 'Creating account…' : 'Sign up'}
      </button>
    </form>
  );
}
