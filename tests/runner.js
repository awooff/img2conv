const test = require("ava");
const request = require("supertest");
const _app = require("../app");

test("test express handler with supertest", async (t) => {
  // in async tests, it's useful to declare the number of
  // assertions this test contains
  t.plan(3);

  // define (or import) your express app here
  const app = _app();
  app.get("/", (req, res) => {
    res.json({
      message: "Hello, World!",
    });
  });

  // make a request with supertest
  const res = await request(app).get("/").send();

  // make assertions on the response
  t.is(res.ok, true);
  t.is(res.type, "application/json");
  t.like(res.body, {
    message: "Hello, World!",
  });
});
