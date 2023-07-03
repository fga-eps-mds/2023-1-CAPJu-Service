import "sequelize";
import { Op } from "sequelize";
import {
  filterByName,
  filterByNicknameAndRecord,
} from "../../utils/filters.js";

describe("filter test", () => {
  test("test filterByNicknameAndRecord", async () => {
    const filter = "123";
    const expectFilter = {
      [Op.or]: [
        { record: { [Op.like]: `%${filter}%` } },
        { nickname: { [Op.like]: `%${filter}%` } },
      ],
    };
    const sendedObject = {
      query: {
        filter: filter,
      },
    };
    expect(filterByNicknameAndRecord(sendedObject)).toEqual(expectFilter);
  });

  test("test filterByName", async () => {
    const filter = "teste";
    const expectFilter = {
      [Op.or]: [{ name: { [Op.like]: `%${filter}%` } }],
    };
    const sendedObject = {
      query: {
        filter: filter,
      },
    };
    expect(filterByName(sendedObject)).toEqual(expectFilter);
  });
});