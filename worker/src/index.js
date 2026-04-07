export default {
  async fetch(request, env) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const data = await request.json();

      const text = `
New LatentShip Intake

Name: ${data.firstName}
Email: ${data.email}
Company: ${data.company}

Need: ${data.needType}
Timeline: ${data.timeline}

Brief:
${data.projectBrief}
      `;

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: "hello@latentship.com",
          to: [env.LEAD_FORWARD_TO],
          reply_to: data.email,
          subject: "New LatentShip intake",
          text
        })
      });

      if (!res.ok) {
        const body = await res.text();
        return new Response(JSON.stringify({ error: body }), {
          status: res.status,
          headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" }
      });
    }
  }
};
