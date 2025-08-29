import { Router } from "express";
import {
  createPublisher,
  deletePublisher,
  showAllPublishers,
  showPublisherDetails,
  updatePublisher,
  showUpdateForm,
  showCreateForm,
} from "../controllers/publisherController.js";

const publisherRouter = Router();

publisherRouter.get("/", showAllPublishers);
publisherRouter.post("/create", createPublisher);

publisherRouter.get('/create', showCreateForm)

publisherRouter.get("/:id", showPublisherDetails);

publisherRouter.get("/update/:id", showUpdateForm);
publisherRouter.post("/update/:id", updatePublisher);
publisherRouter.post("/delete/:id", deletePublisher);

export default publisherRouter;
