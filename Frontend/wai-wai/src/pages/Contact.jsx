import React from "react";

const Contact = () => {
  return (
    <section
      className="container container--narrow"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <h1>Contact Us</h1>
      <p>
        We’d love to hear from you. For product questions, partnerships, or
        support, email us at{" "}
        <a href="mailto:hello@wevolve.ai">hello@wevolve.ai</a>.
      </p>
      <p>
        You can also reach us on LinkedIn and GitHub via the links in the
        footer.
      </p>
    </section>
  );
};

export default Contact;
