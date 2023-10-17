const express = require('express')
const app = express()
const port = 3000
const router = require("./routes")
const errorHandler = require("./middlewares/errorHandler.js")
const morgan = require("morgan")
const swaggerUI = require("swagger-ui-express")
const swaggerDocument = require("./swagger.json")

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument))

//penerapan morgan untuk logging
app.use(morgan("common"))

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(router);

// error handling
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})