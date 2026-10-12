import { useEffect, useRef, useState } from 'react';
import { Activity, ArrowUpRight, BookOpen, GraduationCap, HeartHandshake, Layers3, ShieldCheck, Sparkles, Users } from 'lucide-react';
import MemberForm from './components/MemberForm';
import MemberTable from './components/MemberTable';
import { useMembers } from './hooks/useMembers';
import type { Member, MemberPayload } from './types';

function apiErrorMessage(error: unknown) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    if (response?.data?.message) return response.data.message;
    if (!response) return 'The API could not be reached. Check that Express is running on port 3000.';
  }
  if (error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}

export default function App() {
  const [search, setSearch] = useState('');
  const [clubFilter, setClubFilter] = useState('');
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { members, loading, error, refresh, createMember, updateMember, deleteMember } = useMembers(search, clubFilter);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
      if (event.key === 'Escape' && document.activeElement === searchInputRef.current) {
        setSearch('');
        searchInputRef.current?.blur();
      }
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  async function handleSave(payload: MemberPayload) {
    setSaving(true);
    setNotice(null);
    try {
      if (editingMember) {
        await updateMember(editingMember.id, payload);
        setNotice({ type: 'success', message: `${payload.fullName}’s membership details were updated.` });
        setEditingMember(null);
        setSearch('');
        setClubFilter('');
      } else {
        await createMember(payload);
        setNotice({ type: 'success', message: `${payload.fullName} has been registered successfully.` });
        setSearch('');
        setClubFilter('');
      }
    } catch (saveError) {
      throw saveError;
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(member: Member) {
    const confirmed = window.confirm(`Delete ${member.fullName} from the club directory? This cannot be undone.`);
    if (!confirmed) return;
    setNotice(null);
    void deleteMember(member.id).then(() => {
      setNotice({ type: 'success', message: `${member.fullName} was removed from the directory.` });
      if (editingMember?.id === member.id) setEditingMember(null);
    }).catch((deleteError: unknown) => {
      setNotice({ type: 'error', message: apiErrorMessage(deleteError) });
    });
  }

  const clubCount = new Set(members.map((member) => member.club)).size;
  const volunteerCount = members.filter((member) => member.membershipType === 'Volunteer').length;
  const committeeCount = members.filter((member) => member.membershipType === 'Committee Member').length;

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-lockup">
          <div className="brand-mark"><Layers3 size={21} strokeWidth={2.4} /></div>
          <div className="brand-copy"><span>clubhouse</span><small>MEMBERSHIP PORTAL</small></div>
        </div>
        <div className="topbar-right">
          <div className="system-status"><span className="live-dot" /> Registration open</div>
          <div className="topbar-divider" />
          <div className="account-chip"><span className="account-avatar"><GraduationCap size={17} /></span><span><strong>Club administrator</strong><small>Campus community</small></span></div>
        </div>
      </header>

      <main className="page-content">
        <section className="welcome-row">
          <div>
            <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>Memberships</strong></div>
            <div className="hero-title-row"><div><p className="eyebrow hero-eyebrow">YOUR CAMPUS, YOUR COMMUNITY</p><h1>Make room for <span>belonging.</span></h1></div><div className="hero-sparkle"><Sparkles size={23} /></div></div>
            <p className="hero-subtitle">Bring people together around shared interests. Register new members and keep your club community organized in one place.</p>
          </div>
          <div className="hero-note"><div className="hero-note-icon"><HeartHandshake size={22} /></div><div><strong>Great things start together.</strong><p>Every membership is a new connection.</p></div><ArrowUpRight className="hero-note-arrow" size={17} /></div>
        </section>

        <section className="stats-grid" aria-label="Membership summary">
          <article className="stat-card stat-primary"><div className="stat-top"><span className="stat-icon"><Users size={18} /></span><span className="stat-label">MEMBERS FOUND</span></div><div className="stat-number">{loading ? '—' : members.length.toLocaleString()}</div><div className="stat-foot"><span className="stat-foot-dot" /> Current directory results</div><div className="stat-decoration stat-decoration-one" /></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-icon icon-blue"><BookOpen size={18} /></span><span className="stat-label">CLUBS REPRESENTED</span></div><div className="stat-number">{loading ? '—' : clubCount.toString().padStart(2, '0')}</div><div className="stat-foot">Across selected members</div><div className="mini-bars"><i /><i /><i /><i /><i /></div></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-icon icon-green"><HeartHandshake size={18} /></span><span className="stat-label">VOLUNTEERS</span></div><div className="stat-number">{loading ? '—' : volunteerCount.toString().padStart(2, '0')}</div><div className="stat-foot">Members ready to lend a hand</div><div className="stat-scribble">✳</div></article>
          <article className="stat-card"><div className="stat-top"><span className="stat-icon icon-amber"><ShieldCheck size={18} /></span><span className="stat-label">COMMITTEE</span></div><div className="stat-number">{loading ? '—' : committeeCount.toString().padStart(2, '0')}</div><div className="stat-foot">Helping clubs move forward</div><div className="stat-circle-decoration" /></article>
        </section>

        {notice && <div className={`notice notice-${notice.type}`} role="status"><span className="notice-symbol">{notice.type === 'success' ? '✓' : '!'}</span><span>{notice.message}</span><button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification">×</button></div>}

        <section className="workspace-grid">
          <MemberForm editingMember={editingMember} saving={saving} onSave={handleSave} onCancelEdit={() => setEditingMember(null)} />
          <MemberTable members={members} loading={loading} error={error} search={search} clubFilter={clubFilter} searchInputRef={searchInputRef} onSearchChange={setSearch} onClubChange={setClubFilter} onEdit={(member) => { setEditingMember(member); setNotice(null); }} onDelete={handleDelete} onRetry={() => void refresh()} />
        </section>

        <footer className="page-footer"><span>© 2026 Clubhouse Membership Portal</span><span><Activity size={14} /> Built for campus communities <span className="footer-separator">·</span> <kbd>Ctrl</kbd> + <kbd>K</kbd> to search</span></footer>
      </main>
    </div>
  );
}
