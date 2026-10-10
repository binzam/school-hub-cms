import React from 'react'

export const HeaderViewSite: React.FC = () => (
  <a href="/" target="_blank" rel="noopener noreferrer" className="header-btn">
    View site
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M7 17L17 7" />
      <path d="M8 7h9v9" />
    </svg>
  </a>
)
