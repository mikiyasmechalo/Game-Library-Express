import {
  getAllPublishers,
  getPublisherDetails,
  createPublisher as createPublisherDB,
  updatePublisher as updatePublisherDB,
  deletePublisher as deletePublisherDB,
} from "../db/queries/publisherQueries.js";

async function showAllPublishers(req, res) {
  const publishers = await getAllPublishers();
  res.render("all/allPublishers", { publishers });
}
export async function showCreateForm(req, res) {
  res.render("create", { creating: "publisher" });
}

export async function showUpdateForm(req, res) {
  const id = req.params.id;
  const publisher = await getPublisherDetails(id);
  res.render("edit", { editing: "publisher", publisher: publisher });
}

async function showPublisherDetails(req, res) {
  const publisherId = req.params.id;
  const publisher = await getPublisherDetails(publisherId);
  res.render("detail/publisherDetails", { publisher });
}

async function createPublisher(req, res) {
  try {
    const { name, description } = req.body;
    await createPublisherDB(name, description);
    res.redirect("/publishers");
  } catch (error) {
    console.error("Error creating publisher:", err);
    res.render("error", { error });
  }
}

async function updatePublisher(req, res) {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    await updatePublisherDB(id, name, description);
    res.redirect("/publishers");
  } catch (error) {
    console.error("Error updating publisher:", err);
    res.render("error", { error });
  }
}

async function deletePublisher(req, res) {
  try {
    const { id } = req.params;
    await deletePublisherDB(id);
    res.redirect("/publishers");
  } catch (error) {
    console.error("Error deleting publisher:", err);
    res.render("error", { error });
  }
}

export {
  createPublisher,
  updatePublisher,
  deletePublisher,
  showAllPublishers,
  showPublisherDetails,
};
