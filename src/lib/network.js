class Network {
  constructor(url) {
    this.url = url;
    this.nodes = [];
  }

  hasNode(url) {
    return this.nodes.includes(url);
  }

  addNode(url) {
    this.nodes.push(url);
  }
}

module.exports = new Network(process.argv[3]);
