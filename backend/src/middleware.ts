import type { RequestHandler } from "express";
import jwt from 'jsonwebtoken'

export function formatTimestamp(date: Date = new Date()): string {
    const pad = (n: number) => String(n).padStart(2, "0");

    const yyyy = date.getFullYear();
    const mm = pad(date.getMonth() + 1);
    const dd = pad(date.getDate());
    const hh = pad(date.getHours());
    const min = pad(date.getMinutes());
    const ss = pad(date.getSeconds());

    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
}

export const logger: RequestHandler = (req, res, next) => {
    const now = formatTimestamp();

    console.log(`${now}  ${req.method}  ${req.url}`);

    next();
};

const { verify, TokenExpiredError, JsonWebTokenError } = jwt

const SECRET = process.env.SECRET

if (!SECRET) {
    throw new Error('Missing JWT secret.')
}

export const requireAuth: RequestHandler = (req, res, next) => {
    const auth = req.headers.authorization

    if (!auth || !auth.startsWith('Bearer ')) {
        res.sendStatus(401)
        return
    }

    const token = auth.slice(7)

    try {
        const verified = verify(token, SECRET)

        if (
            typeof verified === 'string' ||
            !('userId' in verified) ||
            typeof verified.userId !== 'string'
        ) {
            res.sendStatus(401)
            return
        }

        res.locals.userId = verified.userId
        next()

    } catch (error: unknown) {
        if (
            error instanceof TokenExpiredError ||
            error instanceof JsonWebTokenError
        ) {
            res.sendStatus(401)
            return
        }

        next(error)
    }
}


export const optionalAuth: RequestHandler = (req, res, next) => {
    const auth = req.headers.authorization;

	// allow guests
    if (!auth) {
        next();
        return;
    }

    if (!auth.startsWith('Bearer ')) {
        res.sendStatus(401);
        return;
    }

    const token = auth.slice(7);

    try {
        const verified = verify(token, SECRET);

        if (
            typeof verified === 'string' ||
            !('userId' in verified) ||
            typeof verified.userId !== 'string'
        ) {
            res.sendStatus(401);
            return;
        }

        res.locals.userId = verified.userId;
        next();

		// reject invalid or expired tokens of existing users
    } catch (error: unknown) {
        if (
            error instanceof TokenExpiredError ||
            error instanceof JsonWebTokenError
        ) {
            res.sendStatus(401);
            return;
        }

        next(error);
    }
};