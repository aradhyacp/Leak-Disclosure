import React from "react";
import "./NotFound.css";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen notfound">
      <div className="noise"></div>
      <div className="overlay"></div>
      <div className="terminal">
        <h1>
          Error <span className="errorcode">404</span>
        </h1>
        <p className="output">
          The page you are looking for might have been removed, had its name
          changed or is temporarily unavailable.
        </p>
        <p className="output">
          {" "}
          Please try to go <Link to="/">go back</Link> or{" "}
          <Link to="/">Return to homepage</Link>
        </p>
        <p className="output">Good luck.</p>
      </div>
    </div>
  );
};

export default NotFound;
