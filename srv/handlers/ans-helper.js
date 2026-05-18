async function getANSCredentials() {
    const vcap = JSON.parse(process.env.VCAP_SERVICES || "{}");
    return vcap["alert-notification"]?.[0]?.credentials || null;
}

async function getANSToken(credentials) {
    const response = await fetch(`${credentials.oauth_url}/oauth/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `grant_type=client_credentials&client_id=${credentials.client_id}&client_secret=${credentials.client_secret}`
    });
    const data = await response.json();
    return data.access_token;
}

async function sendAlert({ eventType, severity = "INFO", subject, body }) {
    const credentials = await getANSCredentials();
    if (!credentials) {
        console.warn("[ANS] Not bound — skipping alert:", eventType);
        return;
    }

    try {
        const token = await getANSToken(credentials);
        await fetch(`${credentials.url}/cf/producer/v1/resource-events`, {
            method: "POST",
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
                tags: { "ans:enableEmail": "true" }
            })
        });
        console.log("[ANS] Alert sent:", eventType);
    } catch (err) {
        console.error("[ANS] Failed to send alert:", err.message);
    }
}

module.exports = { sendAlert };