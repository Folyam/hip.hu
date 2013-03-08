module.exports.simple = {
  APIKey: process.env.Google_APIKey,
};

module.exports.webapp = {
  ClientId: process.env.Google_ClientId,
  ClientSecret: process.env.Google_ClientSecret,
  Basic: "https://accounts.google.com",
  AuthUri: "/o/oauth2/auth",
  TokenUri: "/o/oauth2/token"
}