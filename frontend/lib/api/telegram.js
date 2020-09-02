// mautrix-manager - A web interface for managing bridges
// Copyright (C) 2020 Tulir Asokan
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { tryFetch, apiPrefix } from "./tryGet.js"

const service = "Telegram bridge"
const prefix = `${apiPrefix}/mautrix-telegram`
export let allowBotLogin = null

export const initClientInfo = async () => {
    if (allowBotLogin === null) {
        const resp = await tryFetch(prefix, {}, {
            service,
            requestType: "bridge status",
        })
        allowBotLogin = resp.allow_bot_login
    }
}

export const getMe = () => tryFetch(`${prefix}/user/me`, {}, {
    service,
    requestType: "user info",
})

export const logout = () => tryFetch(`${prefix}/user/me/logout`, { method: "POST" }, {
    service,
    requestType: "logout",
})

export const login = (endpoint, payload) => tryFetch(
    `${prefix}/user/me/login/${endpoint}`,
    {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            Authorization: `Bearer ${localStorage.accessToken}`,
            "Content-Type": "application/json",
        },
    }, {
        service,
        requestType: "login",
    })
