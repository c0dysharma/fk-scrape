const { default: axios } = require("axios");
const cheerio = require("cheerio");

class Scrapper {
  static baseURI = "https://flipkart.com";
  async getMeta(link, headers = {}) {
    const config = { headers };
    const res = await axios.get(link, config);
    const data = await res.data;
    const $ = cheerio.load(data);

    const title = $("h1 > span[class='B_NuCI']");
    const description = $("._1mXcCf > p");
    const originalPrice = $("._25b18c >  ._3I9_wc");
    const discountedPrice = $("._25b18c > ._16Jk6d");
    const oos = $("._1dVbu9");
    let productImages = $("._2E1FGS > img");
    let bigImage = $(".CXW8mj._3nMexc > img");
    let categories = $("._1MR4o5 > ._3GIHBu > a");

    // get product images
    if (productImages.length) {
      const arr = [];
      for (let image of productImages) {
        arr.push(image.attribs["src"]);
      }
      productImages = arr;
    } else {
      if (bigImage.length) productImages = [bigImage[0].attribs["src"]];
    }

    // get categories Tree
    if (categories.length) {
      let cats = "";

      // Removing first 'Home' value
      categories = categories.slice(1);
      for (let category of categories) {
        // print(categories)
        cats += " > " + category.firstChild.data;
      }

      // removing first ' >'
      cats = cats.slice(2);
      cats = cats.trim();

      categories = cats;
    } else categories = "Others";

    const metaData = {
      status: res.status,
      originalLink: link,
      productImages: productImages.length ? productImages : [],
      title: title.length ? title[0].firstChild.data : null,
      description: description.length ? description[0].firstChild.data : null,
      originalPrice: originalPrice.length
        ? "₹" + originalPrice[0].childNodes[2].data
        : null,
      discountedPrice: discountedPrice.length
        ? discountedPrice[0].firstChild.data
        : null,
      outOfStock: oos.length
        ? oos[0].firstChild.data.includes("out of stock")
        : false,
      categoriesTree: categories,
    };
    return metaData;
  }

  async getProductLinks(link, headers = {}) {
    const config = { headers };
    const res = await axios.get(link, config);
    const data = await res.data;
    const $ = cheerio.load(data);

    const products = $("._373qXS > ._2UzuFa");
    const result = [];
    for (let element of products) {
      let URI = element.attribs["href"];
      if (URI) result.push(Scrapper.baseURI + URI);
    }
    return result;
  }
}

module.exports = Scrapper;
