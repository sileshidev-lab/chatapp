import Keycloak from 'keycloak-js';
import { appConfig } from '../config.js';

let keycloak;
let initialized = false;

export function getKeycloak() {
  if (!keycloak) {
    keycloak = new Keycloak({
      url: appConfig.keycloakUrl,
      realm: appConfig.keycloakRealm,
      clientId: appConfig.keycloakClientId
    });
  }

  return keycloak;
}

export async function initKeycloak() {
  const client = getKeycloak();

  if (!initialized) {
    await client.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
      silentCheckSsoRedirectUri: `${window.location.origin}/silent-check-sso.html`
    });
    initialized = true;
  }

  return client;
}

export async function ensureFreshToken(minValidity = 30) {
  const client = getKeycloak();

  if (!client.authenticated) {
    return null;
  }

  await client.updateToken(minValidity);
  return client.token;
}
