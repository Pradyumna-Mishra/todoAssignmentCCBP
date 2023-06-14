const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;

app.use(express.json());

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running On Port 3000");
    });
  } catch (e) {
    console.log(`DB ERROR: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const hasPriorityAndStatusProperty = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  const { search_q = "", priority, status } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}' AND priority = '${priority}';`;
      break;
    case hasPriorityProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND priority = '${priority}';`;
      break;
    case hasStatusProperty(request.query):
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%' AND status = '${status}';`;
      break;
    default:
      getTodoQuery = `SELECT * FROM todo WHERE todo LIKE '%${search_q}%';`;
  }
  data = await db.all(getTodoQuery);
  response.send(data);
});

app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const todoData = await db.get(getTodoQuery);
  response.send(todoData);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const postTodoQuery = `INSERT INTO todo (id,todo,priority,status) VALUES (${id},'${todo}','${priority}','${status}');`;
  await db.run(postTodoQuery);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  let updateColum = "";
  const updatedBody = request.body;

  switch (true) {
    case updatedBody.status !== undefined:
      updateColum = "Status";
      console.log(updateColum);
      break;
    case updatedBody.priority !== undefined:
      updateColum = "Priority";
      console.log(updateColum);
      break;
    case updatedBody.todo !== undefined:
      updateColum = "Todo";
      console.log(updateColum);
      break;
  }

  const getPreviousValue = `SELECT * FROM todo WHERE id
=${todoId};`;
  const previousData = await db.get(getPreviousValue);

  const {
    todo = previousData.todo,
    priority = previousData.priority,
    status = previousData.status,
  } = request.body;

  updatedTodoQuery = `UPDATE todo SET todo='${todo}',priority='${priority},status='${status}' WHERE id = ${todoId};`;

  await db.run(updatedTodoQuery);

  response.send(`${updateColum} Updated`);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `DELETE FROM todo WHERE id=${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});

module.exports = app;
