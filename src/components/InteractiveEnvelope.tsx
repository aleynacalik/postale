import React, { useState } from 'react';
import { PostcardData } from '../types';
import { PostageStamp } from './PostageStamp';
import { PostcardFront } from './PostcardFace';

export type EnvelopeStage = 'closed' | 'peeking' | 'opening' | 'extracted';

interface InteractiveEnvelopeProps {
  card: PostcardData;
  stage: EnvelopeStage;
  onClickEnvelope?: () => void;
  interactiveHint?: string;
}

export const InteractiveEnvelope: React.FC<InteractiveEnvelopeProps> = ({
  card,
  stage,
  onClickEnvelope,
  interactiveHint,
}) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stage === 'extracted' || stage === 'opening') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -ny * 7, y: nx * 9 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  const isOpen = stage === 'peeking' || stage === 'opening' || stage === 'extracted';

  return (
    <div
      className={`envelope-stage-wrap stage-${stage}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClickEnvelope}
      role={onClickEnvelope ? 'button' : undefined}
      tabIndex={onClickEnvelope ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClickEnvelope && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClickEnvelope();
        }
      }}
    >
      <div
        className="envelope-3d-rig"
        style={{
          transform: `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <div
          className={`envelope-body ${isOpen ? 'is-open' : 'is-closed'}`}
          style={
            {
              '--env-color': card.envelopeColor,
              '--env-inner': card.envelopeInnerColor,
              '--env-text': card.envelopeTextColor,
              '--grain-opacity': card.paperGrain * 0.52,
            } as React.CSSProperties
          }
        >
          {/* Layer 1: Inner back wall of the envelope */}
          <div className="envelope-back-wall">
            <div className="envelope-paper-grain" />
          </div>

          {/* Layer 2 (when open) / Layer 6 (when closed): Real hinged triangular top flap */}
          <div className={`envelope-flap-hinge ${isOpen ? 'is-open' : ''}`}>
            <div className={`envelope-top-flap ${isOpen ? 'is-open' : ''}`}>
              {/* Outer face visible when envelope is closed */}
              <div className="flap-face flap-outer">
                <svg
                  viewBox="0 0 500 220"
                  preserveAspectRatio="none"
                  className="envelope-flap-svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="flapOuterShade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.16" />
                      <stop offset="75%" stopColor="#000000" stopOpacity="0" />
                      <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
                    </linearGradient>
                    <filter id="flapShadow" x="-10%" y="-10%" width="120%" height="135%">
                      <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.22" />
                    </filter>
                  </defs>
                  <path
                    d="M 0,0 L 500,0 L 274,194 Q 250,212 226,194 Z"
                    fill="var(--env-color)"
                    filter="url(#flapShadow)"
                  />
                  <path
                    d="M 0,0 L 500,0 L 274,194 Q 250,212 226,194 Z"
                    fill="url(#flapOuterShade)"
                  />
                </svg>
                <div className="flap-grain-mask" />
              </div>

              {/* Inner lining face visible once flap flips up & back */}
              <div className="flap-face flap-inner">
                <svg
                  viewBox="0 0 500 220"
                  preserveAspectRatio="none"
                  className="envelope-flap-svg"
                  aria-hidden="true"
                >
                  <defs>
                    <linearGradient id="flapInnerShade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#000000" stopOpacity="0.15" />
                      <stop offset="28%" stopColor="#000000" stopOpacity="0.03" />
                      <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.14" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 0,0 L 500,0 L 274,194 Q 250,212 226,194 Z"
                    fill="var(--env-color)"
                  />
                  <path
                    d="M 0,0 L 500,0 L 274,194 Q 250,212 226,194 Z"
                    fill="url(#flapInnerShade)"
                  />
                </svg>
                <div className="flap-grain-mask" />
              </div>
            </div>
          </div>

          {/* Layer 3: Postcard tucked inside and sliding cleanly out of the pocket */}
          <div className={`envelope-card-slot slot-${stage}`}>
            <div className="envelope-card-scaler">
              <PostcardFront card={card} showClippedStamp={isOpen} />
            </div>
          </div>

          {/* Layer 5: Front paper pocket with realistic folded wings & V-notch opening */}
          <div className="envelope-front-pocket">
            <svg
              viewBox="0 0 500 347"
              preserveAspectRatio="none"
              className="envelope-pocket-svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="leftWingShade" x1="0" y1="0" x2="1" y2="0.5">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.08" />
                </linearGradient>
                <linearGradient id="rightWingShade" x1="1" y1="0" x2="0" y2="0.5">
                  <stop offset="0%" stopColor="#000000" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.12" />
                </linearGradient>
                <linearGradient id="bottomFoldShade" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
                  <stop offset="18%" stopColor="#FFFFFF" stopOpacity="0.02" />
                  <stop offset="100%" stopColor="#000000" stopOpacity="0.07" />
                </linearGradient>
                <filter id="foldCrease" x="-5%" y="-10%" width="110%" height="120%">
                  <feDropShadow dx="0" dy="-2" stdDeviation="3.5" floodColor="#000000" floodOpacity="0.14" />
                </filter>
              </defs>

              {/* Left wing fold */}
              <path d="M 0,0 L 210,164 L 0,347 Z" fill="var(--env-color)" />
              <path d="M 0,0 L 210,164 L 0,347 Z" fill="url(#leftWingShade)" />

              {/* Right wing fold */}
              <path d="M 500,0 L 290,164 L 500,347 Z" fill="var(--env-color)" />
              <path d="M 500,0 L 290,164 L 500,347 Z" fill="url(#rightWingShade)" />

              {/* Bottom pocket fold coming up to meet left & right wings */}
              <path
                d="M 0,347 L 196,154 Q 250,136 304,154 L 500,347 Z"
                fill="var(--env-color)"
                filter="url(#foldCrease)"
              />
              <path
                d="M 0,347 L 196,154 Q 250,136 304,154 L 500,347 Z"
                fill="url(#bottomFoldShade)"
              />
            </svg>

            <div className="envelope-pocket-grain" />

            <div className="envelope-front-typography">
              {card.envelopeTag && <span className="env-tag">{card.envelopeTag}</span>}
              {card.envelopeSubtag && <span className="env-subtag">{card.envelopeSubtag}</span>}
              <p className="env-motto">{card.envelopeMotto}</p>
            </div>
          </div>

          {/* Layer 8: Closure ornament (fades away cleanly when opening) */}
          {card.closure === 'wax-seal' && (
            <div
              className={`envelope-wax-seal ${isOpen ? 'is-broken' : ''}`}
              style={{ backgroundColor: card.waxSealColor }}
              aria-hidden="true"
            >
              <span className="wax-seal-ring">{card.waxSealInitial || '✉'}</span>
            </div>
          )}

          {(card.closure === 'bread-clip' || card.closure === 'stamp-tab') && (
            <div className={`envelope-closed-stamp ${isOpen ? 'is-broken' : ''}`} aria-hidden="true">
              <PostageStamp
                preset={card.stampPreset}
                customStamp={card.customStamp}
                monochrome={card.stampMonochrome}
                withBreadClip={card.closure === 'bread-clip'}
                size="sm"
              />
            </div>
          )}
        </div>
      </div>

      {interactiveHint && stage === 'closed' && (
        <div className="envelope-click-hint">
          <span className="hint-pulse" />
          <span>{interactiveHint}</span>
        </div>
      )}
    </div>
  );
};
