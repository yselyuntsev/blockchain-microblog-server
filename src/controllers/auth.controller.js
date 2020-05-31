const reqPromise = require("request-promise");

const network = require("../lib/network");
const jwt = require("../lib/jwt");
const usersService = require("../services/users.service");

class AuthController {
  auth(req, res) {
    const { username, password } = req.body;

    if (!(username && password))
      return res.status(400).send({ error: "Bad request!" });

    if (!usersService.valid({ username, password }))
      return res.status(404).send({ error: "User not found!" });

    const token = jwt.generate(username);
    const user = usersService.getUser({ username });

    return res.status(200).send({ token, ...user });
  }

  register(req, res) {
    const { broadcast } = req.params;
    const { username, password, name, description } = req.body;

    if (!(username && password && name))
      return res.status(400).send({ error: "Bad request!" });

    if (usersService.hasUser({ username }))
      return res.status(409).send({ error: "User has been exist!" });

    const token = jwt.generate(username);
    const user = usersService.create({ username, password, name, description });

    if (!broadcast) return res.status(200).send({ token, ...user });

    const requests = [];
    network.nodes.forEach((node) => {
      const requestOptions = {
        uri: `${node}/register`,
        method: "POST",
        body: { username, password, name, description },
        json: true,
      };

      requests.push(reqPromise(requestOptions));
    });

    Promise.all(requests).then(() => {
      return res.status(200).send({ token, ...user });
    });
  }
}

module.exports = new AuthController();
