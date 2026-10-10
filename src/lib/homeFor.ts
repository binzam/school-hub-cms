export const homeFor = (role?: string | null) => (role === 'student' ? '/dashboard' : '/admin')
