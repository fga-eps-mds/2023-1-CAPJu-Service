# CAPJu - Service

<div align="center">
  <img src="https://i.imgur.com/0KsqIUe.png" alt="logo">
</div>

## Sobre Projetos

O CAPJu é abreviação para _"Controle e Acompanhamento de Processos da Justiça"_, no qual trata-se de uma projeto de código aberto que tem como objetivo ajudar os usuários da 4ª vara cível da Justiça Federal na realização de gerenciar os processos.

Este repositório, em especial, é totalmente dedicado à manutenção dos detalhes do Microserviço Service do projeto. Sinta-se livre para contribuir, mas antes leia o guia de contribuição.

O CAPJu é uma aplicação _Web_ compatível com qualquer navegador.

## Tecnologias

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white)
![Sequelize](https://img.shields.io/badge/Sequelize-52B0E7?style=for-the-badge&logo=Sequelize&logoColor=white)
![Yarn](https://img.shields.io/badge/yarn-%232C8EBB.svg?style=for-the-badge&logo=yarn&logoColor=white)
<!-- ![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB) -->

Este é o repositório foi utilizado o seguinte para seu desenvolvimento:

- [Node.js](https://nodejs.org/en/) (Versão 14) Como ambiente de execução de JavaScript.
- [Express.js](https://expressjs.com/) Como framework de servidor e camada de controller.
- [Postgres](https://www.postgresql.org/) (Versão 14 ou superior) Como camada de banco de dados
- [Sequelize](https://sequelize.org/).

## Instalação
### Configurando .env

Configure o arquivo .env dos repositórios service e user-new igual abaixo:

```
POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_DATABASE=
POSTGRES_USER=
POSTGRES_PASSWORD=
JWT_SECRET=
```

### Instalado bibliotecas do node e criando/populando banco

Para instalar as bibliotecas de cada repositorio basta apenas dar o seguinte comando

```
yarn install && yarn migration && yarn seed
```
## Execute o projeto

Para executar o projeto é recomendar executar os comandos na ordem de repositórios de back-end primeiro e front-end ao final. E cada um em um terminal diferente

```
yarn start
```
## Testes

Para rodar os testes execulte:

```bash
$ yarn test
```

## Instalando de Dependecias

Pode ser utilizado o seguinte comando para inserir novas dependencias no sistema

```bash
$ yarn add "nome_da_dependencia"
```

### Deployment

[GitHub Actions](https://github.com/fga-eps-mds/2022-2-CAPJu-Service/actions).

## Contribuição

Certifique-se de ler o [Guia de Contribuição](https://github.com/fga-eps-mds/2022-2-CAPJu-Doc/blob/main/.github/CONTRIBUTING.md) antes de realizar qualquer atividade no projeto!

## Licença

O CAPJu está sob as regras aplicadas na licença [MIT](https://github.com/fga-eps-mds/2022-2-CAPJu-Doc/blob/main/LICENSE)

## Contribuidores

<a href="https://github.com/fga-eps-mds/2022-2-CAPJu-Service/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=fga-eps-mds/2022-2-CAPJu-Service" />
</a>
