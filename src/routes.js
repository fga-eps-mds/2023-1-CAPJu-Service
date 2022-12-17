import { Router } from "express";
import FlowController from "./controllers/FlowController.js";
import ProcessController from "./controllers/ProcessController.js";
import StageController from "./controllers/StageController.js";
import UnityController from "./controllers/UnityController.js";
import UnitController from "./controllers/UnitController.js";
import RoleController from "./controllers/RoleController.js";
import { protect, authRole } from "./middleware/authMiddleware.js";
import { ROLE } from "./schemas/role.js";

const routes = Router();

//Rotas de processos
routes.get(
  "/processes",
  protect,
  authRole([ROLE.JUIZ, ROLE.DIRETOR, ROLE.SERVIDOR, ROLE.ESTAGIARIO]),
  ProcessController.allProcesses
);
routes.get(
  "/processes/:flowId",
  protect,
  authRole([ROLE.JUIZ, ROLE.DIRETOR, ROLE.SERVIDOR, ROLE.ESTAGIARIO]),
  ProcessController.processesInFlow
);
routes.get(
  "/getOneProcess/:id",
  protect,
  authRole([ROLE.DIRETOR, ROLE.SERVIDOR, ROLE.ESTAGIARIO]),
  ProcessController.getOneProcess
);
routes.post(
  "/newProcess",
  protect,
  authRole([ROLE.DIRETOR, ROLE.SERVIDOR, ROLE.ESTAGIARIO]),
  ProcessController.createProcess
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

//Rotas de Fluxos
routes.get(
  "/flows",
  protect,
  authRole([ROLE.JUIZ, ROLE.DIRETOR, ROLE.SERVIDOR, ROLE.ESTAGIARIO]),
  FlowController.allFlows
);
routes.get(
  "/flows/:id",
  protect,
  authRole([ROLE.JUIZ, ROLE.DIRETOR, ROLE.SERVIDOR]),
  FlowController.getFlow
);
routes.post(
  "/newFlow",
  protect,
  authRole([ROLE.DIRETOR, ROLE.SERVIDOR]),
  FlowController.createFlow
);
routes.post(
  "/deleteFlow",
  protect,
  authRole([ROLE.DIRETOR, ROLE.SERVIDOR]),
  FlowController.deleteFlow
);
routes.put(
  "/editFlow",
  protect,
  authRole([ROLE.DIRETOR, ROLE.SERVIDOR]),
  FlowController.editFlow
);

//Rotas de Etapas
routes.get(
  "/stages",
  protect,
  authRole([ROLE.JUIZ, ROLE.DIRETOR, ROLE.SERVIDOR, ROLE.ESTAGIARIO]),
  StageController.allStages
);
routes.post(
  "/newStage",
  protect,
  authRole([ROLE.DIRETOR, ROLE.SERVIDOR]),
  StageController.createStage
);
routes.post(
  "/deleteStage",
  protect,
  authRole([ROLE.DIRETOR, ROLE.SERVIDOR]),
  StageController.deleteStage
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

routes.post(
  "/newUnit",
  UnitController.store
);

routes.post(
  "/newRole",
  RoleController.store
);

routes.post(
  "/deleteUnity",
  protect,
  authRole([ROLE.DIRETOR]),
  UnityController.deleteUnity
);

export default routes;
