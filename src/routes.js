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

routes.get("/", (_req, res) => {
  res.json({
    status: "OK",
    message: "Up and running",
  });
});

routes.get("/priorities", ProcessController.getPriorities);

//Rotas de processos
routes.get("/processes", ProcessController.index);
routes.get("/processes/:filter", ProcessController.index);
routes.get(
  "/processes/:idFlow",
  protect,
  authRole([
    ROLE.JUIZ,
    ROLE.DIRETOR,
    ROLE.SERVIDOR,
    ROLE.ESTAGIARIO,
    ROLE.ADMINISTRADOR,
  ]),
  ProcessController.processesInFlow
);
routes.get("/getOneProcess/:id", ProcessController.getById);

routes.post("/newProcess", ProcessController.store);
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
routes.put(
  "/processUpdateStage/",
  protect,
  ProcessController.updateProcessStage
);
routes.put(
  "/processNewObservation/",
  protect,
  ProcessController.newObservation
);

//Rotas de Fluxos
routes.post("/newFlow", FlowController.store);

routes.get("/flow/:idFlow/usersToNotify", FlowController.getUsersToNotify);

routes.get("/flows/process/:record", FlowController.indexByRecord);

routes.get("/flows", FlowController.index);

routes.get("/flows/:filter", FlowController.index);

routes.get("/flow/:idFlow", FlowController.getById);

routes.get("/flowStages", FlowController.getFlowStages);

routes.get("/flowSequences/:idFlow", FlowController.getByIdWithSequence);

routes.put("/flow", FlowController.update);

routes.delete("/flow/:idFlow", FlowController.delete);

routes.delete(
  "/flow/:idFlow/:idStageA/:idStageB",
  FlowController.deleteFlowStage
);

//Rotas de Etapas
routes.post("/newStage", StageController.store);

routes.get("/stages", StageController.index);

routes.get("/stages/:filter", StageController.index);

routes.get("/stage/:id", StageController.getById);

routes.delete("/deleteStage/:id", StageController.delete);

//  Rotas de units
routes.post("/newUnit", UnitController.store);

routes.get("/units", UnitController.index);

routes.get("/units/:filter", UnitController.index);

routes.put("/setUnitAdmin", UnitController.setUnitAdmin);
routes.put("/removeUnitAdmin", UnitController.removeUnitAdmin);

routes.get("/unitAdmins/:id", UnitController.getAdminsByUnitId);

routes.put("/updateUnit", UnitController.update);

routes.delete("/deleteUnit", UnitController.delete);

// rotas de Role
routes.post("/newRole", RoleController.store);

routes.get("/role", RoleController.index);

routes.get("/roleAdmins/:id", RoleController.getById);

routes.put("/updateRole", RoleController.update);

routes.delete("/deleteRole", RoleController.delete);

// Rotas de User
// TODO: Mover para User
routes.get(
  "/allUser",
  protect,
  authRole([ROLE.ADMINISTRADOR, ROLE.DIRETOR, ROLE.SERVIDOR]),
  UserContoller.allUser
);
// TODO: Mover para User
routes.post("/login", UserContoller.login);

// TODO: Mover para User
routes.put("/updateUser/:id", UserContoller.updateUser);
routes.put(
  "/updateUserEmailAndPassword/:id",
  UserContoller.updateUserEmailAndPassword
);

// TODO: Mover para User
routes.post("/updateUserPassword/:id", UserContoller.editPassword);

// TODO: Mover para User
routes.post("/acceptRequest/:id", protect, UserContoller.acceptRequest);
// TODO: Mover para User
routes.delete("/deleteRequest/:id", protect, UserContoller.deleteRequest);

routes.put("/updateUserRole", UserContoller.updateRole);

routes.post("/newUser", UserContoller.store);

routes.get("/user/:id", UserContoller.getByIdParam);

routes.delete("/deleteUser/:id", UserContoller.deleteByParam);

export default routes;
