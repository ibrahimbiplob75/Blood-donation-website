import { Outlet } from "react-router-dom";
import Header from "./shared/Header.jsx";
import Footer from "./shared/Footer.jsx";

const App = () => {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default App;
