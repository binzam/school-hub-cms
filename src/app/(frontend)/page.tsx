// import { headers as getHeaders } from 'next/headers'
// import Link from 'next/link'
// import { getPayload } from 'payload'

// import config from '@/payload.config'
// import LogoutButton from './LogoutButton'
// import ThemeToggle from './ThemeToggle'
// import { homeFor } from '@/lib/homeFor'

// export const dynamic = 'force-dynamic'

// const features = [
//   {
//     title: 'Role-based access',
//     text: 'Admins create accounts and assign roles. Every user sees only what their role allows.',
//     icon: (
//       <svg
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       >
//         <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z" />
//         <path d="M9 12l2 2 4-4" />
//       </svg>
//     ),
//   },
//   {
//     title: 'Personal task tracking',
//     text: 'Students create, edit and delete their own tasks, and always see the current status and priority.',
//     icon: (
//       <svg
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       >
//         <path d="M9 11l3 3 8-8" />
//         <path d="M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h9" />
//       </svg>
//     ),
//   },
//   {
//     title: 'Teacher review',
//     text: 'Teachers see every student’s tasks and mark them completed or priority, without touching the content.',
//     icon: (
//       <svg
//         viewBox="0 0 24 24"
//         fill="none"
//         stroke="currentColor"
//         strokeWidth="2"
//         strokeLinecap="round"
//         strokeLinejoin="round"
//       >
//         <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
//         <circle cx="12" cy="12" r="3" />
//       </svg>
//     ),
//   },
// ]

// export default async function HomePage() {
//   const payload = await getPayload({ config: await config })
//   const { user } = await payload.auth({ headers: await getHeaders() })

//   // Only tasks a super admin explicitly flagged, and only these fields.
//   // The Local API skips access control by default, which is intentional here.
//   const { docs: tasks } = await payload.find({
//     collection: 'tasks',
//     where: { showOnLanding: { equals: true } },
//     select: { title: true, description: true, status: true, isPriority: true },
//     depth: 0,
//     limit: 3,
//     sort: '-createdAt',
//   })
//   const home = user ? homeFor(user.role) : '/login'
//   return (
//     <>
//       <header className="site-header">
//         <div className="container nav">
//           <Link href="/" className="brand">
//             <span className="brand-mark">S</span>
//             SchoolHub
//             {user && <span className="small-text">Welcome, {user.role}</span>}
//           </Link>
//           <div className="nav-actions">
//             <ThemeToggle />
//             <Link href={home} className="btn btn-primary">
//               {user ? 'Open dashboard' : 'Sign in'}
//             </Link>
//             {user && <LogoutButton />}
//           </div>
//         </div>
//       </header>

//       <main>
//         <section className="hero">
//           <div className="container">
//             <span className="eyebrow">Task management for schools</span>
//             <h1>
//               Keep every assignment <span className="accent-underline">on track.</span>
//             </h1>
//             <p className="lead">
//               SchoolHub gives students a simple place to manage their tasks and gives teachers a
//               clear view to review them, all managed by your school administrator.
//             </p>
//             <div className="hero-actions">
//               <Link href={home} className="btn btn-primary btn-lg">
//                 {user ? 'Open dashboard' : 'Sign in to SchoolHub'}
//               </Link>
//               <a href="#features" className="btn btn-ghost btn-lg">
//                 See how it works
//               </a>
//             </div>
//             <p className="hero-note">Accounts are created by your school administrator.</p>
//           </div>
//         </section>

//         <section id="features" className="section">
//           <div className="container">
//             <div className="section-head">
//               <h2>Everything in one place</h2>
//               <p>Three roles, one simple workflow.</p>
//             </div>
//             <div className="grid-3">
//               {features.map((f) => (
//                 <article key={f.title} className="card">
//                   <div className="icon-wrap">{f.icon}</div>
//                   <h3>{f.title}</h3>
//                   <p>{f.text}</p>
//                 </article>
//               ))}
//             </div>
//           </div>
//         </section>

//         {tasks.length > 0 && (
//           <section id="preview" className="section">
//             <div className="container">
//               <div className="section-head">
//                 <h2>A peek inside</h2>
//                 <p>Examples of tasks managed with SchoolHub.</p>
//               </div>
//               <div className="grid-3">
//                 {tasks.map((task) => (
//                   <article key={task.id} className="card task-card">
//                     <h3>{task.title}</h3>
//                     {task.description && <p className="task-desc">{task.description}</p>}
//                     <div className="badges">
//                       <span className={`badge badge-${task.status ?? 'pending'}`}>
//                         {task.status === 'completed' ? 'Completed' : 'Pending'}
//                       </span>
//                       {task.isPriority && <span className="badge badge-priority">Priority</span>}
//                     </div>
//                   </article>
//                 ))}
//               </div>
//             </div>
//           </section>
//         )}
//       </main>

//       <footer className="footer">
//         <div className="container footer-inner">
//           <Link href="/" className="brand">
//             <span className="brand-mark">S</span>
//             SchoolHub
//           </Link>
//           <span>© {new Date().getFullYear()} SchoolHub. Built with Payload &amp; Next.js.</span>
//         </div>
//       </footer>
//     </>
//   )
// }
import { headers as getHeaders } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

import { defaultLanguage, getLanguages, pickLanguage } from '@/lib/content/languages'
import { idOf } from '@/lib/idOf'
import config from '@/payload.config'

export const dynamic = 'force-dynamic'

// Signed-in user's preference, then the browser's language, then the default
export default async function RootRedirect() {
  const payload = await getPayload({ config: await config })
  const headers = await getHeaders()
  const languages = await getLanguages(payload)
  const { user } = await payload.auth({ headers })

  const preferredId = idOf(user?.preferredLanguage)
  const target =
    languages.find((l) => l.id !== null && l.id === preferredId) ??
    pickLanguage(headers.get('accept-language'), languages) ??
    defaultLanguage(languages)

  redirect(`/${target.code}`)
}
