const { v4: uuid } = require("uuid");

class User {
  constructor({ username, password , name, description, subscriptions }) {
    this.id = uuid().split("-").join("");
    this.username = username;
    this.password = password;
    this.name = name;
    this.description = description;
    this.subscriptions = subscriptions || [];
  }
}

module.exports = User;
