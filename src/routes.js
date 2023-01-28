import { Router } from "express";
import FlowController from "./controllers/FlowController.js";
import ProcessController from "./controllers/ProcessController.js";
import StageController from "./controllers/StageController.js";
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
  "/processes/:idFlow",
  protect,
  authRole([ROLE.JUIZ, ROLE.DIRETOR, ROLE.SERVIDOR, ROLE.ESTAGIARIO, ROLE.ADMINISTRADOR]),
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
  "/updateProcess",
  protect,
  authRole([ROLE.DIRETOR, ROLE.SERVIDOR, ROLE.ADMINISTRADOR]),
  ProcessController.updateProcess
);
routes.delete(
  "/deleteProcess/:record",
  protect,
  authRole([ROLE.DIRETOR, ROLE.SERVIDOR, ROLE.ADMINISTRADOR]),
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
routes.get(
  "/getMailContents",
  FlowController.getMailContentsEndpoint
);

routes.post(
  "/newFlow",
  FlowController.store
);

routes.get(
  "/flow/:idFlow/usersToNotify",
  FlowController.getUsersToNotify
);

routes.get(
  "/flows/process/:record",
  FlowController.indexByRecord
);

routes.get(
  "/flows",
  FlowController.index
);

routes.get(
  "/flow/:idFlow",
  FlowController.getById
);

routes.get(
  "/flowStages",
  FlowController.getFlowStages
);

routes.get(
  "/flowSequences/:idFlow",
  FlowController.getByIdWithSequence
);

routes.put(
  "/flow",
  FlowController.update
);

routes.delete(
  "/flow/:idFlow",
  FlowController.delete
);

routes.delete(
  "/flow/:idFlow/:idStageA/:idStageB",
  FlowController.deleteFlowStage
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
  "/deleteStage/:id",
  StageController.delete
);


//Rotas de Etapas
// routes.get("/unitys", UnityController.allUnitys);
// routes.get(
//   "/unityAdmins/:unity",
//   protect,
//   authRole([ROLE.JUIZ, ROLE.DIRETOR, ROLE.SERVIDOR, ROLE.ESTAGIARIO]),
//   UnityController.unityAdmins
// );
// routes.post(
//   "/newUnity",
//   protect,
//   authRole([ROLE.DIRETOR]),
//   UnityController.createUnity
// );

//  Rotas de units
routes.post(
  "/newUnit",
  UnitController.store
);

routes.get("/units", UnitController.index);

routes.put("/setUnitAdmin", UnitController.setUnitAdmin);
routes.put("/removeUnitAdmin", UnitController.removeUnitAdmin);

routes.get(
  "/unitAdmins/:id",
  UnitController.getAdminsByUnitId
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
// TODO: Mover para User
routes.get(
	"/allUser",
	protect,
	authRole([ROLE.ADMINISTRADOR, ROLE.DIRETOR, ROLE.SERVIDOR]),
	UserContoller.allUser,
);
// TODO: Mover para User
routes.post(
  "/login",
  UserContoller.login
);

// TODO: Mover para User
routes.put("/updateUser/:id", UserContoller.updateUser);

// TODO: Mover para User
routes.post("/updateUserPassword/:id", UserContoller.editPassword);

// TODO: Mover para User
routes.post("/acceptRequest/:id", protect, UserContoller.acceptRequest);
// TODO: Mover para User
routes.delete("/deleteRequest/:id", protect, UserContoller.deleteRequest);


routes.put("/updateUserRole", UserContoller.updateRole);

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

routes.get(
  "/user/:id",
  UserContoller.getByIdParam
);

/*routes.put(
  "/updateUser",
  UserContoller.update
);*/

/*routes.delete(
  "/deleteUser",
  UserContoller.delete
);*/

routes.delete(
  "/deleteUser/:id",
  UserContoller.deleteByParam
);

// routes.post(
//   "/deleteUnity",
//   protect,
//   authRole([ROLE.DIRETOR]),
//   UnityController.deleteUnity
// );

export default routes;
