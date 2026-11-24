import React from 'react';
import { StampPresetId } from '../types';
import { StampArtwork } from './Artwork';

interface PostageStampProps {
  preset: StampPresetId;
  customStamp: string | null;
  monochrome?: boolean;
  withPostmark?: boolean;
  postmarkCity?: string;
  postmarkDate?: string;
  withBreadClip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PostageStamp: React.FC<PostageStampProps> = ({
  preset,
  customStamp,
  monochrome = false,
  withPostmark = false,
  postmarkCity = 'ISTANBUL',
  postmarkDate = '24 KAS 2026',
  withBreadClip = false,
  size = 'md',
  className = '',
}) => {
  return (
    <div className={`postage-stamp-wrap postage-stamp-${size} ${className}`}>
      {withBreadClip && (
        <div className="bread-clip" aria-hidden="true">
          <svg viewBox="0 0 46 38" fill="none">
            <rect
              x="2"
              y="2"
              width="42"
              height="34"
              rx="6"
              fill="#EAE8E4"
              stroke="#C9C5BE"
              strokeWidth="1.5"
            />
            <text
              x="23"
              y="13"
              textAnchor="middle"
              fontSize="6"
              fill="#A5A099"
              fontFamily="monospace"
              letterSpacing="1"
            >
              POST
            </text>
            <path
              d="M17 36 L20 26 C17 24 18 19 23 19 C28 19 29 24 26 26 L29 36 Z"
              fill="#191B1F"
            />
          </svg>
        </div>
      )}

      <div className="postage-stamp-body">
        <div className={`postage-stamp-media ${monochrome ? 'is-monochrome' : ''}`}>
          {customStamp ? (
            <img src={customStamp} alt="Özel pul" />
          ) : (
            <StampArtwork preset={preset} />
          )}
        </div>
      </div>

      {withPostmark && (
        <svg className="postmark-overlay" viewBox="0 0 180 96" aria-hidden="true">
          {/* Wavy cancellation lines */}
          <g stroke="currentColor" strokeWidth="1.6" fill="none" opacity="0.62">
            <path d="M4 34 Q18 27 32 34 T60 34 T88 34" />
            <path d="M4 44 Q18 37 32 44 T60 44 T88 44" />
            <path d="M4 54 Q18 47 32 54 T60 54 T88 54" />
            <path d="M4 64 Q18 57 32 64 T60 64 T88 64" />
          </g>
          {/* Circular city/date stamp */}
          <g transform="translate(114, 48)" stroke="currentColor" fill="none" opacity="0.68">
            <circle r="33" strokeWidth="1.7" />
            <circle r="24" strokeWidth="1" strokeDasharray="2.5 2.5" />
            <text
              y="-10"
              textAnchor="middle"
              fill="currentColor"
              stroke="none"
              fontSize="7.4"
              fontWeight="600"
              letterSpacing="1.2"
            >
              {(postmarkCity || 'POSTALE').slice(0, 10).toUpperCase()}
            </text>
            <line x1="-18" y1="-4" x2="18" y2="-4" strokeWidth="0.9" />
            <text
              y="5"
              textAnchor="middle"
              fill="currentColor"
              stroke="none"
              fontSize="6.5"
              letterSpacing="0.8"
            >
              {(postmarkDate || '2026').slice(0, 12).toUpperCase()}
            </text>
            <line x1="-18" y1="10" x2="18" y2="10" strokeWidth="0.9" />
            <text
              y="19"
              textAnchor="middle"
              fill="currentColor"
              stroke="none"
              fontSize="6"
              letterSpacing="1.1"
            >
              AIR MAIL
            </text>
          </g>
        </svg>
      )}
    </div>
  );
};
