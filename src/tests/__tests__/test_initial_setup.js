import { Database } from '../TestDatabase.js';
import Unit from '../../models/Unit.js';
import User from '../../models/User.js';
import Role from '../../models/Role.js';

describe('initial database', () => {
  beforeEach(async () => {
    // console.log("Preparing test...");
    const database = new Database();
    await database.migrate();
    await database.seed();
    // console.log("Test prepared");
  });

  test('unit exists', async () => {
    const foundUnit = await Unit.findByPk(1);
    expect(foundUnit.idUnit).toBe(1);
    expect(foundUnit.name).toBe("FGA");
  });

  test('single unit exists', async () => {
    const amount = await Unit.count();
    expect(amount).toBe(1);
  });

  test('admin user exists', async () => {
    const expectedCpf = '12345678901';
    const foundUser = await User.findByPk(expectedCpf);
    expect(foundUser.cpf).toBe(expectedCpf);
    expect(foundUser.accepted).toBe(true);
    expect(foundUser.idRole).toBe(5);
  });

  test('unaccepted user exists', async () => {
    const expectedCpf = '12345678909';
    const foundUser = await User.findByPk(expectedCpf);
    expect(foundUser.cpf).toBe(expectedCpf);
    expect(foundUser.accepted).toBe(false);
    expect(foundUser.idRole).toBe(1);
  });

  test('two users exist', async () => {
    const amount = await User.count();
    expect(amount).toBe(2);
  });

  test.each([
    {
      name: 'Estagiário',
      accessLevel: 4
    },
    {
      name: 'Servidor',
      accessLevel: 3
    },
    {
      name: 'Juiz',
      accessLevel: 2
    },
    {
      name: 'Diretor',
      accessLevel: 1
    },
    {
      name: 'Administrador',
      accessLevel: 5
    }
  ])("role '$name' exists", async ({name, accessLevel}) => {
    const foundRoles = await Role.findAll({
      where: {
        name: name
      }
    });

    expect(foundRoles.length).toBe(1);
    expect(foundRoles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name,
          accessLevel
        })
      ])
    );
    /*expect(foundRoles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          accessLevel: accessLevel
        })
      ])
    );*/
  });
});
