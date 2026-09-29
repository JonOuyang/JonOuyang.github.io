#!/usr/bin/env node

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envLocalPath = path.join(repoRoot, '.env.local');

function readEnvLocal(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) {
    return env;
  }
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    let val = line.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

let clientId = process.env.GOOGLE_CLIENT_ID;
let clientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  const localEnv = readEnvLocal(envLocalPath);
  if (!clientId) clientId = localEnv.GOOGLE_CLIENT_ID;
  if (!clientSecret) clientSecret = localEnv.GOOGLE_CLIENT_SECRET;
}

if (!clientId || !clientSecret) {
  console.error(`Error: Missing Google OAuth credentials.
Please provide GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET via environment variables or in .env.local:

Example .env.local:
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret

Then run:
  node scripts/google-auth.mjs
`);
  process.exit(1);
}

const PORT = 53682;
const HOST = '127.0.0.1';
const redirectUri = `http://${HOST}:${PORT}/callback`;
const state = crypto.randomBytes(16).toString('hex');

const consentUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
consentUrl.searchParams.set('client_id', clientId);
consentUrl.searchParams.set('redirect_uri', redirectUri);
consentUrl.searchParams.set('response_type', 'code');
consentUrl.searchParams.set('access_type', 'offline');
consentUrl.searchParams.set('prompt', 'consent');
consentUrl.searchParams.set('include_granted_scopes', 'true');
consentUrl.searchParams.set('state', state);
consentUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/calendar.freebusy https://www.googleapis.com/auth/calendar.events');

const server = http.createServer(async (req, res) => {
  try {
    const reqUrl = new URL(req.url, `http://${HOST}:${PORT}`);
    if (reqUrl.pathname !== '/callback') {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }

    const error = reqUrl.searchParams.get('error');
    if (error) {
      const errorDesc = reqUrl.searchParams.get('error_description') || error;
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>Authentication Failed</h1><p>${errorDesc}</p>`);
      console.error(`\nOAuth error received: ${errorDesc}`);
      server.close(() => process.exit(1));
      return;
    }

    const returnedState = reqUrl.searchParams.get('state');
    if (!returnedState || returnedState !== state) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>Authentication Failed</h1><p>Invalid state parameter.</p>');
      console.error('\nOAuth error: Invalid or mismatched state parameter.');
      server.close(() => process.exit(1));
      return;
    }

    const code = reqUrl.searchParams.get('code');
    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h1>Authentication Failed</h1><p>Missing authorization code.</p>');
      console.error('\nOAuth error: Missing authorization code in callback.');
      server.close(() => process.exit(1));
      return;
    }

    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const data = await tokenRes.json();
    if (!tokenRes.ok || data.error) {
      const errorMsg = data.error_description || data.error || JSON.stringify(data);
      res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>Token Exchange Failed</h1><p>${errorMsg}</p>`);
      console.error(`\nToken exchange failed: ${errorMsg}`);
      server.close(() => process.exit(1));
      return;
    }

    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<!DOCTYPE html><html><body><h1>Done, you can close this tab</h1></body></html>');

    const refreshToken = data.refresh_token;
    if (refreshToken) {
      console.log('\nAuthentication successful!\n');
      console.log(`GOOGLE_REFRESH_TOKEN=${refreshToken}\n`);

      // Upsert into .env.local
      let currentContent = '';
      if (fs.existsSync(envLocalPath)) {
        currentContent = fs.readFileSync(envLocalPath, 'utf8');
      }
      const tokenRegex = /^GOOGLE_REFRESH_TOKEN=.*$/m;
      const newLine = `GOOGLE_REFRESH_TOKEN=${refreshToken}`;
      let newContent;
      if (tokenRegex.test(currentContent)) {
        newContent = currentContent.replace(tokenRegex, newLine);
      } else if (currentContent.length > 0) {
        newContent = currentContent.endsWith('\n') ? `${currentContent}${newLine}\n` : `${currentContent}\n${newLine}\n`;
      } else {
        newContent = `${newLine}\n`;
      }
      fs.writeFileSync(envLocalPath, newContent, 'utf8');
      console.log(`Updated GOOGLE_REFRESH_TOKEN in ${envLocalPath}`);
    } else {
      console.log('\nWarning: No refresh_token was returned by Google.');
      console.log("To obtain a new refresh token, remove the app's access at https://myaccount.google.com/permissions and run this script again.");
    }

    server.close(() => process.exit(0));
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Internal Error: ${err.message}`);
    console.error('\nInternal error processing callback:', err);
    server.close(() => process.exit(1));
  }
});

server.listen(PORT, HOST, () => {
  const urlStr = consentUrl.toString();
  console.log('Open the following URL in your browser and sign in with jonsouyang@ucla.edu:\n');
  console.log(urlStr);
  console.log(`\nWaiting for callback on ${redirectUri} ...`);

  const openCmd = process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${openCmd} "${urlStr}"`, () => {
    // Ignore failures
  });
});
