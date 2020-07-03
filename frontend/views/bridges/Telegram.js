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
import { useEffect, useState } from "../../web_modules/preact/hooks.js"
import { html } from "../../web_modules/htm/preact.js"

import track from "../../lib/api/tracking.js"
import * as api from "../../lib/api/telegram.js"
import * as config from "../../lib/api/config.js"
import { makeStyles } from "../../lib/theme.js"
import Alert from "../components/Alert.js"
import Button from "../components/Button.js"
import Spinner from "../components/Spinner.js"

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexDirection: "column",
        maxWidth: "25rem",
        width: "100%",
        boxSizing: "border-box",
        margin: "0 auto",
        padding: "0 1rem",
    },
    input: {
        ...theme.input(),
        width: "100%",
    },
    buttonGroup: {
        display: "flex",
        width: "100%",
        "& > button": {
            flex: 1,
            "&:not(:first-of-type)": {
                marginLeft: ".5rem",
            },
        },
    },
}), { name: "telegram" })

const TelegramLogin = ({ onLoggedIn }) => {
    const classes = useStyles()
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState("request_code")
    const [phone, setPhone] = useState("")
    const [botToken, setBotToken] = useState("")
    const [phoneCode, setPhoneCode] = useState(0)
    const [password, setPassword] = useState("")
    const [error, setError] = useState(null)

    const submit = async () => {
        track("Telegram login", { step })
        const payload = {}
        if (step === "bot_token") payload.token = botToken
        else if (step === "request_code") payload.phone = phone
        else if (step === "send_code") payload.code = phoneCode
        else if (step === "send_password") payload.password = password
        const resp = await api.login(step, payload)
        if (resp.state === "logged-in" || resp.state === "already-logged-in") {
            await onLoggedIn()
        } else {
            setStep({
                request: "request_code",
                token: "bot_token",
                code: "send_code",
                password: "send_password",
            }[resp.state])
        }
    }

    let content
    if (step === "request_code") {
        content = html`
            <p>Please enter your phone number to sign into the Telegram bridge.</p>
            <p>
                This works the same way as a normal Telegram client: you'll receive a code through
                SMS or an existing Telegram client and you input it here to sign in.
            </p>
            <input type="tel" value=${phone} placeholder="Phone number" class=${classes.input}
                   onChange=${evt => setPhone(evt.target.value)} />
            <div class=${classes.buttonGroup}>
                <${Button} type="submit" disabled=${!phone}>
                    ${loading ? html`<${Spinner} size=20 />` : "Request code"}
                </Button>
                <${Button} variant="outlined" onClick=${() => setStep("bot_token")}>
                    Use bot token
                </Button>
            </div>
        `
    } else if (step === "bot_token") {
        content = html`
            <p>
                You can use a bot token instead of a real account to sign in too.
                Note that bot accounts are significantly more limited than normal accounts.
            </p>
            <input type="text" value=${botToken} placeholder="Bot token" class=${classes.input}
                   onChange=${evt => setBotToken(evt.target.value)} />
            <div class=${classes.buttonGroup}>
                <${Button} type="submit" disabled=${!botToken}>
                    ${loading ? html`<${Spinner} size=20 />` : "Sign in"}
                </Button>
                <${Button} variant="outlined" onClick=${() => setStep("request_code")}>
                    Use phone number
                </Button>
            </div>
        `
    } else if (step === "send_code") {
        content = html`
            <p>Sign-in code sent. Please enter the code here.</p>
            <input type="number" value=${phoneCode} placeholder="Phone code" class=${classes.input}
                   onChange=${evt => setPhoneCode(evt.target.value)} />
            <${Button} type="submit" disabled=${!phoneCode}>
                ${loading ? html`<${Spinner} size=20 />` : "Sign in"}
            </Button>
        `
    } else if (step === "send_password") {
        content = html`
            <p>
                Sign-in code confirmed, but you have two-factor authentication enabled.
                Please enter your password here.
            </p>
            <input type="password" value=${password} placeholder="Password" class=${classes.input}
                   onChange=${evt => setPassword(evt.target.value)} />
            <${Button} type="submit" disabled=${!password}>
                ${loading ? html`<${Spinner} size=20 />` : "Sign in"}
            </Button>
        `
    }

    const onSubmit = evt => {
        evt.preventDefault()
        setLoading(true)
        setError(null)
        submit()
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }

    return html`<form class=${classes.root} onSubmit=${onSubmit}>
        <h2>Sign into Telegram</h2>
        <p>To start using the Matrix-Telegram bridge, sign in with your Telegram account below.</p>
        ${content}
        <${Alert} message=${error} />
    </form>`
}

const TelegramBridge = () => {
    const [bridgeState, setBridgeState] = useState(null)
    const [error, setError] = useState(null)

    useEffect(async () => {
        try {
            setBridgeState(await api.getMe())
        } catch (err) {
            setError(err.message)
        }
    }, [])

    const logout = async () => {
        track("Telegram logout")
        try {
            await api.logout()
            setBridgeState(await api.getMe())
        } catch (err) {
            setError(err.message)
        }
    }

    if (!bridgeState) {
        if (error) {
            return html`Error: ${error}`
        }
        return html`<${Spinner} size=80 green />`
    }

    const onLoggedIn = async () => setBridgeState(await api.getMe())

    return html`
        ${bridgeState.telegram ? html`
            Signed in as ${bridgeState.telegram.first_name} ${bridgeState.telegram.last_name}
            ${bridgeState.telegram.username && ` (@${bridgeState.telegram.username})`}
            <${Button} onClick=${logout} style="display: block; width: 10rem;">Sign out</Button>
        ` : html`<${TelegramLogin} onLoggedIn=${onLoggedIn} />`}
        <${Alert} message=${error} />
        ${config.internalBridgeInfo && html`<details>
            <summary>Internal bridge state</summary>
            <pre>${JSON.stringify(bridgeState, null, "  ")}</pre>
        </details>`}
    `
}

export default TelegramBridge
