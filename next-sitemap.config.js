/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://www.friending.ac", // 반드시 본인의 도메인으로 변경
  generateRobotsTxt: true, // robots.txt도 생성할지 여부
  sitemapSize: 7000, // 한 파일에 포함될 최대 URL 수 (선택)
};
