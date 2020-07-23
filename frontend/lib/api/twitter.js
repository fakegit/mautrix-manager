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

const service = "Twitter bridge"
const prefix = `${apiPrefix}/mautrix-twitter`

export const whoami = () => tryFetch(`${prefix}/whoami`, {}, {
    service,
    requestType: "user info",
})

export const logout = () => tryFetch(`${prefix}/logout`, { method: "POST" }, {
    service,
    requestType: "logout",
})

export const login = payload => tryFetch(`${prefix}/login`, {
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
