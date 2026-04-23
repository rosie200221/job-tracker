import {Router} from "express"
import {prisma} from "../lib/prisma.js"


const router = Router()

router.get("/", async (_req, res) => {
    try{
        const applications = await prisma.application.findMany({
            orderBy: {
                createdAt: "desc",
            },
        })
            res.json(applications)
    } catch (error){
        console.error("Error fetching applications:", error)
        res.status(500).json({message: "Failed to fetch applications"})
    }
})

router.post("/", async(req, res) => {

    try{
        const{
            companyName,
            roleTitle, 
            location,
            status,
            appliedDate,
            notes
        } = req.body

         if (!companyName || !roleTitle) {

            return res.status(400).json({
                 message: "companyName and roleTitle are required",
            })
        }

        const application = await prisma.application.create({
            data: {
                companyName,
                roleTitle,
                location,
                status,
                appliedDate: appliedDate ? new Date(appliedDate) : null, 
                notes,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })

        res.status(201).json(application)
    } catch(error) {
        console.error("Error creating applicatiom: ", error)
        res.status(500).json({message: "Failed to create application"})
    }
})

export default router