import React, { useEffect, useState } from 'react';
import { getRevenueAudit } from '../services/api';
import './RevenueAudit.css';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const RevenueAudit = () => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(11); // start with November
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState({ totals: {}, bookings: [] });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await getRevenueAudit(year, month);
      if (resp.success) {
        setData(resp);
      } else {
        setError(resp.error || 'Failed to load revenue audit');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load revenue audit');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const formatCurrency = (val) => {
    if (val === undefined || val === null) return '$0';
    return '$' + Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    // Parse YYYY-MM-DD directly to avoid timezone issues
    const parts = dateStr.substring(0, 10).split('-');
    if (parts.length !== 3) return dateStr;
    const [yearPart, monthPart, dayPart] = parts;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[parseInt(monthPart, 10) - 1]} ${parseInt(dayPart, 10)}, ${yearPart}`;
  };

  return (
    <div className="revenue-audit">
      <div className="audit-header">
        <div>
          <h2>📊 Revenue Audit — {MONTH_NAMES[month - 1]} {year}</h2>
          <p>Detailed booking breakdown with room rate, tax, fees, and totals.</p>
        </div>
        <form className="audit-filters" onSubmit={handleSubmit}>
          <label>
            Month
            <input
              type="number"
              min="1"
              max="12"
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10) || 1)}
            />
          </label>
          <label>
            Year
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10) || now.getFullYear())}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : 'Run Audit'}
          </button>
        </form>
      </div>

      {error && <div className="audit-error">⚠️ {error}</div>}

      <section className="audit-summary">
        <div className="summary-card">
          <div className="label">Room Rate</div>
          <div className="value">{formatCurrency(data.totals?.roomRate)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Tax</div>
          <div className="value">{formatCurrency(data.totals?.tax)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Fees</div>
          <div className="value">{formatCurrency(data.totals?.fees)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Total Revenue</div>
          <div className="value">{formatCurrency(data.totals?.total)}</div>
        </div>
        <div className="summary-card">
          <div className="label">Bookings</div>
          <div className="value">{data.count || 0}</div>
        </div>
      </section>

      <section className="audit-table-section">
        <div className="table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>Reservation ID</th>
                <th>Guest</th>
                <th>Room Type</th>
                <th>Check-in</th>
                <th>Room Rate</th>
                <th>Tax</th>
                <th>Fees</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr className="loading-row">
                  <td colSpan="8">Loading revenue data...</td>
                </tr>
              )}
              {!loading && data.bookings && data.bookings.length === 0 && (
                <tr className="empty-row">
                  <td colSpan="8">No bookings found for {MONTH_NAMES[month - 1]} {year}.</td>
                </tr>
              )}
              {!loading && data.bookings && data.bookings.map((b) => (
                <tr key={b.reservationID}>
                  <td>{b.reservationID}</td>
                  <td>{b.guestName || 'Unknown Guest'}</td>
                  <td>{b.roomType || 'Unknown'}</td>
                  <td>{formatDate(b.checkIn)}</td>
                  <td>{formatCurrency(b.roomRate)}</td>
                  <td>{formatCurrency(b.tax)}</td>
                  <td>{formatCurrency(b.fees)}</td>
                  <td>{formatCurrency(b.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default RevenueAudit;
