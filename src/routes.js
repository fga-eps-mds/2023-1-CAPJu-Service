import { Router } from "express";
import FlowController from "./controllers/FlowController.js";
import ProcessController from "./controllers/ProcessController.js";
import StageController from "./controllers/StageController.js";

const routes = Router();

routes.get("/processes", ProcessController.allProcesses);
routes.post("/newProcess", ProcessController.createProcess);

routes.get("/flows", FlowController.allFlows);
routes.post("/newFlow", FlowController.createFlow);
routes.post("/deleteFlow", FlowController.deleteFlow);
routes.put("/editFlow", FlowController.editFlow);

routes.get("/stages", StageController.allStages);
routes.post("/newStage", StageController.createStage);
routes.post("/deleteStage", StageController.deleteStage);

export default routes;
