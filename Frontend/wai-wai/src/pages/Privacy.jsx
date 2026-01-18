import React from "react";

const Privacy = () => {
  return (
    <section
      className="container container--narrow"
      style={{ paddingTop: "2rem", paddingBottom: "2rem" }}
    >
      <h1>Privacy Policy</h1>
      <p>
        We value your privacy. We only collect information necessary to provide
        our services, and we do not sell personal data. Access to stored data is
        restricted and protected.
      </p>
      <h3>Data Usage</h3>
      <p>
        Submitted resumes and job data may be processed to generate insights and
        improve feature accuracy. You can request deletion of your data at any
        time.
      </p>
      <h3>Contact</h3>
      <p>
        Questions about privacy? Reach us at{" "}
        <a href="mailto:privacy@wevolve.ai">privacy@wevolve.ai</a>.
      </p>
    </section>
  );
};

export default Privacy;
