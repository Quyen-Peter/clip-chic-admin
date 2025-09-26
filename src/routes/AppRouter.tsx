import { Routes, Route } from "react-router-dom";
import Header from '../component/Header';


const AppRouter = () => {
    return (
        <Routes>
            <Route path="/" element={<Header />} />
        </Routes>
    )
}

export default AppRouter;