'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { castVote } from '@/app/actions/vote';
import { useState, useRef, useEffect } from 'react';

// Helper for middle truncation
function formatName(name: string, isMobile: boolean) {
  if (!name) return name;
  const maxLength = isMobile ? 22 : 40;
  if (name.length <= maxLength) return name;
  const charsToShow = maxLength - 3; // for '...'
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return name.substring(0, frontChars) + '...' + name.substring(name.length - backChars);
}

function SubmitButton({ selectedCount }: { selectedCount: number }) {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      className="btn submit-btn" 
      disabled={pending || selectedCount === 0} 
      style={{ 
        width: '100%', 
        opacity: (selectedCount === 0 || pending) ? 0.5 : 1,
        transform: selectedCount > 0 && !pending ? 'scale(1.02)' : 'scale(1)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: selectedCount > 0 && !pending ? '0 4px 14px rgba(59, 130, 246, 0.4)' : 'none'
      }}
    >
      {pending ? 'Saving Votes...' : 'Save Votes'}
    </button>
  );
}

// Premium Custom Select Component
function CustomSelect({ value, onChange, options, placeholder, disabledOptions, isMobile }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current && !isMobile) {
      inputRef.current.focus();
    }
  }, [isOpen, isMobile]);

  const selectedOption = options.find((o: any) => o.value === value);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        className="select-trigger"
        onClick={() => {
          if (isOpen) setSearchQuery('');
          setIsOpen(!isOpen);
        }}
        style={{
          width: '100%',
          borderRadius: '8px',
          backgroundColor: 'rgba(15, 23, 42, 0.6)',
          border: isOpen ? '1px solid var(--primary)' : '1px solid var(--border)',
          color: value ? 'white' : '#94a3b8',
          fontWeight: value ? 'bold' : 'normal',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          boxShadow: isOpen ? '0 0 0 3px rgba(59, 130, 246, 0.2)' : 'none',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden'
        }}
      >
        <span suppressHydrationWarning>
          {selectedOption ? formatName(selectedOption.label, isMobile) : placeholder}
        </span>
        <div style={{
          position: 'absolute',
          right: '1rem',
          top: '50%',
          transform: isOpen ? 'translateY(-50%) rotate(180deg)' : 'translateY(-50%)',
          pointerEvents: 'none',
          color: isOpen ? 'var(--primary)' : '#94a3b8',
          fontSize: '0.8rem',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          ▼
        </div>
      </div>

      {isOpen && (
        <div 
          className="custom-scrollbar"
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            left: 0,
            right: 0,
            maxHeight: '280px',
            overflowY: 'auto',
            borderRadius: '12px',
            zIndex: 50,
            animation: 'dropdownFade 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(20px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          {/* Sticky Search Header */}
          <div style={{ 
            padding: '0.5rem', 
            position: 'sticky', 
            top: 0, 
            backgroundColor: 'rgba(15, 23, 42, 0.95)', 
            backdropFilter: 'blur(10px)',
            zIndex: 10,
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <input 
              ref={inputRef}
              type="text" 
              placeholder="Search classmate..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onClick={e => e.stopPropagation()}
              style={{
                width: '100%',
                padding: '0.6rem 0.8rem',
                borderRadius: '6px',
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border)',
                color: 'white',
                outline: 'none',
                fontSize: isMobile ? '0.9rem' : '1rem',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => e.target.style.borderColor = 'var(--primary)'}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div style={{ padding: '0.5rem' }}>
            <div
              onClick={() => { onChange(''); setIsOpen(false); setSearchQuery(''); }}
              className="select-option empty-option"
              style={{
                borderRadius: '8px',
                cursor: 'pointer',
                color: '#94a3b8',
                transition: 'all 0.2s ease',
                marginBottom: '0.25rem',
                fontStyle: 'italic'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              -- Leave empty --
            </div>

            {options
              .filter((opt: any) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((opt: any) => {
              const isDisabled = disabledOptions.includes(opt.value);
              const isSelected = value === opt.value;
              return (
                <div
                  key={opt.value}
                  className="select-option"
                  onClick={() => {
                    if (!isDisabled) {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery('');
                    }
                  }}
                  style={{
                    borderRadius: '8px',
                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                    color: isDisabled ? '#475569' : (isSelected ? 'var(--primary)' : '#e2e8f0'),
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2px'
                  }}
                  onMouseOver={e => {
                    if (!isDisabled && !isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                  }}
                  onMouseOut={e => {
                    if (!isDisabled && !isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span suppressHydrationWarning style={{ whiteSpace: 'nowrap' }}>
                    {formatName(opt.label, isMobile)}
                  </span>
                  {isDisabled && <span className="disabled-badge" style={{ color: '#475569', marginLeft: '0.5rem' }}>{isMobile ? '(Ranked)' : '(Already ranked)'}</span>}
                  {isSelected && <span style={{ color: 'var(--primary)', marginLeft: '0.5rem' }}>✓</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VoteClient({ classmates, currentUserId, initialVotes = [] }: { classmates: any[], currentUserId: string, initialVotes?: string[] }) {
  const [state, formAction] = useFormState(castVote, null);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 640px)');
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener('change', onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener('change', onChange);
  }, []);
  
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    const ids = [...initialVotes];
    while (ids.length < 3) ids.push('');
    return ids;
  });

  const updateRank = (index: number, id: string) => {
    setSelectedIds(prev => {
      const newIds = [...prev];
      newIds[index] = id;
      return newIds;
    });
  };

  const removeRank = (index: number) => {
    updateRank(index, '');
  };

  const ranks = [
    { label: 'Rank 1', points: 3, color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.1)' },
    { label: 'Rank 2', points: 2, color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.1)' },
    { label: 'Rank 3', points: 1, color: '#b45309', bg: 'rgba(180, 83, 9, 0.1)' }
  ];

  const activeVotesCount = selectedIds.filter(id => id).length;
  
  const classmateOptions = classmates.map(c => ({
    value: c.id,
    label: c.fullname
  })).sort((a, b) => a.label.localeCompare(b.label));

  return (
    <form action={formAction}>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dropdownFade {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }

        /* Responsive Styles */
        .rank-slot {
          padding: 1.25rem;
        }
        .rank-badge {
          width: 60px;
          height: 60px;
          margin-right: 1.5rem;
        }
        .rank-badge-pos {
          font-size: 1.2rem;
        }
        .rank-badge-pts {
          font-size: 0.7rem;
        }
        .rank-label {
          font-size: 0.85rem;
          margin-bottom: 0.4rem;
        }
        .select-trigger {
          padding: 0.75rem;
          font-size: 1.1rem;
        }
        .select-option {
          padding: 0.75rem 1rem;
          font-size: 1rem;
        }
        .empty-option {
          padding: 0.75rem 1rem;
        }
        .disabled-badge {
          font-size: 0.75rem;
        }
        .remove-btn {
          width: 40px;
          height: 40px;
          margin-left: 1.5rem;
        }
        .submit-btn {
          margin-top: 2rem;
          padding: 1rem;
          font-size: 1.1rem;
        }

        @media (max-width: 640px) {
          .rank-slot {
            padding: 0.8rem;
          }
          .rank-badge {
            width: 48px;
            height: 48px;
            margin-right: 0.8rem;
          }
          .rank-badge-pos {
            font-size: 1rem;
          }
          .rank-badge-pts {
            font-size: 0.6rem;
          }
          .rank-label {
            font-size: 0.7rem;
            margin-bottom: 0.25rem;
          }
          .select-trigger {
            padding: 0.6rem;
            font-size: 0.95rem;
          }
          .select-option {
            padding: 0.6rem 0.8rem;
            font-size: 0.9rem;
          }
          .empty-option {
            padding: 0.6rem 0.8rem;
          }
          .disabled-badge {
            font-size: 0.65rem;
          }
          .remove-btn {
            width: 32px;
            height: 32px;
            margin-left: 0.8rem;
            font-size: 0.8rem;
          }
          .submit-btn {
            margin-top: 1.5rem;
            padding: 0.8rem;
            font-size: 1rem;
          }
        }
      `}} />

      {state?.error && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--danger)', borderRadius: '8px', color: '#fca5a5' }}>
          {state.error}
        </div>
      )}
      {state?.success && (
        <div style={{ marginBottom: '1rem', padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', border: '1px solid var(--success)', borderRadius: '8px', color: '#6ee7b7' }}>
          Your votes have been successfully saved!
        </div>
      )}

      {/* Your Nominations Section */}
      <div style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 10 }}>
        {ranks.map((rank, index) => {
          const selectedId = selectedIds[index];
          
          return (
            <div 
              key={rank.label}
              className="glass rank-slot"
              style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '16px',
                border: `1px solid ${selectedId ? rank.color : 'rgba(255,255,255,0.1)'}`,
                backgroundColor: selectedId ? rank.bg : 'var(--card-bg)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                position: 'relative',
                zIndex: 100 - index,
                transform: selectedId ? 'translateY(-2px)' : 'none',
                boxShadow: selectedId ? `0 10px 30px ${rank.color}20` : '0 4px 20px rgba(0,0,0,0.1)'
              }}
            >
              <div 
                className="rank-badge"
                style={{ 
                  borderRadius: '50%', 
                  backgroundColor: rank.color, 
                  display: 'flex', 
                  flexDirection: 'column',
                  justifyContent: 'center', 
                  alignItems: 'center',
                  fontWeight: 'bold',
                  color: '#1e293b',
                  flexShrink: 0,
                  boxShadow: `0 8px 16px ${rank.color}40`,
                  transition: 'transform 0.3s ease',
                  transform: selectedId ? 'scale(1.05)' : 'scale(1)'
                }}
              >
                <div className="rank-badge-pos">#{index + 1}</div>
                <div className="rank-badge-pts">{rank.points} pts</div>
              </div>
              
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                <label className="rank-label" style={{ color: '#94a3b8', fontWeight: 500, letterSpacing: '0.5px' }}>
                  {index === 0 ? 'REQUIRED NOMINEE' : 'OPTIONAL NOMINEE'}
                </label>
                
                <CustomSelect
                  value={selectedId}
                  onChange={(val: string) => updateRank(index, val)}
                  options={classmateOptions}
                  placeholder={index === 0 ? '-- Select a classmate --' : '-- Leave empty --'}
                  disabledOptions={selectedIds.filter((id, i) => i !== index && id !== '')}
                  isMobile={isMobile}
                />
              </div>

              {selectedId && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => removeRank(index)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#fca5a5',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    flexShrink: 0
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.3)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  aria-label="Remove"
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      <input type="hidden" name="nomineeIds" value={JSON.stringify(selectedIds)} />

      <SubmitButton selectedCount={activeVotesCount} />
    </form>
  );
}
