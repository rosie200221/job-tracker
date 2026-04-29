import {Router} from "express"
import {prisma} from "../lib/prisma.js"
import { stat } from "node:fs"
import {createEvent} from "ics"


const router = Router()


router.post("/extract", async(req, res) => {
    try {
        const {text} = req.body

        if(!text || typeof text !== "string") {
            return res.status(400).json({
                message:"Text is required",
            })
        }

        const notes = extractJobTasks(text)



        res.json({notes})
    } catch(error){
        console.error("Error extracting job details: ", error)
        res.status(500).json({message: "Failed to extract job details"})
    }
})

function extractJobTasks(text: string){
    const lines = text
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)

        const sections = {

            responsibilities: [
                "your responsibilities",
                "responsibilities",
                "your tasks",
                "tasks",
                "what you will do",
                "what you'll do",
                "your role",
                "the role",
                "activities",
            ],

            requirements: [
                "your profile",
                "requirements",
                "your requirements",
                "qualifications",
                "your qualifications",
                "what you bring",
                "core requirements"
            ],

            benefits : [
                "what we offer",
                "benefits",
                "your benefits",
                "why us",
                "what you can count on",
                "we offer you",
                "why join us"
            ]
        }


        function extractSection(keywords: string[]) {
            const startIndex = lines.findIndex((line) => 
                keywords.some((k) => line.toLowerCase().includes(k))
            )

            if (startIndex === -1) return []

            const extracted: string[] = []

            for (let i = startIndex + 1; i<lines.length; i++) {
                const line = lines [i]!
                const lower = line.toLowerCase()

                const isNewSection = Object.values(sections).some((group) => 
                    group.some((k) => lower?.includes(k))
                )

                if(isNewSection) break

                extracted.push(line)
            }

            return extracted
        }


        const responsibilties = extractSection(sections.responsibilities)
        const requirements = extractSection(sections.requirements)
        const benefits = extractSection(sections.benefits)

        return [
            responsibilties.length
            ? "Responsibilities:\n" + responsibilties.join("\n") : "",

            requirements.length
            ? "\n\nRequirements:\n" + requirements.join("\n") : "", 

            benefits.length
            ?"\n\nBenefits:\n" + benefits.join("\n") :"", 
        ]

        .filter(Boolean)
        .join("")

}

router.post("/extract-interview", async(req, res) => {

        try{
            const {text} = req.body

            if(!text || typeof text !== "string") {
                return res.status(400).json({ message: "Text is required"})
            }

            const extracted = extractInterviewDetails(text)

            res.json(extracted)
        } catch(error){
            console.error("Error extracting interview details: ", error)
            res.status(500).json({message: "Failed to extract interview details"})
        }
})

function extractInterviewDetails(text:string) {
    const lowerText = text.toLowerCase()

    const isInterview = 
        lowerText.includes("interview") ||
        lowerText.includes("meeting") ||
        lowerText.includes("call") ||
        lowerText.includes("teams") ||
        lowerText.includes("zoom");

        const meetingLinkMatch = text.match(/https?:\/\/\S+/i)
        const meetingLink = meetingLinkMatch ? meetingLinkMatch[0] : ""

        const dateMatch = 
            text.match(/\b\d{4}-\d{2}-\d{2}\b/) ||
            text.match(/\b\d{1,2}[./-]\d{1,2}[./-]\d{2,4}\b/) ||
            text.match(
                /\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s+\d{1,2}(?:st|nd|rd|th)?(?:,\s*\d{4})?/i
            )

            const rawInterviewDate = dateMatch ? dateMatch[0] : ""
            
            const interviewDate = rawInterviewDate ? normalizeDate(rawInterviewDate) : ""

            const timeMatch = text.match(/\b\d{1,2}:\d{2}\s*(?:am|pm)?\b/i)
            const interviewTime = timeMatch ? timeMatch[0] : "";

            const notes = [
                isInterview ? "Possible interview email detected." : "Interview keywords not clearly detected.",
                meetingLink ? `Meeting link: ${meetingLink}` : "",
                interviewDate ? `Date: ${interviewDate}` : "",
                interviewTime
            ]

            .filter(Boolean)
            .join("\n")


            return {
                status: isInterview ? "INTERVIEW" : "", 
                interviewTitle: isInterview ? "Interview" : "",
                interviewDate,
                interviewTime,
                meetingLink,
                notes
            }
}

router.post("/calendar-event", async(req, res) => {

    try{
        const{
            title, 
            date, 
            time, 
            durationMinutes, 
            location,
            meetingLink, 
            notes,
        } = req.body

        if(!title || !date || !time) {
            return res.status(400).json({
                message: "title, date and times are required"
            })
        }

        const [year, month, day] = date.split("-").map(Number)
        const [hour, minute] = time.split(":").map(Number)

        const event = {
            title,
            description: [notes, meetingLink ? `Meeting link: ${meetingLink}` : ""]
                .filter(Boolean)
                .join("\n\n"),
            location: location || meetingLink || "",
            start: [year, month, day, hour, minute] as [
                number,
                number,
                number,
                number,
                number
            ],
            duration: {
                minutes: durationMinutes || 60
            },
        }

        createEvent(event, (error, value) => {
            if (error) {
                console.error(error)
                return res.status(500).json({
                    message: "Failed to create a calendar file",
                })
            }

            res.setHeader("Content-Type", "text/calendar")
            res.setHeader(
                "Content-Disposition",
                'attachment; filename= "interview.ics"'
            )

            res.send(value)


        })
    } catch(error) {
        console.error("Error creating calendar event:", error)
        res.status(500).json({message:"Failed to create calendar event" })
    }
})

function normalizeDate(dateText: string){
    const cleaned = dateText.replace(/(st|nd|rd|th)/gi, "")

    const parsedDate = new Date(cleaned)

    if (Number.isNaN(parsedDate.getTime())) {
        return ""
    }

    const year = parsedDate.getFullYear()
    const month = String(parsedDate.getMonth() + 1).padStart(2, "0")
    const day = String(parsedDate.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
}



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


router.patch("/:id" , async(req, res) => {
    try{
        const {id} = req.params
        const {companyName, roleTitle, location, status, appliedDate, notes} = req.body

        const updatedApplication = await prisma.application.update({
            where: {id},
            data: {
                ...(companyName !== undefined ? {companyName} : {} ),
                ...(roleTitle !== undefined ? {roleTitle} : {}),
                ...(location !== undefined ? {location} : {}),
                ...(status !== undefined ? {status} : {}),
                ...(appliedDate !== undefined ? 
                    {appliedDate: appliedDate ? new Date(appliedDate) : null}
                : {}), 
                ...(notes !== undefined ? {notes}: {}),
                updatedAt: new Date()
            }
        })
        
        res.json(updatedApplication)
    } catch (error) {
        console.error("Error updating application: ", error)
        res.status(500).json({message: "Failed to update application"})
    }
})

export default router