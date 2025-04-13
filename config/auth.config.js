module.exports = {
  // Clé secrète pour signer les tokens JWT
  secret: "gamebet_secret_key",
  
  // Durée de validité du token (en secondes)
  // 86400 = 24 heures
  jwtExpiration: 86400,
  
  // Options de configuration pour bcrypt
  saltRounds: 8
};
