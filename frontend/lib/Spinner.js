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
import { html } from "../web_modules/htm/preact.js"

const Spinner = ({ size = 40, center = true, green = false }) => {
    let margin = 0
    if (!isNaN(+size)) {
        size = +size
        margin = `${Math.round(size / 6)}px`
        size = `${size}px`
    }
    const noInnerMargin = center || !margin
    const comp = html`
        <div style="width: ${size}; height: ${size}; margin: ${noInnerMargin ? 0 : margin} 0;"
             class="sk-chase ${green && "green"}">
            <div class="sk-chase-dot" />
            <div class="sk-chase-dot" />
            <div class="sk-chase-dot" />
            <div class="sk-chase-dot" />
            <div class="sk-chase-dot" />
            <div class="sk-chase-dot" />
        </div>
    `
    if (center) {
        return html`<div style="margin: ${margin} 0;" class="sk-center-wrapper">${comp}</div>`
    }
    return comp
}

export default Spinner