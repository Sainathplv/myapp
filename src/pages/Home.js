import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const Home = () => {
  const user = useSelector((state) => state.auth.user);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Welcome to Our Application</h1>
      {user ? (
        <h2>Hi, {user.first_name}!</h2>
      ) : (
        <>
          <p>Please <Link to="/login">Login</Link> or <Link to="/register">Register</Link></p>
        </>
      )}
    </div>
  );
};

export default Home;