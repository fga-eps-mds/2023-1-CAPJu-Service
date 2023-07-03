import "sequelize";
import { Op } from "sequelize";
import {
  filterByName,
  filterByNicknameAndRecord,
  filterByFullName,
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

  test("test filterByFullname", async () => {
    const filter = "Teste silva";
    const expectFilter = {
      [Op.or]: [{ fullName: { [Op.like]: `%${filter}%` } }],
    };
    const sendedObject = {
      query: {
        filter: filter,
      },
    };
    expect(filterByFullName(sendedObject)).toEqual(expectFilter);
  });
});
