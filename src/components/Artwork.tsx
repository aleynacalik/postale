import React from 'react';
import { DoodleId, PhotoPresetId, StampPresetId } from '../types';

export const PhotoArtwork: React.FC<{ preset: PhotoPresetId }> = ({ preset }) => {
  switch (preset) {
    case 'california-palms':
      return (
        <svg viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" className="artwork-svg">
          <defs>
            <linearGradient id="calSky" x1="0" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#E6DCCB" />
              <stop offset="48%" stopColor="#D7B88E" />
              <stop offset="82%" stopColor="#AE8F72" />
              <stop offset="100%" stopColor="#6D584A" />
            </linearGradient>
            <radialGradient id="calSun" cx="72%" cy="32%" r="45%">
              <stop offset="0%" stopColor="#FFF7DE" stopOpacity="0.95" />
              <stop offset="45%" stopColor="#E7C28D" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#AE8F72" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="600" height="340" fill="url(#calSky)" />
          <rect width="600" height="340" fill="url(#calSun)" />
          {/* Distant hazy hills */}
          <path d="M0 245 Q150 205 320 232 T600 218 L600 340 L0 340 Z" fill="#8C7768" opacity="0.55" />
          {/* Downtown skyline silhouette */}
          <g fill="#5C4D44" opacity="0.72">
            <rect x="275" y="135" width="38" height="145" />
            <rect x="318" y="96" width="44" height="184" />
            <rect x="331" y="84" width="18" height="14" />
            <rect x="368" y="118" width="34" height="162" />
            <rect x="408" y="102" width="40" height="178" />
            <rect x="454" y="146" width="30" height="134" />
            <rect x="220" y="165" width="45" height="115" />
            <rect x="175" y="185" width="36" height="95" />
            <rect x="492" y="170" width="42" height="110" />
          </g>
          {/* Midground buildings */}
          <g fill="#423630" opacity="0.85">
            <rect x="0" y="242" width="600" height="98" />
            <rect x="40" y="218" width="68" height="45" />
            <rect x="125" y="226" width="54" height="34" />
            <rect x="445" y="215" width="76" height="45" />
          </g>
          {/* Iconic silhouetted palm trees */}
          <g fill="#261E1B">
            {/* Tall palm left-center */}
            <path d="M112 340 Q118 245 104 152 L111 151 Q125 245 121 340 Z" />
            <path d="M107 154 Q70 132 42 152 Q74 147 104 160 Z" />
            <path d="M108 153 Q78 112 58 110 Q85 126 105 156 Z" />
            <path d="M109 152 Q112 108 138 102 Q120 124 112 155 Z" />
            <path d="M110 154 Q146 128 172 146 Q142 144 112 160 Z" />
            <path d="M108 156 Q80 162 56 186 Q86 172 108 163 Z" />
            <path d="M110 156 Q138 160 162 184 Q134 170 111 163 Z" />

            {/* Tall palm right */}
            <path d="M476 340 Q470 250 486 158 L493 159 Q478 250 486 340 Z" />
            <path d="M489 160 Q452 140 426 158 Q458 154 486 165 Z" />
            <path d="M490 159 Q464 120 444 118 Q470 132 488 161 Z" />
            <path d="M491 159 Q500 116 528 112 Q508 134 494 162 Z" />
            <path d="M492 161 Q528 138 554 156 Q522 152 494 167 Z" />
            <path d="M491 163 Q520 172 544 196 Q514 180 492 169 Z" />

            {/* Smaller palm foreground left */}
            <path d="M225 340 Q222 280 232 222 L237 223 Q228 280 232 340 Z" />
            <path d="M234 223 Q202 206 182 222 Q208 219 232 228 Z" />
            <path d="M235 223 Q218 192 204 192 Q222 204 234 225 Z" />
            <path d="M236 223 Q254 194 274 196 Q254 208 238 226 Z" />
            <path d="M236 224 Q266 212 286 228 Q260 224 238 230 Z" />

            {/* Palm mid right */}
            <path d="M360 340 Q364 290 356 244 L361 244 Q370 290 368 340 Z" />
            <path d="M358 245 Q332 232 314 246 Q336 242 357 250 Z" />
            <path d="M359 245 Q384 230 404 244 Q380 242 361 250 Z" />
          </g>
          {/* Vintage light dust */}
          <g fill="#FFFDF8" opacity="0.45">
            <circle cx="148" cy="84" r="1.4" />
            <circle cx="412" cy="68" r="1.2" />
            <circle cx="510" cy="212" r="1.6" />
            <circle cx="290" cy="190" r="1" />
            <circle cx="76" cy="220" r="1.3" />
          </g>
        </svg>
      );

    case 'bosphorus-sunset':
      return (
        <svg viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" className="artwork-svg">
          <defs>
            <linearGradient id="istSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6D7A8E" />
              <stop offset="42%" stopColor="#C9967B" />
              <stop offset="72%" stopColor="#EBB882" />
              <stop offset="100%" stopColor="#D69262" />
            </linearGradient>
            <linearGradient id="istSea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9A6C5C" />
              <stop offset="50%" stopColor="#4F4B58" />
              <stop offset="100%" stopColor="#2A2B36" />
            </linearGradient>
          </defs>
          <rect width="600" height="225" fill="url(#istSky)" />
          <circle cx="415" cy="170" r="46" fill="#FFE8B8" opacity="0.72" />
          <rect y="220" width="600" height="120" fill="url(#istSea)" />
          {/* Shimmering sun reflection on Bosphorus */}
          <g fill="#FBD39A" opacity="0.48">
            <rect x="372" y="232" width="88" height="4" rx="2" />
            <rect x="385" y="246" width="62" height="3.5" rx="2" />
            <rect x="364" y="262" width="96" height="4" rx="2" />
            <rect x="392" y="278" width="48" height="3" rx="2" />
            <rect x="378" y="294" width="74" height="3" rx="2" />
          </g>
          {/* Istanbul silhouette: Galata Tower + historic domes */}
          <g fill="#2C2528">
            <path d="M0 224 L0 198 L44 198 L56 184 L82 184 L96 196 L142 196 L142 130 L150 100 L158 130 L158 196 L210 196 C220 174 260 174 270 196 L282 196 L282 152 L288 132 L294 152 L294 196 L355 198 L412 206 L510 198 C525 182 555 182 570 198 L600 198 L600 224 Z" />
            {/* Galata conical roof */}
            <rect x="136" y="136" width="28" height="62" />
            <polygon points="133,136 150,94 167,136" />
          </g>
          {/* Seagulls */}
          <g stroke="#2C2528" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.78">
            <path d="M232 94 Q240 86 248 94 Q256 86 264 94" />
            <path d="M312 72 Q318 66 324 72 Q330 66 336 72" />
            <path d="M474 108 Q481 101 488 108 Q495 101 502 108" />
          </g>
        </svg>
      );

    case 'mediterranean-arch':
      return (
        <svg viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" className="artwork-svg">
          <defs>
            <linearGradient id="medSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9AB8CA" />
              <stop offset="60%" stopColor="#E2D3BE" />
              <stop offset="100%" stopColor="#EBC299" />
            </linearGradient>
            <linearGradient id="medSea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B6D88" />
              <stop offset="100%" stopColor="#22455D" />
            </linearGradient>
          </defs>
          <rect width="600" height="340" fill="url(#medSky)" />
          <circle cx="165" cy="96" r="34" fill="#FFF4D8" opacity="0.88" />
          <rect y="198" width="600" height="142" fill="url(#medSea)" />
          {/* Distant coastal islands */}
          <path d="M0 198 Q95 162 215 198 Z" fill="#6F7A82" opacity="0.7" />
          <path d="M360 198 Q465 152 600 186 L600 198 Z" fill="#5D6B76" opacity="0.75" />
          {/* Sailboat */}
          <polygon points="315,194 315,148 340,194" fill="#FAF4E8" />
          <polygon points="311,194 311,160 294,194" fill="#EFE4D2" />
          <path d="M292 196 L342 196 L336 203 L298 203 Z" fill="#8C4A38" />
          {/* Sunlit terracotta terrace wall */}
          <path d="M0 264 L195 264 L165 340 L0 340 Z" fill="#D59A7C" />
          <path d="M435 256 L600 256 L600 340 L458 340 Z" fill="#C98768" />
          {/* Bougainvillea blossoms */}
          <g fill="#B93B62" opacity="0.9">
            <circle cx="515" cy="48" r="18" />
            <circle cx="545" cy="64" r="22" />
            <circle cx="578" cy="45" r="20" />
            <circle cx="562" cy="95" r="16" />
            <circle cx="485" cy="30" r="14" />
          </g>
          <g fill="#415A3E" opacity="0.85">
            <ellipse cx="526" cy="76" rx="14" ry="7" transform="rotate(-24 526 76)" />
            <ellipse cx="496" cy="52" rx="12" ry="6" transform="rotate(20 496 52)" />
          </g>
        </svg>
      );

    case 'botanical-dream':
      return (
        <svg viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" className="artwork-svg">
          <rect width="600" height="340" fill="#ECE4D8" />
          <circle cx="300" cy="170" r="128" fill="#DFC9C2" opacity="0.55" />
          <g stroke="#4B5644" strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M295 335 Q288 220 262 110" />
            <path d="M306 335 Q318 225 352 128" />
            <path d="M300 335 Q250 250 184 180" />
            <path d="M302 335 Q360 255 426 196" />
          </g>
          <g fill="#6E7C63" opacity="0.88">
            <ellipse cx="242" cy="205" rx="28" ry="11" transform="rotate(-35 242 205)" />
            <ellipse cx="354" cy="216" rx="28" ry="11" transform="rotate(32 354 216)" />
            <ellipse cx="220" cy="245" rx="24" ry="9" transform="rotate(-20 220 245)" />
            <ellipse cx="378" cy="252" rx="24" ry="9" transform="rotate(24 378 252)" />
          </g>
          <g fill="#C97E88">
            <circle cx="262" cy="108" r="22" />
            <circle cx="244" cy="118" r="16" />
            <circle cx="280" cy="118" r="16" />
            <circle cx="352" cy="126" r="20" />
            <circle cx="182" cy="178" r="16" />
            <circle cx="426" cy="194" r="18" />
          </g>
          <g fill="#F4DFC8">
            <circle cx="262" cy="112" r="7" />
            <circle cx="352" cy="126" r="6" />
            <circle cx="182" cy="178" r="5" />
            <circle cx="426" cy="194" r="6" />
          </g>
        </svg>
      );

    case 'midnight-stars':
    default:
      return (
        <svg viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice" className="artwork-svg">
          <defs>
            <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0E1322" />
              <stop offset="55%" stopColor="#1B2540" />
              <stop offset="100%" stopColor="#354160" />
            </linearGradient>
          </defs>
          <rect width="600" height="340" fill="url(#nightSky)" />
          {/* Crescent moon */}
          <path
            d="M448 64 A34 34 0 1 0 478 112 A26 26 0 1 1 448 64 Z"
            fill="#F4E4BC"
            opacity="0.92"
          />
          {/* Stars & constellations */}
          <g fill="#F8EED3">
            <circle cx="96" cy="68" r="2" />
            <circle cx="152" cy="104" r="1.6" />
            <circle cx="212" cy="62" r="2.2" />
            <circle cx="276" cy="96" r="1.4" />
            <circle cx="324" cy="54" r="2.4" />
            <circle cx="118" cy="156" r="1.3" />
            <circle cx="380" cy="142" r="1.7" />
            <circle cx="520" cy="136" r="2" />
            <circle cx="498" cy="76" r="1.4" />
            <circle cx="242" cy="148" r="1.5" />
          </g>
          <g stroke="#F8EED3" strokeWidth="0.7" opacity="0.32">
            <line x1="96" y1="68" x2="152" y2="104" />
            <line x1="152" y1="104" x2="212" y2="62" />
            <line x1="212" y1="62" x2="276" y2="96" />
            <line x1="276" y1="96" x2="324" y2="54" />
          </g>
          {/* Misty mountains */}
          <path d="M0 264 Q130 202 270 250 T600 226 L600 340 L0 340 Z" fill="#131929" />
          <path d="M0 290 Q180 245 360 282 T600 266 L600 340 L0 340 Z" fill="#0B0F1A" />
        </svg>
      );
  }
};

