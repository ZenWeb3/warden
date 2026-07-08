import { useState, useEffect } from "react";

import "./Landing.css";

/* Fill these in before you ship. */
const REPO_URL = "https://github.com/zenweb3/warden";
const TWEET_URL = "#"; // your showcase tweet, once posted
const GUARD_ADDRESS = "0x7B4F794C9639C22095251ad18851bc2ce8F81908";
const EXPLORER = "https://scan.bohr.life";

/* Builder */
const BUILDER = {
  name: "Zen",
  role: "Founder of Warden",
  x: "@zenonchain",
  xUrl: "https://x.com/zenonchain",
  bio: "Software engineer and DevRel. I build agents, break them, and document the wreckage. Warden is the thing I trust with a wallet.",
  avatar: "/assets/zenpfp.jpg", // paste a photo URL, or leave empty for the monogram
};

const REPO = REPO_URL.replace("https://github.com/", "");

const STEPS = [
  [
    "01",
    "Propose",
    "The agent reasons over the market and puts forward one move. Nothing more.",
  ],
  [
    "02",
    "Screen",
    "Seven rules judge that move. Most of them live inside a contract, so the limits hold even when the agent does not.",
  ],
  [
    "03",
    "Settle",
    "Clean moves execute and are recorded. Bad ones are refused and recorded too. Every decision leaves a mark on chain.",
  ],
];

const POLICIES = [
  ["Spend cap", "no single move over the per trade limit"],
  ["Daily budget", "a hard ceiling across every rolling day"],
  ["Allowlist", "only tokens and destinations you approved"],
  ["Chain lock", "settles on BOT Chain and nowhere else"],
  ["Cooldown", "rate limited, so it cannot flood"],
  ["Slippage", "held to a ceiling against the quote"],
  ["Injection tripwire", "a poisoned instruction never reaches a signature"],
];

function Stars() {
  const [stars, setStars] = useState(null);
  useEffect(() => {
    let live = true;
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (live && d && typeof d.stargazers_count === "number")
          setStars(d.stargazers_count);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);
  if (stars === null) return null;
  return (
    <a href={REPO_URL} target="_blank" rel="noreferrer" className="ed-stars">
      <span className="ed-star">★</span> {stars.toLocaleString()}
    </a>
  );
}

export default function Landing({ onLaunch }) {
  const launch = (e) => {
    e?.preventDefault?.();
    onLaunch?.();
  };
  return (
    <div className="ed">
      {/* masthead */}
      <header className="ed-mast">
        <span className="ed-logo">Warden</span>
        <span className="ed-mast-meta">An agent firewall</span>
        <nav className="ed-mast-nav">
          <a href="#how">How it works</a>
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <Stars />
          <a href="#/app" onClick={launch} className="ed-mast-cta">
            Launch ↗
          </a>
        </nav>
      </header>

      {/* hero */}
      <section className="ed-hero">
        <span className="ed-kicker">
          BOT Chain · Builder Challenge №01 · AI Agent
        </span>
        <h1 className="ed-h1">
          The agent proposes.
          <br />
          The chain <em>decides.</em>
        </h1>
        <p className="ed-dek">
          Autonomous agents are one poisoned prompt away from signing something
          you would never approve. Warden sits between the agent and the
          blockchain. It reads every move the agent wants to make, checks it
          against rules the agent cannot rewrite, and withholds the signature
          the moment one breaks.
        </p>
        <div className="ed-actions">
          <a href="#/app" onClick={launch} className="ed-btn">
            Launch the terminal
          </a>
          <a
            href={`${EXPLORER}/address/${GUARD_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="ed-link"
          >
            Read the contract <span className="ed-arr">↗</span>
          </a>
        </div>
      </section>

      <hr className="ed-rule" />

      {/* the problem */}
      <section className="ed-problem">
        <span className="ed-eyebrow">The problem</span>
        <p className="ed-problem-lead">
          Give a language model a wallet and it will trust the first voice that
          lies to it.
        </p>
        <p className="ed-problem-body">
          One injected instruction. One poisoned feed. One convincing message.
          That is all it takes for an agent to sign something you would never
          approve. Warden assumes that happens, and makes it harmless.
        </p>
      </section>

      {/* how */}
      <section id="how" className="ed-how">
        <span className="ed-eyebrow">How it works</span>
        <div className="ed-steps">
          {STEPS.map(([n, t, d]) => (
            <article className="ed-step" key={n}>
              <span className="ed-step-n">{n}</span>
              <h3 className="ed-step-t">{t}</h3>
              <p className="ed-step-d">{d}</p>
            </article>
          ))}
        </div>
      </section>

      {/* pull quote */}
      <section className="ed-quote">
        <blockquote>
          The model does the thinking.
          <br />
          <em>It never holds the keys.</em>
        </blockquote>
      </section>

      {/* policies */}
      <section className="ed-pol">
        <span className="ed-eyebrow">Seven rules, checked before it signs</span>
        <ol className="ed-pol-list">
          {POLICIES.map(([t, d], i) => (
            <li key={i}>
              <span className="ed-pol-n">{String(i + 1).padStart(2, "0")}</span>
              <span className="ed-pol-t">{t}</span>
              <span className="ed-pol-d">{d}</span>
            </li>
          ))}
        </ol>
      </section>

      <hr className="ed-rule" />

      {/* proof */}
      <section className="ed-proof">
        <span className="ed-eyebrow">Not a slide</span>
        <h2 className="ed-proof-h">It is already on chain.</h2>
        <p className="ed-proof-d">
          WardenGuard is live on BOT Chain, a network audited by CertiK. Real
          decisions, the ones it signed and the ones it refused, sit on the
          explorer for anyone to check.
        </p>
        <div className="ed-actions">
          <a href="#/app" onClick={launch} className="ed-btn">
            See it live
          </a>
          <a
            href={`${EXPLORER}/address/${GUARD_ADDRESS}`}
            target="_blank"
            rel="noreferrer"
            className="ed-link"
          >
            Contract on the explorer <span className="ed-arr">↗</span>
          </a>
        </div>
      </section>

      <hr className="ed-rule" />

      {/* builder */}
      <section className="ed-builder">
        <span className="ed-eyebrow">The builder</span>
        <div className="ed-builder-in">
          <div className="ed-avatar">
            {BUILDER.avatar ? (
              <img src={BUILDER.avatar} alt={BUILDER.name} />
            ) : (
              <span className="ed-avatar-mono">{BUILDER.name.charAt(0)}</span>
            )}
          </div>
          <div className="ed-builder-body">
            <h3 className="ed-builder-name">{BUILDER.name}</h3>
            <span className="ed-builder-role">{BUILDER.role}</span>
            <p className="ed-builder-bio">{BUILDER.bio}</p>
            <a
              href={BUILDER.xUrl}
              target="_blank"
              rel="noreferrer"
              className="ed-link"
            >
              {BUILDER.x} <span className="ed-arr">↗</span>
            </a>
          </div>
        </div>
      </section>

      {/* colophon */}
      <footer className="ed-foot">
        <span className="ed-foot-l">
          Warden. An agent firewall for BOT Chain.
        </span>
        <span className="ed-foot-links">
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href={TWEET_URL} target="_blank" rel="noreferrer">
            X
          </a>
          <a href={EXPLORER} target="_blank" rel="noreferrer">
            Explorer
          </a>
          <a href="#/app" onClick={launch}>
            Launch
          </a>
        </span>
      </footer>
    </div>
  );
}
