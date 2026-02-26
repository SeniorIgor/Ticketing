'use client';

import { useCreateTicketForm } from './CreateTicketForm.hooks';

export function CreateTicketForm() {
  const { title, price, loading, fieldErrors, formError, handleTitleChange, handlePriceChange, handleSubmit } =
    useCreateTicketForm();

  return (
    <form onSubmit={handleSubmit}>
      {formError && <div className="alert alert-danger">{formError}</div>}

      <div className="mb-3">
        <label className="form-label">Title</label>
        <input
          className={`form-control ${fieldErrors.title ? 'is-invalid' : ''}`}
          value={title}
          onChange={handleTitleChange}
          placeholder="Concert ticket"
          required
        />
        {fieldErrors.title && <div className="invalid-feedback">{fieldErrors.title}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Price (USD)</label>
        <div className="input-group">
          <span className="input-group-text">$</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            className={`form-control ${fieldErrors.price ? 'is-invalid' : ''}`}
            value={price}
            onChange={handlePriceChange}
            placeholder="99.99"
            required
          />
          {fieldErrors.price && <div className="invalid-feedback">{fieldErrors.price}</div>}
        </div>
        <div className="form-text">Enter a non-negative amount.</div>
      </div>

      <button className="btn btn-success w-100" disabled={loading}>
        {loading ? 'Creating…' : 'Create ticket'}
      </button>
    </form>
  );
}
