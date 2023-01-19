import { Router } from "express";
import FlowController from "./controllers/FlowController.js";
import ProcessController from "./controllers/ProcessController.js";
import StageController from "./controllers/StageController.js";
import UnityController from "./controllers/UnityController.js";
import UnitController from "./controllers/UnitController.js";
import RoleController from "./controllers/RoleController.js";
import UserContoller from "./controllers/UserContoller.js";
import { protect, authRole } from "./middleware/authMiddleware.js";
import { ROLE } from "./schemas/role.js";

const routes = Router();

routes.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Up and running',
  });
});

//Rotas de processos
routes.get(
  "/processes",
  ProcessController.index
);
routes.get(
  "/processes/:flowId",
  protect,
  authRole([ROLE.JUIZ, ROLE.DIRETOR, ROLE.SERVIDOR, ROLE.ESTAGIARIO]),
  ProcessController.processesInFlow
);
routes.get(
  "/getOneProcess/:id",
  ProcessController.getById
);
routes.post(
  "/newProcess",
  ProcessController.store
);
routes.put(
  "/updateProcess/:id",
  protect,
  authRole([ROLE.DIRETOR, ROLE.SERVIDOR]),
  ProcessController.updateProcess
);
routes.delete(
  "/deleteProcess/:registro",
  protect,
  authRole([ROLE.DIRETOR, ROLE.SERVIDOR]),
  ProcessController.deleteProcess
);
routes.put("/processNextStage/", protect, ProcessController.nextStage);
routes.put("/processNewObservation/", protect, ProcessController.newObservation);

//Rotas de Fluxos
// routes.get(
//   "/flows",
//   protect,
//   authRole([ROLE.JUIZ, ROLE.DIRETOR, ROLE.SERVIDOR, ROLE.ESTAGIARIO]),
//   FlowController.allFlows
// );
// routes.get(
//   "/flows/:id",
//   protect,
//   authRole([ROLE.JUIZ, ROLE.DIRETOR, ROLE.SERVIDOR]),
//   FlowController.getFlow
// );

//Rotas de Fluxos
routes.post(
  "/newFlow",
  FlowController.store
);

routes.get(
  "/flows",
  FlowController.index
);

routes.get(
  "/flow/:id",
  FlowController.getById
);

routes.put(
  "/flow",
  FlowController.update
);

routes.delete(
  "/flow/:id",
  FlowController.delete
);

//Rotas de Etapas
routes.post(
  "/newStage",
  StageController.store
);

routes.get(
  "/stages",
  StageController.index
);

routes.get(
  "/stage/:id",
  StageController.getById
);

routes.put(
  "/stage",
  StageController.update
);

routes.delete(
  "/stage/:id",
  FlowController.delete
);


//Rotas de Etapas
routes.get("/unitys", UnityController.allUnitys);
routes.get(
  "/unityAdmins/:unity",
  protect,
  authRole([ROLE.JUIZ, ROLE.DIRETOR, ROLE.SERVIDOR, ROLE.ESTAGIARIO]),
  UnityController.unityAdmins
);
routes.post(
  "/newUnity",
  protect,
  authRole([ROLE.DIRETOR]),
  UnityController.createUnity
);

//  Rotas de units
routes.post(
  "/newUnit",
  UnitController.store
);

routes.get("/units", UnitController.index);

routes.get(
  "/unitAdmins/:id",
  UnitController.getById
);

routes.put(
  "/updateUnit",
  UnitController.update
);

routes.delete(
  "/deleteUnit",
  UnitController.delete
);

// rotas de Role
routes.post(
  "/newRole",
  RoleController.store
);

routes.get("/role", RoleController.index);

routes.get(
  "/roleAdmins/:id",
  RoleController.getById
);

routes.put(
  "/updateRole",
  RoleController.update
);

routes.delete(
  "/deleteRole",
  RoleController.delete
);

// Rotas de User
routes.post(
  "/login",
  UserContoller.login
);

routes.post(
  "/newUser",
  UserContoller.store
);

routes.get(
  "/users",
  UserContoller.index
);
routes.get(
  "/user",
  UserContoller.getById
);

routes.put(
  "/updateUser",
  UserContoller.update
);

routes.delete(
  "/deleteUser",
  UserContoller.delete
);

routes.post(
  "/deleteUnity",
  protect,
  authRole([ROLE.DIRETOR]),
  UnityController.deleteUnity
);

export default routes;
