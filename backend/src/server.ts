import express from "express"
import cors from "cors"
import applicationRoutes from "./routes/applicationRoutes.js"

const app = express()
const PORT = 4000

app.use(cors())
app.use(express.json())

app.get("/api/health", (_req, res) => {
    res.json({ message: "API is running"})
})

app.use("/api/applications", applicationRoutes)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
})