export const StampArtwork: React.FC<{ preset: StampPresetId }> = ({ preset }) => {
  switch (preset) {
    case 'silver-cake':
      return (
        <svg viewBox="0 0 120 140" className="artwork-svg">
          <defs>
            <linearGradient id="silverGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="35%" stopColor="#B8C0C8" />
              <stop offset="65%" stopColor="#5D646B" />
              <stop offset="100%" stopColor="#E4E9EE" />
            </linearGradient>
          </defs>
          <rect width="120" height="140" fill="#0A0B0D" />
          {/* Two-tier sculptural chrome cake */}
          <ellipse cx="60" cy="112" rx="38" ry="11" fill="#3B4148" />
          <rect x="26" y="76" width="68" height="36" rx="6" fill="url(#silverGrad)" />
          <ellipse cx="60" cy="76" rx="34" ry="9" fill="#DCE2E8" />
          <rect x="37" y="46" width="46" height="30" rx="5" fill="url(#silverGrad)" />
          <ellipse cx="60" cy="46" rx="23" ry="6.5" fill="#F2F6FA" />
          {/* Metallic spikes / frosting drips */}
          <path
            d="M36 46 L42 26 L50 43 L58 20 L65 42 L74 25 L82 46 Z"
            fill="url(#silverGrad)"
          />
          <path
            d="M26 82 Q34 94 42 84 Q52 96 60 85 Q69 96 78 84 Q86 92 94 82"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            fill="none"
            opacity="0.75"
          />
          {/* Sparkles */}
          <g fill="#FFFFFF" opacity="0.85">
            <circle cx="24" cy="36" r="1.6" />
            <circle cx="96" cy="44" r="1.4" />
            <circle cx="92" cy="108" r="1.2" />
          </g>
        </svg>
      );

    case 'vintage-portrait':
      return (
        <svg viewBox="0 0 120 140" className="artwork-svg">
          <rect width="120" height="140" fill="#1C191A" />
          {/* High-contrast halftone editorial portrait silhouette */}
          <ellipse cx="60" cy="64" rx="27" ry="34" fill="#F3EEE7" />
          {/* Flowing retro hair */}
          <path
            d="M34 56 C24 30 48 16 64 20 C84 22 96 42 88 74 C92 92 100 108 98 134 L24 134 C22 108 30 90 34 56 Z"
            fill="#221D1E"
          />
          <ellipse cx="60" cy="64" rx="22" ry="29" fill="#F4EFE8" />
          {/* Delicate editorial facial features */}
          <path d="M47 58 Q52 55 56 58" stroke="#1E1A1B" strokeWidth="2.2" fill="none" />
          <path d="M65 58 Q70 55 75 58" stroke="#1E1A1B" strokeWidth="2.2" fill="none" />
          <circle cx="52" cy="61" r="2" fill="#1E1A1B" />
          <circle cx="70" cy="61" r="2" fill="#1E1A1B" />
          <path d="M55 77 Q61 82 67 77" stroke="#1E1A1B" strokeWidth="2.4" fill="none" strokeLinecap="round" />
          {/* Neck & shoulders */}
          <rect x="52" y="90" width="16" height="18" fill="#EFE9E0" />
          <path d="M28 138 Q60 102 92 138 Z" fill="#EFE9E0" />
          {/* Tiny vintage stars */}
          <g fill="#F4EFE8" opacity="0.7">
            <circle cx="20" cy="24" r="1.5" />
            <circle cx="99" cy="28" r="1.8" />
            <circle cx="102" cy="94" r="1.3" />
          </g>
        </svg>
      );

    case 'coastal-ferry':
      return (
        <svg viewBox="0 0 120 140" className="artwork-svg">
          <rect width="120" height="140" fill="#F2E9DC" />
          <circle cx="86" cy="40" r="16" fill="#D48466" opacity="0.85" />
          <rect x="28" y="66" width="64" height="22" rx="3" fill="#2A313C" />
          <rect x="40" y="54" width="38" height="14" rx="2" fill="#FAF6EF" stroke="#2A313C" strokeWidth="2" />
          <rect x="54" y="40" width="9" height="14" fill="#B64D3E" />
          <path d="M18 88 L102 88 L94 102 L26 102 Z" fill="#1D222B" />
          <path d="M8 108 Q26 100 44 108 T80 108 T112 108" stroke="#365A70" strokeWidth="3" fill="none" />
          <path d="M8 120 Q26 112 44 120 T80 120 T112 120" stroke="#365A70" strokeWidth="2.5" fill="none" opacity="0.7" />
        </svg>
      );

    case 'ottoman-tulip':
      return (
        <svg viewBox="0 0 120 140" className="artwork-svg">
          <rect width="120" height="140" fill="#F4E7DA" />
          <path d="M60 124 Q58 92 60 66" stroke="#3D5940" strokeWidth="3.5" fill="none" />
          <path d="M60 110 Q38 96 34 74 Q50 86 60 102" fill="#4E6E52" />
          <path d="M60 106 Q82 94 86 72 Q70 84 60 100" fill="#4E6E52" />
          <path d="M60 72 C42 66 36 40 48 22 C54 32 58 38 60 44 C62 38 66 32 72 22 C84 40 78 66 60 72 Z" fill="#BA4A42" />
          <path d="M60 72 C52 58 53 38 60 22 C67 38 68 58 60 72 Z" fill="#D56B5E" />
        </svg>
      );

    case 'crescent-moon':
    default:
      return (
        <svg viewBox="0 0 120 140" className="artwork-svg">
          <rect width="120" height="140" fill="#171E30" />
          <path d="M66 34 A30 30 0 1 0 88 82 A23 23 0 1 1 66 34 Z" fill="#E6CFA0" />
          <g fill="#F8EED3">
            <polygon points="88,36 90,42 96,44 90,46 88,52 86,46 80,44 86,42" />
            <circle cx="30" cy="40" r="1.8" />
            <circle cx="94" cy="96" r="1.8" />
            <circle cx="34" cy="108" r="1.5" />
            <circle cx="62" cy="114" r="1.2" />
          </g>
        </svg>
      );
  }
};

