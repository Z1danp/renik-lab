import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { env } from "./config/env"
import routes from "./routes/index"

const app = express()

app.use(cors({ origin: "http://localhost:3000", credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.use("/api/v1", routes)

app.listen(env.PORT, () => {
  console.log(`Server running on http://localhost:${env.PORT}`)
})

export default app
