/**
 * Transitions Component Examples
 *
 * This file demonstrates how to use the various transition components
 * available in Transitions.jsx for creating smooth, professional animations
 * throughout the EVETrade application.
 */

import { useState } from 'react';
import {
  FadeIn,
  SlideIn,
  ScaleIn,
  BounceIn,
  StaggeredList,
  Collapse,
  Shake,
  CountUp,
  PresenceTransition,
  Pulsate,
  Lift,
  Press
} from './Transitions';

export function TransitionsExample() {
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  return (
    <div className="min-h-screen bg-space-black dark:bg-space-black bg-light-bg p-8 space-y-12">

      {/* FadeIn Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display text-accent-cyan">FadeIn Animations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FadeIn>
            <div className="glass-panel p-6">
              <h3 className="font-semibold text-text-primary mb-2">Simple Fade</h3>
              <p className="text-text-secondary">Fades in smoothly</p>
            </div>
          </FadeIn>

          <FadeIn direction="up" delay={200}>
            <div className="glass-panel p-6">
              <h3 className="font-semibold text-text-primary mb-2">Fade Up</h3>
              <p className="text-text-secondary">Fades in from below</p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SlideIn Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display text-accent-cyan">SlideIn Animations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SlideIn direction="left" delay={300}>
            <div className="glass-panel p-6">
              <h3 className="font-semibold text-text-primary mb-2">Slide from Left</h3>
              <p className="text-text-secondary">Slides in from the left side</p>
            </div>
          </SlideIn>

          <SlideIn direction="right" delay={400}>
            <div className="glass-panel p-6">
              <h3 className="font-semibold text-text-primary mb-2">Slide from Right</h3>
              <p className="text-text-secondary">Slides in from the right side</p>
            </div>
          </SlideIn>
        </div>
      </section>

      {/* ScaleIn & BounceIn */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display text-accent-cyan">Scale & Bounce Animations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ScaleIn delay={500}>
            <div className="glass-panel p-6">
              <h3 className="font-semibold text-text-primary mb-2">Scale In</h3>
              <p className="text-text-secondary">Scales up smoothly</p>
            </div>
          </ScaleIn>

          <BounceIn delay={600}>
            <div className="glass-panel p-6">
              <h3 className="font-semibold text-text-primary mb-2">Bounce In</h3>
              <p className="text-text-secondary">Bounces in playfully</p>
            </div>
          </BounceIn>
        </div>
      </section>

      {/* StaggeredList Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display text-accent-cyan">Staggered List Animation</h2>
        <StaggeredList
          staggerDelay={100}
          animation="fade-up"
          className="space-y-3"
        >
          {['Trade Item 1', 'Trade Item 2', 'Trade Item 3', 'Trade Item 4'].map((item, i) => (
            <div key={i} className="glass-panel p-4">
              <div className="flex items-center justify-between">
                <span className="text-text-primary font-medium">{item}</span>
                <span className="text-accent-cyan font-mono">+123,456 ISK</span>
              </div>
            </div>
          ))}
        </StaggeredList>
      </section>

      {/* Collapse Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display text-accent-cyan">Collapse Animation</h2>
        <div className="glass-panel">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-4 text-left flex items-center justify-between text-text-primary font-semibold"
          >
            <span>Accordion Panel</span>
            <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          <Collapse isOpen={isOpen}>
            <div className="p-4 border-t border-accent-cyan/20">
              <p className="text-text-secondary">
                This content smoothly expands and collapses with height animation.
                Perfect for accordions, FAQs, and expandable sections.
              </p>
            </div>
          </Collapse>
        </div>
      </section>

      {/* CountUp Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display text-accent-cyan">CountUp Animation</h2>
        <div className="glass-panel p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-display text-accent-cyan">
                <CountUp value={1234567} duration={2000} suffix=" ISK" />
              </div>
              <p className="text-text-secondary mt-2">Total Profit</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display text-accent-green">
                <CountUp value={42} duration={1500} suffix=" Trades" />
              </div>
              <p className="text-text-secondary mt-2">Completed</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-display text-accent-gold">
                <CountUp value={87.5} duration={1800} decimals={1} suffix="%" />
              </div>
              <p className="text-text-secondary mt-2">Win Rate</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shake Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display text-accent-cyan">Shake Animation (Error State)</h2>
        <div className="glass-panel p-6 space-y-4">
          <button
            onClick={() => setShakeError(!shakeError)}
            className="btn-primary"
          >
            Trigger Error Animation
          </button>
          <Shake trigger={shakeError}>
            <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 font-medium">Error: Invalid trade amount</p>
            </div>
          </Shake>
        </div>
      </section>

      {/* PresenceTransition Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display text-accent-cyan">Presence Transition (Modal)</h2>
        <div className="glass-panel p-6 space-y-4">
          <button
            onClick={() => setShowModal(!showModal)}
            className="btn-primary"
          >
            Toggle Modal
          </button>
          <PresenceTransition show={showModal}>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
              <div className="glass-panel p-6 max-w-md w-full">
                <h3 className="text-xl font-display text-text-primary mb-4">Modal Title</h3>
                <p className="text-text-secondary mb-6">
                  This modal smoothly animates in and out with presence transition.
                </p>
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-secondary w-full"
                >
                  Close
                </button>
              </div>
            </div>
          </PresenceTransition>
        </div>
      </section>

      {/* Pulsate Example */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display text-accent-cyan">Pulsate Animation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Pulsate type="glow">
            <div className="glass-panel p-6 text-center">
              <div className="w-12 h-12 bg-accent-cyan rounded-full mx-auto mb-2" />
              <p className="text-text-secondary text-sm">Glow Pulse</p>
            </div>
          </Pulsate>

          <Pulsate type="scale">
            <div className="glass-panel p-6 text-center">
              <div className="w-12 h-12 bg-accent-purple rounded-full mx-auto mb-2" />
              <p className="text-text-secondary text-sm">Scale Pulse</p>
            </div>
          </Pulsate>

          <Pulsate type="opacity">
            <div className="glass-panel p-6 text-center">
              <div className="w-12 h-12 bg-accent-gold rounded-full mx-auto mb-2" />
              <p className="text-text-secondary text-sm">Opacity Pulse</p>
            </div>
          </Pulsate>
        </div>
      </section>

      {/* Lift & Press Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display text-accent-cyan">Lift & Press Effects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Lift>
            <div className="glass-panel p-6 cursor-pointer">
              <h3 className="font-semibold text-text-primary mb-2">Lift on Hover</h3>
              <p className="text-text-secondary">Hover over this card to see the lift effect</p>
            </div>
          </Lift>

          <Press>
            <button className="glass-panel p-6 w-full text-left">
              <h3 className="font-semibold text-text-primary mb-2">Press Effect</h3>
              <p className="text-text-secondary">Click to see the press animation</p>
            </button>
          </Press>
        </div>
      </section>

      {/* CSS Utility Classes Examples */}
      <section className="space-y-4">
        <h2 className="text-2xl font-display text-accent-cyan">CSS Utility Classes</h2>
        <div className="glass-panel p-6 space-y-6">

          {/* Button Press */}
          <div>
            <h3 className="text-lg text-text-primary mb-3">Button Press Effect (.btn-press)</h3>
            <button className="btn-primary btn-press">
              Click Me
            </button>
          </div>

          {/* Link Underline */}
          <div>
            <h3 className="text-lg text-text-primary mb-3">Link Underline Animation (.link-underline)</h3>
            <a href="#" className="link-underline text-accent-cyan text-lg">
              Hover over this link
            </a>
          </div>

          {/* Card Lift */}
          <div>
            <h3 className="text-lg text-text-primary mb-3">Card Lift Effect (.card-lift)</h3>
            <div className="card-lift glass-panel p-4 inline-block">
              <p className="text-text-secondary">Hover to lift</p>
            </div>
          </div>

          {/* Input Glow */}
          <div>
            <h3 className="text-lg text-text-primary mb-3">Input Focus Glow (.input-glow)</h3>
            <input
              type="text"
              placeholder="Focus to see glow effect"
              className="input-glow w-full px-4 py-2 bg-space-dark/50 border border-accent-cyan/20 rounded-lg text-text-primary"
            />
          </div>

          {/* Ripple Effect */}
          <div>
            <h3 className="text-lg text-text-primary mb-3">Ripple Effect (.ripple)</h3>
            <button className="btn-secondary ripple">
              Click for Ripple
            </button>
          </div>

          {/* Glow Effects */}
          <div>
            <h3 className="text-lg text-text-primary mb-3">Glow Effects</h3>
            <div className="flex flex-wrap gap-4">
              <div className="glow-cyan px-6 py-3 rounded-lg bg-space-dark text-accent-cyan">
                Cyan Glow
              </div>
              <div className="glow-purple px-6 py-3 rounded-lg bg-space-dark text-accent-purple">
                Purple Glow
              </div>
              <div className="glow-gold px-6 py-3 rounded-lg bg-space-dark text-accent-gold">
                Gold Glow
              </div>
            </div>
          </div>

          {/* Border Glow */}
          <div>
            <h3 className="text-lg text-text-primary mb-3">Border Glow (.border-glow)</h3>
            <div className="border-glow glass-panel p-6 inline-block rounded-lg">
              <p className="text-text-secondary">Hover to see animated border</p>
            </div>
          </div>

          {/* Hover Scale */}
          <div>
            <h3 className="text-lg text-text-primary mb-3">Hover Scale Effects</h3>
            <div className="flex gap-4">
              <div className="hover-scale glass-panel p-4 rounded-lg cursor-pointer">
                <p className="text-text-secondary">Scale 1.05</p>
              </div>
              <div className="hover-scale-sm glass-panel p-4 rounded-lg cursor-pointer">
                <p className="text-text-secondary">Scale 1.02</p>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

export default TransitionsExample;
