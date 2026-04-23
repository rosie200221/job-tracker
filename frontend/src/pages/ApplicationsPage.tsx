import {useEffect, useState} from "react"


type ApplicationStatus = 
  | "APPLIED"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "GHOSTED";



type Application = {
    id: string, 
    companyName: string
    roleTitle: string
    location: string | null
    status: ApplicationStatus 
    appliedDate: string | null 
    notes: string | null
    createdAt: string
    updatedAt: string
}

function getStatusStyle(status: ApplicationStatus){
    switch(status) {

        case "APPLIED": 
            return{
                backgroundColor: "#e0f2fe",
                color: "#075985",
            }

        case "INTERVIEW": 
            return{
                backgroundColor: "#ede9fe",
                color: "#5b21b6",
            }

        case "OFFER": 
            return{
                backgroundColor: "#dcfce7",
                color: "#166534",
            }

        case "REJECTED":
            return{
                backgroundColor: "#fee2e2",
                color: "#991b1b",
            }

        case "GHOSTED":
            return{
                backgroundColor: "#f3f4f6",
                color: "#374151",
            }

        default:
            return {
                backgroundColor: "#f3f4f6",
                color: "#111827",
            }
    }
}


function formatDate(dateString: string | null) {

    if (!dateString) return "-"

    const date = new Date(dateString)

    if (Number.isNaN(date.getTime())) {
        return "-"
    }

    return date.toLocaleDateString()
}

function ApplicationsPage() {

    const [applications, setApplications] = useState<Application[]>([])
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")


    useEffect(() => {
        let ignore = false

        async function fetchApplications(){
            try {
                setLoading(true)
                setError("")

                const response = await fetch("http://localhost:4000/api/applications")

                if (!response.ok) {
                    throw new Error("failed to fetch applications")
                }

                const data: Application[] = await response.json()

                if(!ignore) {
                    setApplications(data)
                }
            } catch(err) {
                if(!ignore) {
                    setError("Could not load applications")
                    console.error(err)
                }
            }   finally {
                if(!ignore) {
                    setLoading(false)
                }
            }
        }

        fetchApplications()

        return () => {
            ignore = true
        }
    }, [])


    return(

        <div> 
            <div
                style= {{
                    display: "flex", 
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "24px"
                }}>

            <div>
                <h2 style={{margin: 0}}>Applications</h2>
                <p style={{marginTop: "8px", color: "#666"}}>
                    Track all job applications in one place
                </p>
            </div>

            <button
                style={{
                    border: "none",
                    backgroundColor: "#111827",
                    color: "white",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    cursor: "pointer",
                }}>
                    Add Application
                </button>
            </div>

            {loading ? (
                <div
                    style={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "24px"
                    }}>
                    <p style={{margin:0}}>Loading applications...</p>
                    </div>
            ): error ? (
                <div
                    style={{
                        backgroundColor: "#fee2e2",
                        border: "1px solid #fecaca",
                        borderRadius: "12px",
                        padding: "24px",
                        color: "#991b1b",
                    }}>

                <p style={{margin: 0}}>{error} </p> 
                </div>

            ): applications.length === 0 ? (

                <div
                    style={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        padding: "24px",
                    }}>
                    
                    <h3 style={{marginTop:0}}>No applications yet</h3>
                    <p style={{marginBottom:0, color:"#666"}}>
                        add application to start tracking job hunting
                    </p>
                </div> 
            ): (
                <div
                    style={{
                        overflowX: "auto",
                        backgroundColor: "white",
                        borderRadius: "12px",
                        border: "1px solid #e5e7eb"
                    }}>
                
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                    }}>

                    <thead>
                        <tr style={{backgroundColor: "#f9fafb", textAlign: "left" }}>
                            <th style= {{padding: "14px 16px"}}>Company</th>
                            <th style= {{padding: "14px 16px"}}>Role</th>
                            <th style= {{padding: "14px 16px"}}>Location</th>
                            <th style= {{padding: "14px 16px"}}>Status</th>
                            <th style= {{padding: "14px 16px"}}>Applied Date</th>
                            <th style= {{padding: "14px 16px"}}>Notes</th>
                        </tr>
                    </thead>

                        <tbody>
                            {applications.map((application)=> (
                                <tr
                                    key={application.id}
                                    style={{
                                        borderTop: "1px solid #e5e7eb"
                                    }}>

                                        <td style={{padding: "14px 16px", fontWeight:600}}>
                                            {application.companyName}
                                        </td>

                                        <td style={{padding: "14px 16px", fontWeight:600}}>
                                            {application.roleTitle}
                                        </td>

                                        <td style={{padding: "14px 16px", fontWeight:600}}>
                                            {application.location || "-"}
                                        </td>


                                        <td style={{padding: "14px 16px", fontWeight:600}}>
                                            <span
                                                style={{
                                                    ...getStatusStyle(application.status),
                                                    padding: "6px 10px",
                                                    borderRadius: "999px",
                                                    fontSize: "14px",
                                                    fontWeight: 600,
                                                    display: "inline-block"
                                                }}>
                                                    {application.status}
                                                </span>
                                        </td>

                                        <td style={{padding: "14px 16px", fontWeight:600}}>
                                            {formatDate(application.appliedDate)}
                                        </td>

                                        <td style={{padding: "14px 16px", fontWeight:600}}>
                                            {application.notes || "-"}
                                        </td>
                                    </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default ApplicationsPage