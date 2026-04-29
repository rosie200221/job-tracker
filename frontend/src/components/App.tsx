import {Routes, Route} from "react-router"
import AppLayout from "../app/AppLayout";
import DashboardPage from "../pages/DashboardPage";
import ApplicationsPage from "../pages/ApplicationsPage";
import NewApplicationPage from "../pages/NewApplicationPage";
import EmailImportPage from "../pages/EmailImportPage"
function App() {

    return(
        <Routes>
            <Route path="/" element={<AppLayout />}>
            
              <Route index element={<DashboardPage />} /> 
              <Route path ="applications" element={<ApplicationsPage />} /> 
              <Route path = "applications/new" element={<NewApplicationPage />} />
              <Route path = "email-import" element={<EmailImportPage />} /> 
            </Route>
        </Routes>
    )
}

export default App