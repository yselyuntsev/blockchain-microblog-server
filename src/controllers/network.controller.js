const reqPromise = require("request-promise");

const network = require("../lib/network");
const postsService = require("../services/posts.service");
const usersService = require("../services/users.service");

class NetworkController {
  getBlockchain(req, res) {
    const postsBlockchain = postsService.blockchain;
    const usersBlockchain = usersService.blockchain;

    return res.status(200).send({ postsBlockchain, usersBlockchain });
  }

  getNodes(req, res) {
    return res.status(200).send({ nodes: [...network.nodes, network.url] });
  }

  registerNode(req, res) {
    const { url } = req.body;
    if (!network.hasNode(url) && url !== network.url) network.addNode(url);

    if (url === network.url) {
      const requestOptions = {
        uri: `${url}/network/consensus`,
        method: "GET",
      };
      reqPromise(requestOptions);
    }

    return res.status(200).send({ url });
  }

  registerBulkNodes(req, res) {
    const { nodes } = req.body;
    nodes.forEach((url) => {
      if (!network.hasNode(url) && url !== network.url) network.addNode(url);
    });

    return res.status(200).send({ nodes: network.nodes });
  }

  broadcastRegister(req, res) {
    const { url } = req.body;

    if (!network.hasNode(url) && url !== network.url) network.addNode(url);

    const registerNodes = [];
    network.nodes.forEach((node) => {
      const requestOptions = {
        uri: `${node}/network/register-node`,
        method: "POST",
        body: { url },
        json: true,
      };

      registerNodes.push(reqPromise(requestOptions));
    });

    Promise.all(registerNodes)
      .then(() => {
        const bulkRegisterOptions = {
          uri: `${url}/network/register-bulk-nodes`,
          method: "POST",
          body: { nodes: [...network.nodes, network.url] },
          json: true,
        };

        return reqPromise(bulkRegisterOptions);
      })
      .then(() => {
        return res.status(200).send(url);
      });
  }

  consensus(req, res) {
    const requests = [];
    network.nodes.forEach((node) => {
      const requestOptions = {
        uri: `${node}/network/blockchain`,
        method: "GET",
      };
      requests.push(reqPromise(requestOptions));
    });
    Promise.all(requests).then((response) => {
      const usersBlockchainLength = usersService.blockchain.length;
      const postsBlockchainLength = postsService.blockchain.length;
      let usersMaxChainLength = usersBlockchainLength;
      let postsMaxChainLength = postsBlockchainLength;
      let usersLongestChain = null;
      let postsLongestChain = null;
      response.forEach((response) => {
        const { postsBlockchain, usersBlockchain } = JSON.parse(response);
        if (postsBlockchain.length > postsMaxChainLength) {
          postsMaxChainLength = postsBlockchain.length;
          postsLongestChain = postsBlockchain;
        }
        if (usersBlockchain.length > usersMaxChainLength) {
          usersMaxChainLength = usersBlockchain.length;
          usersLongestChain = usersBlockchain;
        }
      });
      if (postsLongestChain && postsService.isValidChain(postsLongestChain)) {
        postsService.replaceChain(postsLongestChain);
      }
      if (usersLongestChain && usersService.isValidChain(usersLongestChain)) {
        usersService.replaceChain(usersLongestChain);
      }
      return res.status(200).send({ message: "Updated", response });
    });
  }
}

module.exports = new NetworkController();
