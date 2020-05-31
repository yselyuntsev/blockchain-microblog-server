const { v4: uuid } = require("uuid");

class Post {
  constructor({ user, data, link, image, tags, coincidences }) {
    this.id = uuid().split("-").join("");
    this.user = user;
    this.timestamp = Date.now();
    this.data = data;
    this.link = link;
    this.image = image;
    this.tags = tags || [];
    this.coincidences = coincidences || [];
  }
}

module.exports = Post;
