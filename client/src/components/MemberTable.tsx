import { useState, type RefObject } from 'react';
import { ArrowDownUp, Edit3, Mail, MoreHorizontal, Phone, Search, Trash2, UsersRound } from 'lucide-react';
import { CLUBS } from '../types';
import type { Member } from '../types';

interface MemberTableProps {
  members: Member[];
  loading: boolean;
  error: string | null;
  search: string;
  clubFilter: string;
  searchInputRef: RefObject<HTMLInputElement | null>;
  onSearchChange: (value: string) => void;
  onClubChange: (value: string) => void;
  onEdit: (member: Member) => void;
  onDelete: (member: Member) => void;
  onRetry: () => void;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || '').join('');
}

function formatDate(date: string) {
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '—';
  return new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' }).format(parsed);
}

export default function MemberTable({ members, loading, error, search, clubFilter, searchInputRef, onSearchChange, onClubChange, onEdit, onDelete, onRetry }: MemberTableProps) {
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const sortedMembers = [...members].sort((a, b) => {
    const difference = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    return sortNewestFirst ? -difference : difference;
  });

  return (
    <section className="panel directory-panel" aria-labelledby="directory-heading">
      <div className="panel-heading directory-heading">
        <div className="heading-icon heading-icon-blue"><UsersRound size={19} /></div>
        <div className="directory-heading-copy">
          <p className="eyebrow">MEMBER DIRECTORY</p>
          <h2 id="directory-heading">Club members <span className="count-pill">{members.length}</span></h2>
          <p className="panel-subtitle">Browse, search, and manage registered members.</p>
        </div>
      </div>

      <div className="directory-toolbar">
        <div className="search-control">
          <Search size={17} aria-hidden="true" />
          <input ref={searchInputRef} type="search" aria-label="Search members" placeholder="Search name, email or club…" value={search} onChange={(event) => onSearchChange(event.target.value)} />
          {search && <button type="button" className="clear-search" onClick={() => onSearchChange('')} aria-label="Clear search">×</button>}
        </div>
        <div className="filter-control">
          <label htmlFor="club-filter">Club</label>
          <select id="club-filter" value={clubFilter} onChange={(event) => onClubChange(event.target.value)}>
            <option value="">All clubs</option>
            {CLUBS.map((club) => <option key={club} value={club}>{club}</option>)}
          </select>
        </div>
        <button type="button" className="sort-button" onClick={() => setSortNewestFirst((current) => !current)} title={sortNewestFirst ? 'Sort oldest first' : 'Sort newest first'} aria-label="Toggle member order">
          <ArrowDownUp size={16} />
        </button>
      </div>

      {error && (
        <div className="directory-error" role="alert">
          <div><strong>Could not load members</strong><p>{error}</p></div>
          <button type="button" className="button button-quiet retry-button" onClick={onRetry}>Retry</button>
        </div>
      )}

      {loading ? (
        <div className="loading-state"><span className="large-spinner" aria-hidden="true" /><strong>Loading members…</strong><span>Getting the latest registrations.</span></div>
      ) : !error && sortedMembers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><UsersRound size={25} /></div>
          <h3>{search || clubFilter ? 'No matching members' : 'Your directory is ready'}</h3>
          <p>{search || clubFilter ? 'Try another search term or choose a different club.' : 'New registrations will appear here once submitted.'}</p>
          {(search || clubFilter) && <button type="button" className="button button-quiet" onClick={() => { onSearchChange(''); onClubChange(''); }}>Clear filters</button>}
        </div>
      ) : (
        <>
          <div className="table-wrap">
            <table className="members-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Club &amp; type</th>
                  <th>Contact</th>
                  <th>Joined</th>
                  <th><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {sortedMembers.map((member) => (
                  <tr key={member.id}>
                    <td>
                      <div className="member-cell">
                        <span className={`avatar avatar-${(member.id % 5) + 1}`}>{initials(member.fullName)}</span>
                        <span className="member-identification">
                          <strong>{member.fullName}</strong>
                          <small>{member.studentId || `Member #${member.id}`}</small>
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="club-name">{member.club}</span>
                      <span className={`membership-badge ${member.membershipType === 'Volunteer' ? 'badge-green' : member.membershipType === 'Committee Member' ? 'badge-purple' : 'badge-neutral'}`}>{member.membershipType}</span>
                    </td>
                    <td>
                      <div className="contact-cell"><span><Mail size={13} /> {member.email}</span><span><Phone size={13} /> {member.phone}</span></div>
                    </td>
                    <td className="date-cell">{formatDate(member.createdAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button type="button" className="icon-button edit-action" onClick={() => onEdit(member)} aria-label={`Edit ${member.fullName}`} title="Edit member"><Edit3 size={15} /></button>
                        <button type="button" className="icon-button delete-action" onClick={() => onDelete(member)} aria-label={`Delete ${member.fullName}`} title="Delete member"><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="directory-footer">
            <span>Showing <strong>{sortedMembers.length}</strong> {sortedMembers.length === 1 ? 'member' : 'members'}</span>
            <span className="footer-note"><span className="live-dot" /> Synced with database</span>
          </div>
        </>
      )}
      <div className="table-mobile-tip"><MoreHorizontal size={15} /> Select a row action to edit or remove a member.</div>
    </section>
  );
}
