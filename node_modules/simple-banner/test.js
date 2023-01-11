let banner = require("./banner.js");
let chai = require("chai");
const expect = chai.expect;
describe("banner", () => {
  describe("set()", () => {
    it("should set a banner with just a project name", () => {
      expect(banner.set("Project Name")).to.be.true;
    });
    it("should set a banner with a project name and additional information", () => {
      expect(banner.set("Project Name", "Project Description")).to.be.true;
    });
    it("should set a banner with a project name and additional information and rainbow option", () => {
      expect(banner.set("Project Name", "Project Description", 1)).to.be.true;
    });
    it("should set a banner with a project name and additional information without rainbow option", () => {
      expect(banner.set("Project Name", "Project Description", 0)).to.be.true;
    });
  });
});