export const DoodleOverlay: React.FC<{ doodles: DoodleId[]; color: string }> = ({
  doodles,
  color,
}) => {
  if (!doodles.length) return null;

  return (
    <div className="doodle-layer" aria-hidden="true">
      {doodles.includes('stars') && (
        <>
          <svg className="doodle doodle-star-tl" viewBox="0 0 90 90" fill="none">
            <path
              d="M45 8 L50 32 L76 18 L57 42 L84 52 L56 54 L68 82 L46 60 L26 80 L36 53 L10 47 L36 39 L22 14 L42 33 Z"
              stroke={color}
              strokeWidth="2.4"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
          <svg className="doodle doodle-star-br" viewBox="0 0 80 80" fill="none">
            <path
              d="M40 8 L43 32 L68 18 L50 38 L74 48 L48 49 L58 72 L40 54 L20 68 L32 47 L8 40 L33 36 L22 14 L38 33 Z"
              stroke={color}
              strokeWidth="2.1"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </>
      )}
      {doodles.includes('squiggle') && (
        <svg className="doodle doodle-squiggle-bl" viewBox="0 0 110 74" fill="none">
          <path
            d="M8 62 L24 14 L32 58 L49 12 L57 54 L76 16 L84 48 L100 22"
            stroke={color}
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {doodles.includes('hearts') && (
        <svg className="doodle doodle-heart-tr" viewBox="0 0 64 64" fill="none">
          <path
            d="M32 52 C14 40 10 26 17 18 C23 12 30 16 32 23 C34 16 41 12 47 18 C54 26 50 40 32 52 Z"
            stroke={color}
            strokeWidth="2.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
      {doodles.includes('sparkles') && (
        <svg className="doodle doodle-sparkle-tr" viewBox="0 0 70 70" fill="none">
          <path
            d="M35 8 Q37 33 62 35 Q37 37 35 62 Q33 37 8 35 Q33 33 35 8 Z"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M56 12 Q57 18 63 19 Q57 20 56 26 Q55 20 49 19 Q55 18 56 12 Z"
            fill={color}
          />
        </svg>
      )}
    </div>
  );
};
