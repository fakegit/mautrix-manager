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
import { useEffect, useState } from "../web_modules/preact/hooks.js"
import { html } from "../web_modules/htm/preact.js"
import { useRoute, Route, Link } from "../web_modules/wouter-preact.js"

import { checkTrackingEnabled } from "../lib/api/tracking.js"
import { makeStyles } from "../lib/theme.js"
import { logout } from "../lib/api/login.js"
import * as config from "../lib/api/config.js"
import InstagramBridge from "./bridges/Instagram.js"
import SlackBridge from "./bridges/Slack.js"
import TelegramBridge from "./bridges/Telegram.js"
import FacebookBridge from "./bridges/Facebook.js"
import HangoutsBridge from "./bridges/Hangouts.js"
import TwitterBridge from "./bridges/Twitter.js"
import MxPuppetTwitterBridge from "./bridges/MxPuppetTwitter.js"
import WhatsAppBridge from "./bridges/WhatsApp.js"
import Button from "./components/Button.js"
import DockerControls from "./docker/Controls.js"
import LoginView from "./Login.js"

const useNavStyles = makeStyles(theme => ({
    anchor: {
        display: "inline-block",
        textDecoration: "none",
        margin: "0 .25rem",
    },
    button: {
        display: "flex",
        alignItems: "center",
        margin: 0,
        padding: ".25rem .5rem",
        borderRadius: ".25rem .25rem 0 0",
    },
    icon: {
        width: "2rem",
        height: "2rem",
        margin: "0 .25rem",
    },
    text: {
        fontWeight: 600,
    },
    active: {
        backgroundColor: theme.color.primaryDark,
    },
}), { name: "main-nav" })

const NavButton = ({ href, icon, children, ...args }) => {
    const classes = useNavStyles()
    if (!href) {
        return html`<${Button} size="thick" class=${classes.button} ...${args}>
            <img class=${classes.icon} src=${icon} alt="Icon" />
            <span class=${classes.text}>${children}</span>
        </Button>`
    }
    const [isActive] = useRoute(href.substr(1))
    return html`<${Link} href=${href}>
        <a class=${classes.anchor}>
            <${Button} size="thick" class="${classes.button} ${isActive ? classes.active : ""}">
                <img class=${classes.icon} src=${icon} alt="Icon" />
                <span class=${classes.text}>${children}</span>
            </Button>
        </a>
    </Link>`
}

const BridgeButton = ({ bridge, iconName, children }) => {
    if (config.bridges && !config.bridges[bridge]) {
        return null
    }
    iconName = iconName || bridge.split("-").pop()
    return NavButton({ href: `#/${bridge}`, icon: `res/logos/${iconName}.svg`, children })
}

const useStyles = makeStyles(theme => ({
    topbar: {
        backgroundColor: theme.color.primary,
        boxShadow: "0 0 .3em .3em #9A9A9B",
        marginBottom: "1rem",
    },
    loginInfo: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        "& > span": {
            color: theme.color.primaryContrastText,
            fontSize: "20px",
            margin: "0 1.25rem",
        },
    },
    nav: {
        display: "flex",
        flexWrap: "wrap",
    },
}), { name: "main" })

const Main = () => {
    const classes = useStyles()
    const [loggedIn, setLoggedIn] = useState(Boolean(localStorage.accessToken))
    const [dockerControls, setDockerControls] = useState(config.dockerControls)
    const [useDesktopLogin, setUseDesktopLogin] = useState(false)

    const handleExtension = () => {
        window.dispatchEvent(new CustomEvent("mautrix-cookie-monster-response"), {
            detail: {
                loggedIn,
                token: localStorage.accessToken,
                url: window.location.origin,
            },
        })
    }

    useEffect(() => {
        if (loggedIn) {
            checkTrackingEnabled()
            config.update().then(res => setDockerControls(res.docker_controls))
        }
        window.addEventListener("mautrix-cookie-monster-appeared", handleExtension)
        return () => window.removeEventListener("mautrix-cookie-monster-appeared", handleExtension)
    }, [loggedIn])

    useEffect(() => {
        const fn = async evt => {
            if (evt.data.type !== "use-desktop-login") {
                return
            }
            setUseDesktopLogin(true)
        }
        window.addEventListener("message", fn)
        return () => window.removeEventListener("message", fn)
    }, [])

    if (!loggedIn) {
        return html`<${LoginView}
            onLoggedIn=${() => setLoggedIn(Boolean(localStorage.accessToken))}
        />`
    }

    const handleLogout = evt => {
        evt.preventDefault()
        logout().catch(err => console.error("Error logging out:", err)).finally(() => {
            localStorage.clear()
            setLoggedIn(false)
        })
    }

    return html`
        <header class=${classes.topbar}>
            ${!useDesktopLogin && html`<div class=${classes.loginInfo}>
                <span>Logged in as ${localStorage.mxUserID}</span>
                <${NavButton} onClick=${handleLogout} icon="res/logout.svg"
                              style="border-radius: 0 0 0 .25rem;">
                    Log out
                </NavButton>
            </div>`}
            <nav class=${classes.nav}>
                <${BridgeButton} bridge="mautrix-telegram">Telegram</BridgeButton>
                <${BridgeButton} bridge="mautrix-facebook">Facebook</BridgeButton>
                <${BridgeButton} bridge="mautrix-hangouts">Hangouts</BridgeButton>
                <${BridgeButton} bridge="mautrix-whatsapp">WhatsApp</BridgeButton>
                <${BridgeButton} bridge="mautrix-twitter">Twitter</BridgeButton>
                <${BridgeButton} bridge="mx-puppet-slack">Slack</BridgeButton>
                <${BridgeButton} bridge="mx-puppet-twitter">Twitter</BridgeButton>
                <${BridgeButton} bridge="mx-puppet-instagram">Instagram</BridgeButton>
            </nav>
        </header>

        <${Route} exact path="/">Use the navigation bar above to view bridge settings</Route>
        <${Route} path="/mautrix-telegram" component=${TelegramBridge} />
        <${Route} path="/mautrix-facebook">
            <${FacebookBridge} useDesktopLogin=${useDesktopLogin} />
        </Route>
        <${Route} path="/mautrix-hangouts">
            <${HangoutsBridge} useDesktopLogin=${useDesktopLogin} />
        </Route>
        <${Route} path="/mautrix-whatsapp" component=${WhatsAppBridge} />
        <${Route} path="/mautrix-twitter" >
            <${TwitterBridge} useDesktopLogin=${useDesktopLogin} />
        </Route>
        <${Route} path="/mx-puppet-slack" component=${SlackBridge} />
        <${Route} path="/mx-puppet-twitter" component=${MxPuppetTwitterBridge} />
        <${Route} path="/mx-puppet-instagram" component=${InstagramBridge} />
        ${dockerControls && html`<details>
            <summary>Docker controls</summary>
            <${DockerControls} />
        </details>`}
    `
}

export default Main
