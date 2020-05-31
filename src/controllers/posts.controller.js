const reqPromise = require("request-promise");

const network = require("../lib/network");
const postsService = require("../services/posts.service");
const usersService = require("../services/users.service");
const Jwt = require("../lib/jwt");

class PostsController {
  create(req, res) {
    const { broadcast } = req.params;
    const { username, data, image, link, tags } = req.body;

    if (!(username && data))
      return res.status(400).send({ error: "Bad request!" });

    if (!usersService.hasUser({ username }))
      return res.status(404).send({ error: "User not found!" });

    const user = usersService.getUser({ username });
    const post = postsService.create({ user, data, image, link, tags });

    if (!broadcast) return res.status(200).send(post);

    const requests = [];
    network.nodes.forEach((node) => {
      const requestOptions = {
        uri: `${node}/posts`,
        method: "POST",
        headers: { Authorization: Jwt.generate(node) },
        body: { username, data, image, link, tags },
        json: true,
      };

      requests.push(reqPromise(requestOptions));
    });

    Promise.all(requests).then(() => {
      return res.status(200).send(post);
    });
  }

  getPosts(req, res) {
    const { offset } = req.params;
    const data = postsService.getPosts({ offset });

    return res.status(200).send(data);
  }

  getFeed(req, res) {
    const { username, offset } = req.params;
    const { subscriptions } = usersService.getUser({ username });
    const data = postsService.getFeed({
      username,
      subscriptions,
      offset,
    });

    return res.status(200).send(data);
  }

  getByUser(req, res) {
    const { username, offset } = req.params;
    const data = postsService.getByUser({ username, offset });

    return res.status(200).send(data);
  }

  getByTag(req, res) {
    const { tag, offset } = req.params;
    const data = postsService.getByTag({ tag, offset });

    return res.status(200).send(data);
  }

  getTags(req, res) {
    const tags = postsService.getTags();

    return res.status(200).send(tags);
  }
}

module.exports = new PostsController();
