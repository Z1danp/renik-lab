import { Router } from "express"
import authRoutes from "./auth.routes"
import materialsRoutes from "./materials.routes"
import adminRoutes from "./admin/index"

const router = Router()

router.use("/auth", authRoutes)
router.use("/materials", materialsRoutes)
router.use("/inventory", materialsRoutes)
router.use("/admin", adminRoutes)

export default router
