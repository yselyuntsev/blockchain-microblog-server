const Blockchain = require("../lib/blockchain");
const Post = require("../models/post");
const Fuzzy = require("../lib/fuzzy");

const Posts = new Blockchain();

class PostsService {
  get blockchain() {
    return Posts.fullBlockchain;
  }

  isValidChain(blockchain) {
    return Posts.validate(blockchain);
  }

  replaceChain(blockchain) {
    return Posts.replace(blockchain);
  }

  validate(postData) {
    const coincidences = [];

    Posts.blockchain.forEach(({ data }) => {
      const value = Fuzzy.calculateFuzzyEqualValue(postData, data.data);
      if (value >= 0.25) coincidences.push({ value, id: data.id });
    });

    return coincidences;
  }

  create({ user, data, link, image, tags }) {
    const coincidences = this.validate(data);
    const post = new Post({ user, data, link, image, tags, coincidences });
    Posts.add(post);

    return post;
  }

  getPosts({ offset }) {
    const items = [];
    let countOfItems = 0;
    let start = 0;
    let hasNext = false;

    for (let i = offset || 0; i < Posts.blockchain.length; i++) {
      const { data } = Posts.blockchain[i];
      start = i + 1;
      items.push(data);
      countOfItems++;
      hasNext = !!(start && items.length);

      if (countOfItems === 10) break;
    }

    return { start, items, hasNext };
  }

  getFeed({ username, subscriptions, offset }) {
    const items = [];
    let countOfItems = 0;
    let start = 0;
    let hasNext = false;

    for (let i = offset || 0; i < Posts.blockchain.length; i++) {
      const { data } = Posts.blockchain[i];
      const isSub = subscriptions.includes(data.user.username);
      const isAuthor = data.user.username === username;
      start = i + 1;
      hasNext = !!(start && items.length);

      if (isSub || isAuthor) {
        items.push(data);
        countOfItems++;
      }

      if (countOfItems === 10) break;
    }

    return { start, items, hasNext };
  }

  getByUser({ username, offset }) {
    const items = [];
    let countOfItems = 0;
    let start = 0;
    let hasNext = false;

    for (let i = offset || 0; i < Posts.blockchain.length; i++) {
      const { data } = Posts.blockchain[i];
      const isAuthor = data.user.username === username;
      start = i + 1;
      hasNext = !!(start && items.length);

      if (isAuthor) {
        items.push(data);
        countOfItems++;
      }

      if (countOfItems === 10) break;
    }

    return { start, items, hasNext };
  }

  getByTag({ tag, offset }) {
    const items = [];
    let countOfItems = 0;
    let start = 0;
    let hasNext = false;

    for (let i = offset || 0; i < Posts.blockchain.length; i++) {
      const { data } = Posts.blockchain[i];
      start = i + 1;
      hasNext = !!(start && items.length);

      if (data.tags.includes(tag)) {
        items.push(data);
        countOfItems++;
      }

      if (countOfItems === 10) break;
    }

    return { start, items, hasNext };
  }

  getTags() {
    const items = [];
    let countOfItems = 0;

    for (let i = 0; i < Posts.blockchain.length; i++) {
      const { data } = Posts.blockchain[i];

      if (data.tags.length) {
        for (const tag of data.tags) {
          if (!items.includes(tag)) items.push(tag);
        }

        countOfItems++;
      }

      if (countOfItems >= 10) break;
    }

    return items;
  }
}

module.exports = new PostsService();
