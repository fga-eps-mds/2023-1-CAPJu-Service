import { Op } from "sequelize";
import {
  filterByNicknameAndRecord,
  filterByName,
  filterByFullName,
} from "../../utils/filters.js";

describe("filters", () => {
  describe("filterByNicknameAndRecord", () => {
    it("should return the correct filter object when filter is provided", () => {
      const req = {
        query: {
          filter: "John",
        },
      };

      const result = filterByNicknameAndRecord(req);

      expect(result).toEqual({
        [Op.or]: [
          { record: { [Op.like]: "%John%" } },
          { nickname: { [Op.like]: "%John%" } },
        ],
      });
    });

    it("should return an empty object when filter is not provided", () => {
      const req = {
        query: {},
      };

      const result = filterByNicknameAndRecord(req);

      expect(result).toEqual({});
    });
  });

  describe("filterByName", () => {
    it("should return the correct filter object when filter is provided", () => {
      const req = {
        query: {
          filter: "Smith",
        },
      };

      const result = filterByName(req);

      expect(result).toEqual({
        [Op.or]: [{ name: { [Op.like]: "%Smith%" } }],
      });
    });

    it("should return an empty object when filter is not provided", () => {
      const req = {
        query: {},
      };

      const result = filterByName(req);

      expect(result).toEqual({});
    });
  });

  describe("filterByFullName", () => {
    it("should return the correct filter object when filter is provided", () => {
      const req = {
        query: {
          filter: "John Doe",
        },
      };

      const result = filterByFullName(req);

      expect(result).toEqual({
        [Op.or]: [{ fullName: { [Op.like]: "%John Doe%" } }],
      });
    });

    it("should return an empty object when filter is not provided", () => {
      const req = {
        query: {},
      };

      const result = filterByFullName(req);

      expect(result).toEqual({});
    });
  });
});
