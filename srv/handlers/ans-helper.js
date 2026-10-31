async function getANSCredentials() {
    const vcap = JSON.parse(process.env.VCAP_SERVICES || "{}");
    return vcap["alert-notification"]?.[0]?.credentials || null;
}

async function getANSToken(credentials) {
    const response = await fetch(credentials.oauth_url, {
        method: "POST",
        signal: AbortSignal.timeout(5000),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            grant_type: "client_credentials",
            client_id: credentials.client_id,
            client_secret: credentials.client_secret
        })
    });
    const data = await response.json();
    return data.access_token;
}

// Runs after commit and nobody awaits it, so it must never throw.
async function sendAlert({ eventType, severity = "INFO", subject, body }) {
    try {
        const credentials = await getANSCredentials();
        if (!credentials) {
            console.warn("[ANS] Not bound — skipping alert:", eventType);
            return;
        }
        const token = await getANSToken(credentials);
        await fetch(`${credentials.url}/cf/producer/v1/resource-events`, {
            method: "POST",
            signal: AbortSignal.timeout(5000),
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                eventType,
                severity,
                category: "NOTIFICATION",
                subject,
                body,
                resource: {
                    resourceName: "enterprise-approval-workflow",
                    resourceType: "CAP Application",
                    tags: {}
                },
                tags: { "ans:enableEmail": "true" }
            })
        });
        console.log("[ANS] Alert sent:", eventType);
    } catch (err) {
        console.error("[ANS] Failed to send alert:", err.message);
    }
}

module.exports = { sendAlert };