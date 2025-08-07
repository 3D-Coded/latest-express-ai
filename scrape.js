import cheerio from "cheerio";

export async function scrape(url) {
  const response = await fetch(url);
  const html = await response.text();

  const $ = cheerio.load(html);
  const links = [];

  $("a").each((index, element) => {
    const href = $(element).attr("href");
    if (href && href.startsWith("http")) {
      links.push(href);
    }
  });
  return links;
}
