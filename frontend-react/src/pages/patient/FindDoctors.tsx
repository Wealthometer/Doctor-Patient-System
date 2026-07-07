import { useState, useEffect } from 'react';
import { doctorApi } from '../../api/services';
import type { DoctorResponse } from '../../types';
import { Spinner, EmptyState, Pagination, Modal } from '../../components/UI';
import { Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function FindDoctors() {
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<DoctorResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [selected, setSelected] = useState<DoctorResponse | null>(null);
  const [rating, setRating] = useState({ doctorId: '', value: 5, comment: '' });
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);

  const load = async (p: number, q: string, dept: string, spec: string) => {
    setLoading(true);
    try {
      let res;
      if (q.length > 2) {
        res = await doctorApi.search(q, p);
      } else if (dept) {
        res = await doctorApi.getAll(p); // filter client-side since /department/{dept}/active returns list not page
      } else if (spec) {
        // GET /doctors/specialization/{specialization} is paginated
        const r = await doctorApi.getAll(p, 20);
        res = { ...r, content: r.content.filter(d => d.specialization.toLowerCase().includes(spec.toLowerCase())) };
      } else {
        res = await doctorApi.getAll(p);
      }
      setDoctors(res.content.filter(d => d.status === 'ACTIVE'));
      setTotalPages(res.totalPages);
    } catch { toast.error('Failed to load doctors'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(page, search, department, specialization); }, [page, search, department, specialization]);

  const handleRatingSubmit = async () => {
    if (!rating.doctorId) return;
    setRatingSubmitting(true);
    try {
      await doctorApi.submitRating(rating.doctorId, { rating: rating.value, comment: rating.comment });
      toast.success('Rating submitted! Thank you.');
      setShowRatingModal(false);
      setRating({ doctorId: '', value: 5, comment: '' });
      load(page, search, department, specialization);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to submit rating');
    } finally { setRatingSubmitting(false); }
  };

  // Collect unique departments and specializations
  const departments = [...new Set(doctors.map(d => d.department))].sort();
  const specializations = [...new Set(doctors.map(d => d.specialization))].sort();

  return (
    <div>
      <div className="page-header">
        <div><h1>Find Doctors</h1><p>Browse available doctors and specialists</p></div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ width: 280 }}>
          <span>🔍</span>
          <input placeholder="Search by name, specialization…" value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }} />
        </div>
        <select className="form-control" style={{ width: 200 }} value={department}
          onChange={e => { setDepartment(e.target.value); setPage(0); }}>
          <option value="">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="form-control" style={{ width: 220 }} value={specialization}
          onChange={e => { setSpecialization(e.target.value); setPage(0); }}>
          <option value="">All Specializations</option>
          {specializations.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        {(search || department || specialization) && (
          <button className="btn btn-ghost" onClick={() => { setSearch(''); setDepartment(''); setSpecialization(''); setPage(0); }}>
            Clear filters
          </button>
        )}
      </div>

      {loading ? <Spinner /> : doctors.length === 0 ? <EmptyState message="No doctors found matching your criteria" /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {doctors.map(doc => (
            <div key={doc.id} className="card" style={{ overflow: 'hidden' }}>
              {/* Card header */}
              <div style={{ padding: '20px 20px 16px', display: 'flex', gap: 14 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-accent) 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: 18,
                }}>
                  {doc.firstName[0]}{doc.lastName[0]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>Dr. {doc.firstName} {doc.lastName}</div>
                  <div style={{ fontSize: 12, color: 'var(--clr-text-muted)', marginTop: 2 }}>{doc.specialization}</div>
                  <div style={{ fontSize: 12, color: 'var(--clr-text-muted)' }}>{doc.department}</div>
                </div>
              </div>

              {/* Details */}
              <div style={{ padding: '0 20px 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 12 }}>
                  {doc.yearsOfExperience && (
                    <div style={{ fontSize: 12 }}>
                      <span style={{ color: 'var(--clr-text-muted)' }}>Experience: </span>
                      <span style={{ fontWeight: 500 }}>{doc.yearsOfExperience} yrs</span>
                    </div>
                  )}
                  {doc.consultationFee && (
                    <div style={{ fontSize: 12 }}>
                      <span style={{ color: 'var(--clr-text-muted)' }}>Fee: </span>
                      <span style={{ fontWeight: 500 }}>${doc.consultationFee}</span>
                    </div>
                  )}
                  {doc.workStartTime && (
                    <div style={{ fontSize: 12 }}>
                      <span style={{ color: 'var(--clr-text-muted)' }}>Hours: </span>
                      <span style={{ fontWeight: 500 }}>{doc.workStartTime}–{doc.workEndTime}</span>
                    </div>
                  )}
                  {doc.averageRating && (
                    <div style={{ fontSize: 12 }}>
                      <Star size={16} /> <span style={{ fontWeight: 500 }}>{doc.averageRating.toFixed(1)}</span>
                      <span style={{ color: 'var(--clr-text-muted)' }}> ({doc.totalRatings})</span>
                    </div>
                  )}
                </div>

                {doc.bio && (
                  <p style={{ fontSize: 12, color: 'var(--clr-text-muted)', lineHeight: 1.5, marginBottom: 12,
                    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {doc.bio}
                  </p>
                )}

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setSelected(doc)}>
                    View Profile
                  </button>
                  <button className="btn btn-ghost btn-sm" onClick={() => {
                    setRating({ doctorId: doc.id, value: 5, comment: '' });
                    setShowRatingModal(true);
                  }}>
                    <Star size={16} /> Rate
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* Doctor detail modal */}
      {selected && (
        <Modal open onClose={() => setSelected(null)} title={`Dr. ${selected.firstName} ${selected.lastName}`} maxWidth="640px">
          <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, var(--clr-primary) 0%, var(--clr-accent) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: 24,
            }}>
              {selected.firstName[0]}{selected.lastName[0]}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>Dr. {selected.firstName} {selected.lastName}</div>
              <div style={{ color: 'var(--clr-text-muted)', fontSize: 13 }}>{selected.specialization} • {selected.department}</div>
              {selected.averageRating && (
                <div style={{ marginTop: 4, fontSize: 13 }}>
                  <Star size={16} /> {selected.averageRating.toFixed(1)} ({selected.totalRatings} reviews)
                </div>
              )}
            </div>
          </div>

          <div className="info-grid" style={{ marginBottom: 16 }}>
            <div className="info-item"><div className="info-label">Phone</div><div className="info-value">{selected.phone}</div></div>
            <div className="info-item"><div className="info-label">Email</div><div className="info-value">{selected.email}</div></div>
            <div className="info-item"><div className="info-label">License #</div><div className="info-value">{selected.licenseNumber}</div></div>
            <div className="info-item"><div className="info-label">Experience</div><div className="info-value">{selected.yearsOfExperience ? `${selected.yearsOfExperience} years` : '—'}</div></div>
            <div className="info-item"><div className="info-label">Consultation Fee</div><div className="info-value">{selected.consultationFee ? `$${selected.consultationFee}` : '—'}</div></div>
            <div className="info-item"><div className="info-label">Work Hours</div><div className="info-value">{selected.workStartTime && selected.workEndTime ? `${selected.workStartTime} – ${selected.workEndTime}` : '—'}</div></div>
            <div className="info-item"><div className="info-label">Work Days</div><div className="info-value">{selected.workDays || '—'}</div></div>
            <div className="info-item"><div className="info-label">Max Daily Appts</div><div className="info-value">{selected.maxDailyAppointments || '—'}</div></div>
          </div>

          {selected.bio && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 6 }}>ABOUT</div>
              <p style={{ fontSize: 13, lineHeight: 1.6 }}>{selected.bio}</p>
            </div>
          )}
          {selected.qualifications && (
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--clr-text-muted)', marginBottom: 6 }}>QUALIFICATIONS</div>
              <p style={{ fontSize: 13, lineHeight: 1.6 }}>{selected.qualifications}</p>
            </div>
          )}
        </Modal>
      )}

      {/* Rating modal */}
      <Modal open={showRatingModal} onClose={() => setShowRatingModal(false)} title="Rate Doctor"
        footer={<>
          <button className="btn btn-ghost" onClick={() => setShowRatingModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleRatingSubmit} disabled={ratingSubmitting}>
            {ratingSubmitting ? 'Submitting…' : 'Submit Rating'}
          </button>
        </>}>
        <div className="form-group">
          <label className="form-label">Rating</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setRating(r => ({ ...r, value: n }))}
                style={{ fontSize: 28, background: 'none', border: 'none', cursor: 'pointer', opacity: n <= rating.value ? 1 : 0.3 }}>
                <Star size={20} />
              </button>
            ))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--clr-text-muted)' }}>
            {rating.value === 1 ? 'Poor' : rating.value === 2 ? 'Fair' : rating.value === 3 ? 'Good' : rating.value === 4 ? 'Very Good' : 'Excellent'}
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Comment (optional)</label>
          <textarea className="form-control" rows={3}
            placeholder="Share your experience with this doctor…"
            value={rating.comment} onChange={e => setRating(r => ({ ...r, comment: e.target.value }))} />
        </div>
      </Modal>
    </div>
  );
}
