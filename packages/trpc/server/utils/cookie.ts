import type { Request, Response, CookieOptions } from "express"

//setCookie helper function
export function setCookie(
    res: Response,
    name: string,
    value: string,
    opts: CookieOptions
) {
    res.cookie(name, value, opts);
}

//getCookie helper function
export function getCookie(
    req: Request,
    name: string):
    string | undefined {
    return req.cookies?.[name]
}

//clearCookie
export function clearCookie(res: Response, name: string) {
    res.clearCookie(name)
}