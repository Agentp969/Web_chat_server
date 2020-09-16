const express = require("express");
const router = express.Router();

const controller = require("../controllers/authController");
const { validateBody, schemas } = require("../validations/authValidation");

router
  .route("/register")
  .post(validateBody(schemas.userSchema), controller.register);

router.route("/login").post(controller.login);

router.get("/", (req, res) => {
  return res.status(200).json("hello");
});

module.exports = router;
