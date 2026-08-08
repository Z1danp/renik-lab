import { Router } from "express"
import materialsRoutes from "./materials.routes"
import inventoryRoutes from "./inventory.routes"
import usersRoutes from "./users.routes"
import dashboardRoutes from "./dashboard.routes"
import auditRoutes from "./audit.routes"
import locationsRoutes from "./locations.routes"

const router = Router()

router.use("/materials", materialsRoutes)
router.use("/inventory", inventoryRoutes)
router.use("/users", usersRoutes)
router.use("/dashboard", dashboardRoutes)
router.use("/audit-logs", auditRoutes)
router.use("/ghs-classifications", locationsRoutes)
router.use("/storage-locations", locationsRoutes)

export default router
