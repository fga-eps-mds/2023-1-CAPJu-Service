import { Database } from '../TestDatabase.js';
import Unit from '../../models/Unit.js';
import User from '../../models/User.js';
import Role from '../../models/Role.js';
import Priority from '../../models/Priority.js';

describe('initial database', () => {
  beforeEach(async () => {
    const database = new Database();
    await database.migrate();
    await database.seed();
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
  });

  test.each([
      {
        idPriority: 0,
        description: 'Sem prioridade',
      },
      {
        idPriority: 1,
        description: 'Art. 1048, II. Do CPC (ECA)',
      },
      {
        idPriority: 2,
        description: 'Art. 1048, IV do CPC (Licitação)',
      },
      {
        idPriority: 3,
        description: 'Art. 7, parágrafo 4, da Lei n 12.016/2009',
      },
      {
        idPriority: 4,
        description: 'Idosa(a) maior de 80 anos',
      },
      {
        idPriority: 5,
        description: 'Pessoa com deficiencia',
      },
      {
        idPriority: 6,
        description: 'Pessoa em situação de rua',
      },
      {
        idPriority: 7,
        description: 'Portador(a) de doença grave',
      },
      {
        idPriority: 8,
        description: 'Réu Preso',
      }
  ])("priority '$description' exists", async ({idPriority, description}) => {
    const foundRoles = await Priority.findAll({
      where: {
        idPriority
      }
    });

    expect(foundRoles.length).toBe(1);
    expect(foundRoles).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          idPriority,
          description
        })
      ])
    );
  });
});
