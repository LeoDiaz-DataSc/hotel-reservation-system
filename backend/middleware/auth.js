const jwt = require('jsonwebtoken');

/**
 * Verifica JWT en el header Authorization: Bearer <token>
 */
const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) {
        return res.status(403).json({ success: false, message: 'Token de acceso requerido' });
    }
    try {
        const token = authHeader.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado' });
    }
    return next();
};

/**
 * Verifica que el usuario tenga uno de los roles permitidos
 * Uso: checkRole('Admin', 'Supervisor')
 */
const checkRole = (...rolesPermitidos) => {
    return (req, res, next) => {
        if (!req.user || !rolesPermitidos.includes(req.user.rol)) {
            return res.status(403).json({ 
                success: false, 
                message: `Acceso denegado. Roles requeridos: ${rolesPermitidos.join(', ')}` 
            });
        }
        next();
    };
};

module.exports = { verifyToken, checkRole };
