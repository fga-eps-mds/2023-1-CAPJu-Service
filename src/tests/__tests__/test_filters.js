import "sequelize";
import { Op } from "sequelize";
import {
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
});