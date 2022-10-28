const fastify = require("fastify")({
  logger: true, // Use  logger: { level: 'info' } to set the log level
});
const cors = require('@fastify/cors');
const poolMysql = require('./connection').default

fastify.addContentTypeParser("application/json", {}, (req, body, done) => {
  done(null, body.body);
});

fastify.post("/places", async (req, reply) => {
  req.log.info("Places  - POST - /places");

  try {
    const { name, description, image_url } = req.body;
    const pool = await poolMysql();

    const { insertId } = await pool.query('INSERT INTO Places SET ?', { name, description, image_url });

    reply.send({
      payload: {
        id: insertId,
        name,
        description,
        image_url
      },
      method: req.method,
      url: req.url,
      status: 200,
    });
  } catch (err) {
    console.log(err);

    reply.send({
      message: err.message,
      method: req.method,
      url: req.url,
      status: 500,
    });
  }
});

fastify.get("/places", async (req, reply) => {
  req.log.info("Places  - POST - /places");

  try {

    req.log.info("Places  - Execute SQL Query for Places");
    const pool = await poolMysql();

    const places = await pool.query("SELECT * FROM Places");

    reply.send({
      payload: places,
      method: req.method,
      url: req.url,
      status: 200,
    });
  } catch (err) {
    console.log(err);

    reply.send({
      message: err.message,
      method: req.method,
      url: req.url,
    });
  }
});

fastify.get("/attractions", async (req, reply) => {
  req.log.info("Attractions - POST - /attractions");

  try {

    req.log.info("Attractions - Execute SQL Query for Attractions");
    const pool = await poolMysql();

    const attractions = await pool.query("SELECT * FROM Attractions");

    reply.send({
      payload: attractions,
      method: req.method,
      url: req.url,
      status: 200,
    });
  } catch (err) {
    console.log(err);

    reply.send({
      message: err.message,
      method: req.method,
      url: req.url,
    });
  }
});

fastify.post("/attractions", async (req, reply) => {
  req.log.info("Attractions - POST - /attractions");

  try {
    const { name, description, image_url_1, image_url_2 } = req.body;
    const pool = await poolMysql();

    const { insertId } = await pool.query('INSERT INTO Attractions SET ?', { name, description, image_url_1, image_url_2 });

    reply.send({
      payload: {
        id: insertId,
        name,
        description,
        image_url_1,
        image_url_2
      },
      method: req.method,
      url: req.url,
      status: 200,
    });
  } catch (err) {
    console.log(err);

    reply.send({
      message: err.message,
      method: req.method,
      url: req.url,
      status: 500,
    });
  }
});


fastify.get("/routes", async (req, reply) => {
  req.log.info("Routes - POST - /routes");

  try {
    const pool = await poolMysql();

    const routes = await pool.query("SELECT * FROM Routes");
    const routesDetail = await pool.query("SELECT * FROM RoutesDetail");

    const placesIds = [...new Set(routesDetail.map((route) => route.placeId))];
    const places = await pool.query("SELECT * FROM Places where id in (?)", [placesIds.join(',')]);

    const routesMapper = routes.map((route) => {
      // find the places for this route
      const placesForRoute = routesDetail.filter((routeDetail) => routeDetail.routeId === route.id);
      const placesForRouteIds = placesForRoute.map((routeDetail) => {
        return places.find((place) => place.id === routeDetail.placeId); 
      });


      return {
        ...route,
        places: placesForRouteIds
      }
    });
    
    reply.send({
      payload: routesMapper,
      method: req.method,
      url: req.url,
      status: 200,
    });
  } catch (err) {
    console.log(err);

    reply.send({
      message: err.message,
      method: req.method,
      url: req.url,
      status: 500,
    });
  }
});

let bugCors = 1

const app = async (req, res) => {
  if (bugCors === 1) {
    await fastify.register(cors, {})
  }

  bugCors++

  await fastify.ready();

  fastify.server.emit("request", req, res);
};

exports.fastifyFunction = app;