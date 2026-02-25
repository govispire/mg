import React, { useState, useEffect } from 'react';
import './TeamStudy.css';

const TeamStudy = () => {
    const [view, setView] = useState('grid');
    const [tab, setTab] = useState('Daily');
    const [filter, setFilter] = useState('All');
    const [toast, setToast] = useState({ show: false, msg: '', type: 'success' });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [joinCode, setJoinCode] = useState('');

    const showToast = (msg: string, type = 'success') => {
        setToast({ show: true, msg, type });
        setTimeout(() => setToast({ show: false, msg: '', type: 'success' }), 3000);
    };

    const copyCode = (code: string) => {
        navigator.clipboard?.writeText(code).catch(() => { });
        showToast(`Copied: ${code}`, 'success');
    };

    const handleCreate = () => {
        setIsCreateModalOpen(false);
        showToast('Team created! Code: MN2026', 'success');
    };

    const handleJoin = () => {
        const v = joinCode.trim().toUpperCase();
        if (!v) {
            showToast('Please enter a team code', 'error');
            return;
        }
        const valid = ['UW2026', 'PM2024', 'SB2026', 'AP2026', 'SG2026', 'BP2026'];
        if (valid.includes(v)) {
            showToast(`Joined team: ${v} 🎉`, 'success');
        } else {
            showToast('Invalid code. Try again.', 'error');
        }
        setJoinCode('');
    };

    const scrollToJoin = () => {
        const el = document.getElementById('joinCodeInput');
        if (el) {
            el.focus();
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            showToast('Enter your team code below!', 'success');
        }
    };

    // Animate progress bars on load
    useEffect(() => {
        setTimeout(() => {
            document.querySelectorAll('.tcp-fill').forEach((bar) => {
                const w = (bar as HTMLElement).dataset.width;
                if (w) (bar as HTMLElement).style.width = w;
            });
        }, 100);
    }, []);

    return (
        <div className="peer-study-container">
            {/* HERO */}
            <section className="hero-band fade-up">
                <div className="hero-text">
                    <h1>
                        Study Together,<br />
                        <em>Succeed Together</em>
                    </h1>
                    <p>
                        Build your dream study squad. Take mock tests as a team, track everyone's progress, and climb the leaderboard together.
                    </p>
                    <div className="hero-ctas">
                        <button className="peer-btn peer-btn-primary" onClick={() => setIsCreateModalOpen(true)}>
                            ➕ Create New Team
                        </button>
                        <button className="peer-btn peer-btn-ghost" onClick={scrollToJoin}>
                            🔑 Join a Team
                        </button>
                    </div>
                </div>
                <div className="hero-stats">
                    <div className="hero-stat-card fade-up">
                        <div className="hsc-icon">👥</div>
                        <div className="hsc-val">3</div>
                        <div className="hsc-label">Active Teams</div>
                    </div>
                    <div className="hero-stat-card fade-up">
                        <div className="hsc-icon">🏆</div>
                        <div className="hsc-val">#12</div>
                        <div className="hsc-label">Best Rank</div>
                    </div>
                    <div className="hero-stat-card fade-up">
                        <div className="hsc-icon">🔥</div>
                        <div className="hsc-val">15</div>
                        <div className="hsc-label">Day Streak</div>
                    </div>
                    <div className="hero-stat-card fade-up">
                        <div className="hsc-icon">🧪</div>
                        <div className="hsc-val">28</div>
                        <div className="hsc-label">Tests Taken</div>
                    </div>
                </div>
            </section>

            {/* MY TEAMS */}
            <section>
                <div className="section-head fade-up">
                    <div>
                        <h2>My Teams</h2>
                        <p>Manage and explore your study groups</p>
                    </div>
                    <div className="section-head-right">
                        <div className="pill-toggle">
                            <button
                                className={view === 'grid' ? 'active' : ''}
                                onClick={() => setView('grid')}
                            >
                                ⊞ Grid
                            </button>
                            <button
                                className={view === 'list' ? 'active' : ''}
                                onClick={() => setView('list')}
                            >
                                ☰ List
                            </button>
                        </div>
                        <select className="select-input">
                            <option>Most Recent</option>
                            <option>Best Rank</option>
                            <option>Most Active</option>
                        </select>
                    </div>
                </div>

                <div className="teams-grid" style={{ gridTemplateColumns: view === 'list' ? '1fr' : '' }}>
                    {/* Card 1 */}
                    <div className="team-card fade-up">
                        <div className="tc-top">
                            <div className="tc-deco"></div>
                            <div className="tc-header">
                                <div className="tc-avatar">UW</div>
                                <span className="tc-role role-admin">Admin</span>
                            </div>
                            <div className="tc-name-row">
                                <div className="tc-name">UPSC Warriors 2026</div>
                                <div className="tc-code">
                                    <code>UW2026</code>
                                    <button className="copy-btn" onClick={() => copyCode('UW2026')}>📋</button>
                                </div>
                            </div>
                        </div>
                        <div className="tc-body">
                            <div className="tc-members">
                                <div className="avatars">
                                    <div className="av">R</div>
                                    <div className="av">P</div>
                                    <div className="av">S</div>
                                    <div className="av">A</div>
                                    <div className="av-more">+1</div>
                                </div>
                                <span className="member-count">5 members</span>
                            </div>
                            <div className="tc-stats">
                                <div className="tcs">
                                    <div className="tcs-label">Rank</div>
                                    <div className="tcs-val">
                                        #12 <span className="tcs-trend trend-up">↑5</span>
                                    </div>
                                </div>
                                <div className="tcs">
                                    <div className="tcs-label">Avg Score</div>
                                    <div className="tcs-val">76.5%</div>
                                </div>
                                <div className="tcs">
                                    <div className="tcs-label">Streak</div>
                                    <div className="tcs-val">🔥 15</div>
                                </div>
                                <div className="tcs">
                                    <div className="tcs-label">Tests</div>
                                    <div className="tcs-val">28</div>
                                </div>
                            </div>
                            <div className="tc-progress">
                                <div className="tcp-row">
                                    <span className="tcp-label">Team Goal</span>
                                    <span className="tcp-pct">68%</span>
                                </div>
                                <div className="tcp-track">
                                    <div
                                        className="tcp-fill"
                                        style={{ width: '0%' }}
                                        data-width="68%"
                                    ></div>
                                </div>
                            </div>
                            <div className="tc-badges">
                                <span className="peer-badge badge-gold">🏅 Top 20</span>
                                <span className="peer-badge badge-fire">🔥 15-day</span>
                            </div>
                            <div className="tc-actions">
                                <button
                                    className="btn-card-primary"
                                    onClick={() => showToast('Opening UPSC Warriors…', 'success')}
                                >
                                    View Details
                                </button>
                                <button
                                    className="btn-card-secondary"
                                    onClick={() => showToast('Launching team test…', 'success')}
                                >
                                    🧪 Test
                                </button>
                                <button
                                    className="btn-card-icon"
                                    title="Settings"
                                    onClick={() => showToast('Settings opened', 'success')}
                                >
                                    ⚙️
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="team-card fade-up">
                        <div className="tc-top">
                            <div className="tc-deco"></div>
                            <div className="tc-header">
                                <div className="tc-avatar">PM</div>
                                <span className="tc-role role-member">Member</span>
                            </div>
                            <div className="tc-name-row">
                                <div className="tc-name">Polity Masters</div>
                                <div className="tc-code">
                                    <code>PM2024</code>
                                    <button className="copy-btn" onClick={() => copyCode('PM2024')}>📋</button>
                                </div>
                            </div>
                        </div>
                        <div className="tc-body">
                            <div className="tc-members">
                                <div className="avatars">
                                    <div className="av">M</div>
                                    <div className="av">K</div>
                                    <div className="av">T</div>
                                    <div className="av">N</div>
                                </div>
                                <span className="member-count">4 members</span>
                            </div>
                            <div className="tc-stats">
                                <div className="tcs">
                                    <div className="tcs-label">Rank</div>
                                    <div className="tcs-val">
                                        #45 <span className="tcs-trend trend-down">↓2</span>
                                    </div>
                                </div>
                                <div className="tcs">
                                    <div className="tcs-label">Avg Score</div>
                                    <div className="tcs-val">68.2%</div>
                                </div>
                                <div className="tcs">
                                    <div className="tcs-label">Streak</div>
                                    <div className="tcs-val">🔥 7</div>
                                </div>
                                <div className="tcs">
                                    <div className="tcs-label">Tests</div>
                                    <div className="tcs-val">15</div>
                                </div>
                            </div>
                            <div className="tc-progress">
                                <div className="tcp-row">
                                    <span className="tcp-label">Team Goal</span>
                                    <span className="tcp-pct">42%</span>
                                </div>
                                <div className="tcp-track">
                                    <div
                                        className="tcp-fill"
                                        style={{ width: '0%' }}
                                        data-width="42%"
                                    ></div>
                                </div>
                            </div>
                            <div className="tc-badges">
                                <span className="peer-badge badge-accent">📈 Rising</span>
                            </div>
                            <div className="tc-actions">
                                <button
                                    className="btn-card-primary"
                                    onClick={() => showToast('Opening Polity Masters…', 'success')}
                                >
                                    View Details
                                </button>
                                <button
                                    className="btn-card-secondary"
                                    onClick={() => showToast('Launching team test…', 'success')}
                                >
                                    🧪 Test
                                </button>
                                <button
                                    className="btn-card-icon"
                                    title="Leave"
                                    onClick={() => showToast('Left Polity Masters', 'success')}
                                >
                                    🚪
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="team-card fade-up">
                        <div className="tc-top">
                            <div className="tc-deco"></div>
                            <div className="tc-header">
                                <div className="tc-avatar">SB</div>
                                <span className="tc-role role-member">Member</span>
                            </div>
                            <div className="tc-name-row">
                                <div className="tc-name">Study Buddies</div>
                                <div className="tc-code">
                                    <code>SB2026</code>
                                    <button className="copy-btn" onClick={() => copyCode('SB2026')}>📋</button>
                                </div>
                            </div>
                        </div>
                        <div className="tc-body">
                            <div className="tc-members">
                                <div className="avatars">
                                    <div className="av">J</div>
                                    <div className="av">D</div>
                                    <div className="av">V</div>
                                </div>
                                <span className="member-count">3 members</span>
                            </div>
                            <div className="tc-stats">
                                <div className="tcs">
                                    <div className="tcs-label">Rank</div>
                                    <div className="tcs-val">#89</div>
                                </div>
                                <div className="tcs">
                                    <div className="tcs-label">Avg Score</div>
                                    <div className="tcs-val">64.8%</div>
                                </div>
                                <div className="tcs">
                                    <div className="tcs-label">Streak</div>
                                    <div className="tcs-val">🔥 3</div>
                                </div>
                                <div className="tcs">
                                    <div className="tcs-label">Tests</div>
                                    <div className="tcs-val">8</div>
                                </div>
                            </div>
                            <div className="tc-progress">
                                <div className="tcp-row">
                                    <span className="tcp-label">Team Goal</span>
                                    <span className="tcp-pct">28%</span>
                                </div>
                                <div className="tcp-track">
                                    <div
                                        className="tcp-fill"
                                        style={{ width: '0%' }}
                                        data-width="28%"
                                    ></div>
                                </div>
                            </div>
                            <div className="tc-badges">
                                <span className="peer-badge badge-green">✨ New Team</span>
                            </div>
                            <div className="tc-actions">
                                <button
                                    className="btn-card-primary"
                                    onClick={() => showToast('Opening Study Buddies…', 'success')}
                                >
                                    View Details
                                </button>
                                <button
                                    className="btn-card-secondary"
                                    onClick={() => showToast('Launching team test…', 'success')}
                                >
                                    🧪 Test
                                </button>
                                <button
                                    className="btn-card-icon"
                                    title="Leave"
                                    onClick={() => showToast('Left Study Buddies', 'success')}
                                >
                                    🚪
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* LEADERBOARD */}
            <section>
                <div className="section-head fade-up">
                    <div>
                        <h2>🏆 Leaderboard</h2>
                        <p>See how your teams stack up globally</p>
                    </div>
                    <a href="#" style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--accent)' }}>
                        Full Leaderboard →
                    </a>
                </div>

                <div className="leaderboard-wrap">
                    {/* Podium */}
                    <div className="podium-panel fade-up">
                        <div className="podium-label">This Week</div>
                        <div className="podium-title">
                            Top Performing<br />
                            Teams 🎖️
                        </div>
                        <div className="podium">
                            <div className="podium-item podium-second">
                                <div className="podium-av">AC</div>
                                <div className="podium-rank">🥈</div>
                                <div className="podium-name">Achievers Club</div>
                                <div className="podium-score">91.8</div>
                                <div className="podium-members">6 members</div>
                            </div>
                            <div className="podium-item podium-first">
                                <div className="crown">👑</div>
                                <div className="podium-av">SS</div>
                                <div className="podium-rank">🥇</div>
                                <div className="podium-name">Success Squad</div>
                                <div className="podium-score">94.2</div>
                                <div className="podium-members">5 members</div>
                            </div>
                            <div className="podium-item podium-third">
                                <div className="podium-av">TS</div>
                                <div className="podium-rank">🥉</div>
                                <div className="podium-name">The Strivers</div>
                                <div className="podium-score">89.5</div>
                                <div className="podium-members">7 members</div>
                            </div>
                        </div>
                    </div>

                    {/* Rankings */}
                    <div className="rankings-panel fade-up">
                        <div className="rp-head">
                            <h3>Rankings</h3>
                            <div className="period-tabs">
                                {['Daily', 'Weekly', 'Monthly'].map((period) => (
                                    <button
                                        key={period}
                                        className={tab === period ? 'active' : ''}
                                        onClick={() => {
                                            setTab(period);
                                            showToast(`Showing ${period} rankings`, 'success');
                                        }}
                                    >
                                        {period}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="ranking-list">
                            <div className="rank-row">
                                <div className="rank-num">1</div>
                                <div className="rank-av">SS</div>
                                <div className="rank-info">
                                    <div className="rank-name">Success Squad</div>
                                    <div className="rank-meta">5 members • 58 tests</div>
                                </div>
                                <span className="rank-change change-up">↑3</span>
                                <div className="rank-score">94.2</div>
                            </div>
                            <div className="rank-row">
                                <div className="rank-num">2</div>
                                <div className="rank-av">AC</div>
                                <div className="rank-info">
                                    <div className="rank-name">Achievers Club</div>
                                    <div className="rank-meta">6 members • 42 tests</div>
                                </div>
                                <span className="rank-change change-same">—</span>
                                <div className="rank-score">91.8</div>
                            </div>
                            <div className="rank-row">
                                <div className="rank-num">3</div>
                                <div className="rank-av">TS</div>
                                <div className="rank-info">
                                    <div className="rank-name">The Strivers</div>
                                    <div className="rank-meta">7 members • 35 tests</div>
                                </div>
                                <span className="rank-change change-up">↑1</span>
                                <div className="rank-score">89.5</div>
                            </div>
                            <div className="rank-row">
                                <div className="rank-num" style={{ background: 'var(--surface-2)', color: 'var(--muted)' }}>
                                    4
                                </div>
                                <div className="rank-av" style={{ background: 'var(--grad-rose)' }}>
                                    EE
                                </div>
                                <div className="rank-info">
                                    <div className="rank-name">Elite Experts</div>
                                    <div className="rank-meta">4 members • 29 tests</div>
                                </div>
                                <span className="rank-change change-down">↓1</span>
                                <div className="rank-score">87.3</div>
                            </div>
                            <div className="rank-row is-you">
                                <div className="rank-num" style={{ background: 'rgba(91,79,255,.15)', color: 'var(--accent)' }}>
                                    12
                                </div>
                                <div className="rank-av">UW</div>
                                <div className="rank-info">
                                    <div className="rank-name">
                                        UPSC Warriors 2026 <span className="you-chip">You</span>
                                    </div>
                                    <div className="rank-meta">5 members • 28 tests</div>
                                </div>
                                <span className="rank-change change-up">↑5</span>
                                <div className="rank-score" style={{ color: 'var(--accent)' }}>
                                    76.5
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* JOIN + DISCOVER */}
            <div className="bottom-row">
                {/* Join card */}
                <div className="join-card fade-up">
                    <h3>Join a Team</h3>
                    <p>Have a code? Enter it below to instantly join your friends' study group.</p>
                    <div className="join-input-row">
                        <input
                            className="join-input"
                            id="joinCodeInput"
                            placeholder="e.g. UW2026"
                            maxLength={10}
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                        />
                        <button className="btn-join" onClick={handleJoin}>
                            Join →
                        </button>
                    </div>
                </div>

                {/* Discover panel */}
                <div className="discover-panel fade-up">
                    <h3>🔍 Discover Teams</h3>
                    <p>Find public teams that match your exam preparation goals</p>
                    <div className="filter-bar">
                        {['All', 'UPSC', 'SSC', 'Banking', 'Railway'].map((f) => (
                            <button
                                key={f}
                                className={`fpill ${filter === f ? 'active' : ''}`}
                                onClick={() => setFilter(f)}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                    <div className="discover-cards">
                        <div className="dcard">
                            <div className="dcard-head">
                                <div className="dcard-av">AI</div>
                                <div>
                                    <div className="dcard-name">Aspiring IAS</div>
                                    <span className="dcard-cat">UPSC</span>
                                </div>
                            </div>
                            <div className="dcard-desc">Serious UPSC aspirants. Daily mocks & in-depth discussions.</div>
                            <div className="dcard-meta">
                                <span>👥 8/10</span>
                                <span>🏆 #34</span>
                            </div>
                            <button
                                className="btn-dcard"
                                onClick={() => showToast('Request sent to Aspiring IAS!', 'success')}
                            >
                                Request to Join
                            </button>
                        </div>
                        <div className="dcard">
                            <div className="dcard-head">
                                <div className="dcard-av">SC</div>
                                <div>
                                    <div className="dcard-name">SSC Champs</div>
                                    <span
                                        className="dcard-cat"
                                        style={{ background: 'rgba(255,77,109,.1)', color: 'var(--rose)' }}
                                    >
                                        SSC
                                    </span>
                                </div>
                            </div>
                            <div className="dcard-desc">CGL-focused group with weekly challenge tests and reviews.</div>
                            <div className="dcard-meta">
                                <span>👥 6/8</span>
                                <span>🏆 #18</span>
                            </div>
                            <button
                                className="btn-dcard"
                                onClick={() => showToast('Request sent to SSC Champs!', 'success')}
                            >
                                Request to Join
                            </button>
                        </div>
                        <div className="dcard">
                            <div className="dcard-head">
                                <div className="dcard-av">BP</div>
                                <div>
                                    <div className="dcard-name">Banking Pros</div>
                                    <span
                                        className="dcard-cat"
                                        style={{ background: 'rgba(0,200,150,.1)', color: 'var(--emerald)' }}
                                    >
                                        Banking
                                    </span>
                                </div>
                            </div>
                            <div className="dcard-desc">IBPS PO & SBI prep. Active doubt clearing & peer teaching.</div>
                            <div className="dcard-meta">
                                <span>👥 5/6</span>
                                <span>🏆 #27</span>
                            </div>
                            <button
                                className="btn-dcard"
                                onClick={() => showToast('Request sent to Banking Pros!', 'success')}
                            >
                                Request to Join
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* CREATE TEAM MODAL */}
            <div className={`peer-modal-bg ${isCreateModalOpen ? 'open' : ''}`} id="createModal">
                <div className="peer-modal scale-in">
                    <div className="peer-modal-head">
                        <h2>Create New Team</h2>
                        <button className="peer-modal-close" onClick={() => setIsCreateModalOpen(false)}>
                            ✕
                        </button>
                    </div>
                    <div className="peer-modal-body">
                        <div className="peer-form-group">
                            <label className="peer-form-label">
                                Team Name <span>*</span>
                            </label>
                            <input className="peer-form-control" placeholder="e.g. UPSC Warriors 2026" maxLength={50} />
                            <span className="peer-form-hint">Choose something inspiring — 3 to 50 characters</span>
                        </div>
                        <div className="peer-form-group">
                            <label className="peer-form-label">Description</label>
                            <textarea className="peer-form-control" rows={3} placeholder="What's your team's mission?" maxLength={200}></textarea>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div className="peer-form-group">
                                <label className="peer-form-label">
                                    Exam Category <span>*</span>
                                </label>
                                <select className="peer-form-control">
                                    <option value="">Select…</option>
                                    <option>UPSC</option>
                                    <option>SSC</option>
                                    <option>Banking</option>
                                    <option>Railway</option>
                                    <option>Defense</option>
                                    <option>State PSC</option>
                                </select>
                            </div>
                            <div className="peer-form-group">
                                <label className="peer-form-label">
                                    Max Members <span>*</span>
                                </label>
                                <select className="peer-form-control">
                                    <option value="">Select…</option>
                                    <option>3</option>
                                    <option>5</option>
                                    <option>8</option>
                                    <option>10</option>
                                </select>
                            </div>
                        </div>
                        <div className="peer-form-group">
                            <label className="peer-form-label">Privacy</label>
                            <div className="radio-set">
                                <label className="radio-opt">
                                    <input type="radio" name="privacy" defaultChecked />
                                    <span className="radio-circle"></span>
                                    <span className="radio-text">
                                        <strong>Public</strong>
                                        <small>Anyone can discover and request to join</small>
                                    </span>
                                </label>
                                <label className="radio-opt">
                                    <input type="radio" name="privacy" />
                                    <span className="radio-circle"></span>
                                    <span className="radio-text">
                                        <strong>Private</strong>
                                        <small>Only joinable with the team code</small>
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div className="peer-form-group">
                            <label className="peer-form-label">Team Goal</label>
                            <input className="peer-form-control" placeholder="e.g. Average 80%+ across all prelims mocks" />
                        </div>
                    </div>
                    <div className="peer-modal-footer">
                        <button className="btn-light" onClick={() => setIsCreateModalOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn-submit" onClick={handleCreate}>
                            🚀 Create Team
                        </button>
                    </div>
                </div>
            </div>

            {/* TOAST */}
            <div className={`peer-toast toast-${toast.type} ${toast.show ? 'visible' : ''}`} id="toast">
                <div className="peer-toast-dot" id="toastDot">
                    {toast.type === 'success' ? '✓' : '✕'}
                </div>
                <span id="toastMsg">{toast.msg}</span>
            </div>
        </div>
    );
};

export default TeamStudy;
