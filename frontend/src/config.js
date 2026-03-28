const required = (value, fallback) => value ?? fallback;

export const appConfig = {
  keycloakUrl: required(import.meta.env.VITE_KEYCLOAK_URL, 'http://localhost:8080'),
  keycloakRealm: required(import.meta.env.VITE_KEYCLOAK_REALM, 'chatapp'),
  keycloakClientId: required(import.meta.env.VITE_KEYCLOAK_CLIENT_ID, 'chatapp-frontend'),
  userServiceUrl: required(import.meta.env.VITE_USER_SERVICE_URL, 'http://localhost:8081'),
  chatServiceUrl: required(import.meta.env.VITE_CHAT_SERVICE_URL, 'http://localhost:8082'),
  notificationServiceUrl: required(import.meta.env.VITE_NOTIFICATION_SERVICE_URL, 'http://localhost:8083')
};
