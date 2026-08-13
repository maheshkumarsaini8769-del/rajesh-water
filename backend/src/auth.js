import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

export function signToken(admin) {
  return jwt.sign({ id: admin._id.toString(), username: admin.username }, SECRET, {
    expiresIn: '7d',
  })
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  try {
    req.admin = jwt.verify(token, SECRET)
    return next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired session' })
  }
}