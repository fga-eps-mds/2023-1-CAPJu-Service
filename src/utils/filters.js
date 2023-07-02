import { Op } from "sequelize";

export function filterByNicknameAndRecord(req) {
  const { filter } = req.query;
  return filter
    ? {
        [Op.or]: [
          { record: { [Op.like]: `%${filter}%` } },
          { nickname: { [Op.like]: `%${filter}%` } },
        ],
      }
    : {};
}

export function filterByName(req) {
  const { filter } = req.query;
  return filter
    ? {
        [Op.or]: [{ name: { [Op.like]: `%${filter}%` } }],
      }
    : {};
}

export function filterByFullName(req) {
  const { filter } = req.query;
  return filter
    ? {
        [Op.or]: [{ fullName: { [Op.like]: `%${filter}%` } }],
      }
    : {};
}
