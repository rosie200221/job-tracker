import {Link, Outlet} from "react-router"

function AppLayout(){

    return(
        <div style = {{minHeight: "100vh", fontFamily: "Arial, sans-serif"}}>


            <header
                style={{
                    padding: "16px 24px", 
                    borderBottom: "1px solid #ddd",
                    display: "flex", 
                    justifyContent: "space-between",
                    alignItems: "center",
                }}> 


                <h1 style={{margin:0, fontSize: "20px"}}> Job Application Tracker </h1>

                <nav style={{display:"flex", gap:"16px"}}>

                    <Link to = "/"> Dashboard </Link>
                    <Link to ="/applications"> Applications </Link>
                    <Link to = "/applications/new"> Add Application </Link>
                    <Link to ="/email-import"> Email Import </Link>

                </nav>
                </header>

                <main style = {{padding: "24px"}}>
                    <Outlet /> 
                </main>
        </div>
    )
}

export default AppLayout