export default async function handler(req, res) {
  const { email } = req.query;

  if (!email || !email.includes("@")) {
    return res.status(400).json({ error: "Valid email required" });
  }

  const apiKey = process.env.HIBP_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "API key not configured" });
  }

  try {
    const response = await fetch(
      `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`,
      {
        headers: {
          "hibp-api-key": apiKey,
          "user-agent": "myleakvalue.com",
        },
      }
    );

    if (response.status === 404) {
      return res.status(200).json([]);
    }

    if (response.status === 429) {
      const retryAfter = response.headers.get("retry-after") || "2";
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({ error: "Rate limited", retryAfter: parseInt(retryAfter) });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: `HIBP API error: ${response.status}` });
    }

    const data = await response.json();

    // Filter out spam lists, fabricated, and unverified breaches
    const filtered = data.filter(b => b.IsVerified && !b.IsFabricated && !b.IsSpamList && !b.IsRetired);

    // Map to our format
    const breaches = filtered.map(b => ({
      name: b.Title || b.Name,
      domain: b.Domain,
      date: b.BreachDate,
      count: b.PwnCount,
      description: b.Description,
      dataTypes: b.DataClasses,
      logo: b.LogoPath || (b.Domain ? `https://logo.clearbit.com/${b.Domain}` : null),
      isSensitive: b.IsSensitive,
      isMalware: b.IsMalware,
      isStealerLog: b.IsStealerLog,
    }));

    res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate=86400");
    return res.status(200).json(breaches);
  } catch (err) {
    return res.status(500).json({ error: "Failed to check breaches" });
  }
}
