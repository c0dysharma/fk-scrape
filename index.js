const { default: axios } = require("axios");
const cheerio = require("cheerio");

class Scrapper{
  async getMeta (link, headers={}){
    const config = {headers}
    const res = await axios.get(link, config);
    const data = await res.data;
    const $ = cheerio.load(data);

    const title = $("h1 > span[class='B_NuCI']");
    const description = $("._1mXcCf > p");
    const originalPrice = $("._25b18c >  ._3I9_wc");
    const discountedPrice = $("._25b18c > ._16Jk6d");
    let productImages = $("._2E1FGS > img");

    if (productImages.length) {
      const arr = [];
      for (let image of productImages) {
        arr.push(image.attribs["src"]);
      }
      productImages = arr;
    }

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
    };
    return metaData;
  }
}

module.exports = Scrapper;