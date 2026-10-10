'use client'

import React from 'react'

// A plain <a> (not next/link) so the logout URL is never prefetched.
export const HeaderLogout: React.FC = () => (
  <a href="/admin/logout" className="header-btn">
    Log out
  </a>
)
