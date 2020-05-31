const sha256 = require("sha256");
const Blockchain = require("../lib/blockchain");
const User = require("../models/user");

const Users = new Blockchain();

class UsersService {
  get blockchain() {
    return Users.fullBlockchain;
  }

  isValidChain(blockchain) {
    return Users.validate(blockchain);
  }

  replaceChain(blockchain) {
    return Users.replace(blockchain);
  }

  hasUser({ username }) {
    const index = Users.blockchain.findIndex(
      ({ data }) => data.username === username
    );

    return index !== -1;
  }

  valid({ username, password }) {
    const index = Users.blockchain.findIndex(
      ({ data }) =>
        data.username === username && data.password === sha256(password)
    );

    return index !== -1;
  }

  create({ username, password, name, description }) {
    const user = new User({
      username,
      password: sha256(password),
      name,
      description,
    });
    Users.add(user);

    return user;
  }

  getUser({ username }) {
    const { data } = Users.blockchain.find(
      ({ data }) => data.username === username
    );

    return {
      username: data.username,
      name: data.name,
      description: data.description,
      subscriptions: data.subscriptions,
    };
  }

  getFullUser({ username }) {
    const { data } = Users.blockchain.find(
      ({ data }) => data.username === username
    );

    return data;
  }

  subscribe({ username, subscription }) {
    const target = this.getFullUser({ username });

    if (!target.subscriptions.includes(subscription)) {
      const subscriptions = [...target.subscriptions, subscription];
      const user = new User({ ...target, subscriptions });
      Users.add(user);
    }

    return this.getUser({ username });
  }

  unsubscribe({ username, subscription }) {
    const target = this.getFullUser({ username });

    if (target.subscriptions.includes(subscription)) {
      const subscriptions = target.subscriptions.filter(
        (s) => s !== subscription
      );
      const user = new User({ ...target, subscriptions });
      Users.add(user);
    }

    return this.getUser({ username });
  }
}

module.exports = new UsersService();
