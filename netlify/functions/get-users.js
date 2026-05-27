// ════════════════════════════════════════════════════════════════
//  KushOS — Get Users Function
//  Netlify Serverless Function
//
//  Called by the frontend login screen to fetch the approved user
//  hash list from Netlify Blobs. Returns only hashes + roles — no
//  plain-text codes are ever stored or transmitted.
//
//  This endpoint is intentionally public (no auth) because the
//  data it returns is only hashes. An attacker cannot reverse a
//  SHA-256 hash to obtain the original access code.
//
//  Netlify Blobs docs: https://docs.netlify.com/blobs/overview/
// ════════════════════════════════════════════════════════════════

const { getStore } = require('@netlify/blobs');

exports.handler = async function (event) {
  // CORS headers so the frontend SPA can fetch this
  const headers = {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, max-age=0',
    'Access-Control-Allow-Origin': '*',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const store = getStore({ name: 'kushos-users', consistency: 'strong' });
    const raw = await store.get('users');

    if (!raw) {
      // No users stored yet — return empty list (admin is hardcoded in frontend)
      return { statusCode: 200, headers, body: JSON.stringify({ users: [] }) };
    }

    const users = JSON.parse(raw);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ users }),
    };
  } catch (err) {
    console.error('KushOS get-users error:', err);
    // Return empty list on error — frontend falls back to local admin
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ users: [] }),
    };
  }
};
