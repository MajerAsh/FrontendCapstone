import MyFinds from "./pages/MyFinds";
import Welcome from "./pages/Welcome";
import { Route, Routes } from "react-router";
import Layout from "./layout/Layout";
import Login from "./auth/Login";
import Register from "./auth/Register";
import CreateFind from "./pages/CreateFind";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Welcome />} />
        <Route path="/my-finds" element={<MyFinds />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/create" element={<CreateFind />} />
      </Route>
    </Routes>
  );
}
