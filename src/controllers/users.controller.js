const reqPromise = require("request-promise");

const network = require("../lib/network");
const Jwt = require("../lib/jwt");
const usersService = require("../services/users.service");

class UsersController {
  getUser(req, res) {
    const { username } = req.params;

    if (!usersService.hasUser({ username }))
      return res.status(404).send({ error: "User not found!" });

    const user = usersService.getUser({ username });

    return res.status(200).send(user);
  }

  getSubscriptions(req, res) {
    const { username } = req.params;

    const subscriptions = [];

    if (!usersService.hasUser({ username }))
      return res.status(404).send({ error: "User not found!" });

    const user = usersService.getUser({ username });

    user.subscriptions.forEach((subscription) => {
      subscriptions.push(usersService.getUser({ username: subscription }));
    });

    return res.status(200).send(subscriptions);
  }

  subscribe(req, res) {
    const { broadcast } = req.params;
    const { username, subscription } = req.body;

    if (username === subscription)
      return res.status(400).send({ ok: false, error: "Bad request!" });

    const target = usersService.hasUser({ username });
    const subscriber = usersService.hasUser({ username: subscription });

    if (!(target && subscriber))
      return res.status(404).send({ ok: false, error: "Users not found!" });

    const user = usersService.subscribe({ username, subscription });

    if (!broadcast) return res.status(200).send(user);

    const requests = [];
    network.nodes.forEach((node) => {
      const requestOptions = {
        uri: `${node}/users/subscribe`,
        method: "POST",
        headers: { Authorization: Jwt.generate(node) },
        body: { username, subscription },
        json: true,
      };

      requests.push(reqPromise(requestOptions));
    });

    Promise.all(requests).then(() => {
      return res.status(200).send(user);
    });
  }

  unsubscribe(req, res) {
    const { broadcast } = req.params;
    const { username, subscription } = req.body;

    const target = usersService.hasUser({ username });
    const subscriber = usersService.hasUser({ username: subscription });

    if (!(target && subscriber))
      return res.status(404).send({ ok: false, error: "Users not found!" });

    const user = usersService.unsubscribe({ username, subscription });

    if (!broadcast) return res.status(200).send(user);

    const requests = [];
    network.nodes.forEach((node) => {
      const requestOptions = {
        uri: `${node}/users/unsubscribe`,
        method: "POST",
        headers: { Authorization: Jwt.generate(node) },
        body: { username, subscription },
        json: true,
      };

      requests.push(reqPromise(requestOptions));
    });

    Promise.all(requests).then(() => {
      return res.status(200).send(user);
    });
  }
}

module.exports = new UsersController();
