export type Content = {
  nav: { signIn: string; openDashboard: string }
  hero: {
    eyebrow: string
    title: string
    highlight: string
    lead: string
    primaryCta: string
    secondaryCta: string
    note: string
  }
  features: {
    heading: string
    subheading: string
    items: { title: string; text: string; icon: 'shield' | 'check' | 'eye' }[]
  }
  preview: { heading: string; subheading: string }
  footer: { text: string }
  news: {
    heading: string
    subheading: string
    readMore: string
    home: string
    back: string
    empty: string
  }
}

// Which top-level fields of a site-content document hold the editable content
export const CONTENT_KEYS = ['nav', 'hero', 'features', 'preview', 'news', 'footer'] as const

export const defaultContent: Content = {
  nav: { signIn: 'Sign in', openDashboard: 'Open dashboard' },
  hero: {
    eyebrow: 'Task management for schools',
    title: 'Keep every assignment',
    highlight: 'on track.',
    lead: 'SchoolHub gives students a simple place to manage their tasks and gives teachers a clear view to review them, all managed by your school administrator.',
    primaryCta: 'Sign in to SchoolHub',
    secondaryCta: 'See how it works',
    note: 'Accounts are created by your school administrator.',
  },
  features: {
    heading: 'Everything in one place',
    subheading: 'Three roles, one simple workflow.',
    items: [
      {
        title: 'Role-based access',
        text: 'Admins create accounts and assign roles. Every user sees only what their role allows.',
        icon: 'shield',
      },
      {
        title: 'Personal task tracking',
        text: 'Students create, edit and delete their own tasks, and always see the current status and priority.',
        icon: 'check',
      },
      {
        title: 'Teacher review',
        text: 'Teachers see every student’s tasks and mark them completed or priority, without touching the content.',
        icon: 'eye',
      },
    ],
  },
  news: {
    heading: 'News',
    subheading: 'Updates and announcements from SchoolHub.',
    readMore: 'Read more',
    home: 'Home',
    back: 'All news',
    empty: 'Nothing has been published yet.',
  },
  preview: { heading: 'A peek inside', subheading: 'Examples of tasks managed with SchoolHub.' },
  footer: { text: '© {year} SchoolHub. Built with Payload & Next.js.' },
}
